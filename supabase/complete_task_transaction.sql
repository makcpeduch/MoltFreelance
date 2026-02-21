-- ============================================================================
-- complete_task_transaction()
-- Atomic function: settles a task, records execution, moves money.
-- Run this in the Supabase SQL Editor.
-- ============================================================================

CREATE OR REPLACE FUNCTION complete_task_transaction(
    p_task_id       UUID,
    p_agent_id      UUID,
    p_status        TEXT,        -- 'success' or 'failed'
    p_result_data   TEXT,        -- bot's output
    p_cost          NUMERIC,     -- final cost determined by the bot
    p_error_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER          -- runs with table-owner privileges (bypasses RLS)
AS $$
DECLARE
    v_task           RECORD;
    v_agent          RECORD;
    v_exec_status    execution_status;
    v_task_status    task_status;
    v_platform_fee   NUMERIC;
    v_dev_payout     NUMERIC;
    v_fee_pct        NUMERIC;
    v_execution_id   UUID;
    v_transaction_id UUID;
BEGIN
    -- ── 1. Lock and fetch the task ──────────────────────────────────────
    SELECT * INTO v_task
    FROM tasks
    WHERE id = p_task_id
    FOR UPDATE;                  -- row-level lock prevents double-completion

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Task not found', 'code', 404);
    END IF;

    IF v_task.status NOT IN ('open', 'in_progress') THEN
        RETURN jsonb_build_object(
            'error', 'Task is already ' || v_task.status::TEXT,
            'code', 409
        );
    END IF;

    IF v_task.claimed_by_agent IS DISTINCT FROM p_agent_id THEN
        RETURN jsonb_build_object('error', 'Agent did not claim this task', 'code', 403);
    END IF;

    -- ── 2. Fetch the agent (for developer_id) ──────────────────────────
    SELECT * INTO v_agent
    FROM agents
    WHERE id = p_agent_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Agent not found', 'code', 404);
    END IF;

    -- ── 3. Map incoming status strings to DB enums ─────────────────────
    IF p_status = 'success' THEN
        v_exec_status := 'success';
        v_task_status := 'completed';
    ELSE
        v_exec_status := 'failed';
        v_task_status := 'failed';
    END IF;

    -- ── 4. Check client balance ────────────────────────────────────────
    IF p_status = 'success' AND p_cost > 0 THEN
        IF (SELECT balance FROM profiles WHERE id = v_task.client_id) < p_cost THEN
            RETURN jsonb_build_object(
                'error', 'Insufficient client balance',
                'code', 402
            );
        END IF;
    END IF;

    -- ── 5. Update task status ──────────────────────────────────────────
    UPDATE tasks
    SET status     = v_task_status,
        budget     = p_cost,
        updated_at = now()
    WHERE id = p_task_id;

    -- ── 6. Create task_execution record ────────────────────────────────
    INSERT INTO task_executions (
        task_id, agent_id, status, output_result,
        started_at, completed_at, processing_time_ms
    ) VALUES (
        p_task_id, p_agent_id, v_exec_status, COALESCE(p_result_data, p_error_message),
        v_task.updated_at, now(),
        EXTRACT(EPOCH FROM (now() - v_task.updated_at))::INT * 1000
    )
    RETURNING id INTO v_execution_id;

    -- ── 7. Financial settlement (only on success with cost > 0) ────────
    IF p_status = 'success' AND p_cost > 0 THEN
        -- Read platform fee percentage from config (default 70%)
        SELECT value::NUMERIC INTO v_fee_pct
        FROM platform_config
        WHERE key = 'platform_fee_percent';
        v_fee_pct := COALESCE(v_fee_pct, 70);

        v_platform_fee := ROUND(p_cost * (v_fee_pct / 100.0), 4);
        v_dev_payout   := p_cost - v_platform_fee;

        -- 7a. Deduct from client balance
        UPDATE profiles
        SET balance    = balance - p_cost,
            updated_at = now()
        WHERE id = v_task.client_id;

        -- 7b. Credit developer balance
        UPDATE profiles
        SET balance    = balance + v_dev_payout,
            updated_at = now()
        WHERE id = v_agent.developer_id;

        -- 7c. Record transaction
        INSERT INTO transactions (
            task_id, execution_id, client_id, developer_id,
            amount, platform_fee, developer_payout, status
        ) VALUES (
            p_task_id, v_execution_id, v_task.client_id, v_agent.developer_id,
            p_cost, v_platform_fee, v_dev_payout, 'completed'
        )
        RETURNING id INTO v_transaction_id;
    END IF;

    -- ── 8. Update agent stats ──────────────────────────────────────────
    IF p_status = 'success' THEN
        UPDATE agents
        SET total_tasks_completed = total_tasks_completed + 1,
            updated_at            = now()
        WHERE id = p_agent_id;
    END IF;

    -- ── 9. Return success ──────────────────────────────────────────────
    RETURN jsonb_build_object(
        'success', true,
        'execution_id', v_execution_id,
        'transaction_id', v_transaction_id,
        'task_status', v_task_status::TEXT,
        'cost', p_cost,
        'platform_fee', v_platform_fee,
        'developer_payout', v_dev_payout
    );
END;
$$;
