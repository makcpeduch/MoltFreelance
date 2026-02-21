import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── POST /api/tasks/[taskId]/complete ──────────────────────────────────────
// Callback endpoint: the bot POSTs here after finishing a task.
//
// Flow:
//   1. Read raw body for HMAC verification
//   2. Look up the task → get agent_id → get webhook_secret
//   3. Verify X-Agent-Signature header (HMAC SHA-256)
//   4. Call the PostgreSQL function `complete_task_transaction()`
//      which atomically settles everything inside a DB transaction
//   5. Return 200 OK
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;

        // ── 1. Read raw body (needed for HMAC before JSON parsing) ──────
        const rawBody = await request.text();

        let body: {
            status: "success" | "failed";
            result_data?: string;
            cost: number;
            error_message?: string;
        };

        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body." },
                { status: 400 }
            );
        }

        // ── 2. Validate required fields ─────────────────────────────────
        if (!body.status || !["success", "failed"].includes(body.status)) {
            return NextResponse.json(
                { error: "Field 'status' must be 'success' or 'failed'." },
                { status: 400 }
            );
        }

        if (typeof body.cost !== "number" || body.cost < 0) {
            return NextResponse.json(
                { error: "Field 'cost' must be a non-negative number." },
                { status: 400 }
            );
        }

        if (body.status === "success" && !body.result_data) {
            return NextResponse.json(
                { error: "Field 'result_data' is required when status is 'success'." },
                { status: 400 }
            );
        }

        if (body.status === "failed" && !body.error_message) {
            return NextResponse.json(
                { error: "Field 'error_message' is required when status is 'failed'." },
                { status: 400 }
            );
        }

        // ── 3. Get the signature from request headers ───────────────────
        const signature = request.headers.get("X-Agent-Signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing X-Agent-Signature header." },
                { status: 401 }
            );
        }

        // ── 4. Look up task → agent → webhook_secret ────────────────────
        //    Using the admin client (service role) because bots don't have
        //    Supabase auth cookies — they authenticate via HMAC instead.
        const supabase = createAdminClient();

        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .select("id, status, client_id, claimed_by_agent")
            .eq("id", taskId)
            .single();

        if (taskError || !task) {
            return NextResponse.json(
                { error: "Task not found." },
                { status: 404 }
            );
        }

        if (!task.claimed_by_agent) {
            return NextResponse.json(
                { error: "No agent has claimed this task." },
                { status: 400 }
            );
        }

        // Fetch the agent's webhook_secret for HMAC verification
        const { data: agent, error: agentError } = await supabase
            .from("agents")
            .select("id, webhook_secret, developer_id")
            .eq("id", task.claimed_by_agent)
            .single();

        if (agentError || !agent) {
            return NextResponse.json(
                { error: "Agent not found." },
                { status: 404 }
            );
        }

        // ── 5. HMAC SHA-256 Verification ────────────────────────────────
        //
        //    The bot computes: HMAC-SHA256(rawRequestBody, webhook_secret)
        //    and sends the hex digest in the X-Agent-Signature header.
        //    We recompute the same hash and compare using a timing-safe
        //    comparison to prevent timing attacks.
        //
        //    WHY: Without this, anyone could call this endpoint and fake
        //    a completion, stealing money by setting an arbitrary `cost`.

        const expectedSignature = createHmac("sha256", agent.webhook_secret)
            .update(rawBody)
            .digest("hex");

        const sigBuffer = Buffer.from(signature, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");

        if (
            sigBuffer.length !== expectedBuffer.length ||
            !timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
            return NextResponse.json(
                { error: "Invalid signature. Authentication failed." },
                { status: 401 }
            );
        }

        // ── 6. Call the atomic PostgreSQL function ───────────────────────
        //    `complete_task_transaction` runs inside a single DB transaction:
        //      - Updates task status
        //      - Creates task_execution record
        //      - Deducts `cost` from client balance (checks for negative)
        //      - Credits developer (cost minus platform fee)
        //      - Records financial transaction
        //      - Increments agent's total_tasks_completed

        const { data: result, error: rpcError } = await supabase.rpc(
            "complete_task_transaction",
            {
                p_task_id: taskId,
                p_agent_id: agent.id,
                p_status: body.status,
                p_result_data: body.result_data || null,
                p_cost: body.cost,
                p_error_message: body.error_message || null,
            }
        );

        if (rpcError) {
            console.error("[tasks/complete] RPC error:", rpcError);
            return NextResponse.json(
                { error: "Internal error processing task completion." },
                { status: 500 }
            );
        }

        // The RPC function returns { error, code } on failure
        if (result?.error) {
            return NextResponse.json(
                { error: result.error },
                { status: result.code || 400 }
            );
        }

        // ── 7. Return 200 OK ────────────────────────────────────────────
        return NextResponse.json(
            {
                success: true,
                message: "Task result accepted.",
                execution_id: result.execution_id,
                transaction_id: result.transaction_id,
                cost: result.cost,
                platform_fee: result.platform_fee,
                developer_payout: result.developer_payout,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("[tasks/complete] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
