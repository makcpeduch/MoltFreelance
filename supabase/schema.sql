-- ============================================================================
-- MoltFreelance — Complete PostgreSQL Schema for Supabase
-- Run this in the Supabase SQL Editor (or via `supabase db push`)
-- ============================================================================


-- ─── ENUMS ──────────────────────────────────────────────────────────────────

CREATE TYPE user_role       AS ENUM ('client', 'developer');
CREATE TYPE task_status     AS ENUM ('open', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'success', 'failed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'refunded');


-- ─── 1. PROFILES ────────────────────────────────────────────────────────────
-- Extends Supabase Auth.  Every sign-up creates a row here via a trigger.

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'client',
  bio         TEXT,
  balance     NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles IS 'Public profile for every registered user (client or developer).';
COMMENT ON COLUMN profiles.role IS 'Determines what the user can do: clients post tasks, developers register agents.';


-- ─── 2. AGENTS ──────────────────────────────────────────────────────────────
-- AI bots registered by developers.  Each agent exposes a webhook URL that
-- the platform calls when a matching task is available.

CREATE TABLE agents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT NOT NULL,
  long_description      TEXT,
  category              TEXT NOT NULL,

  -- Webhook endpoint the platform POSTs task payloads to
  webhook_url           TEXT NOT NULL,

  -- Cryptographic secret for signing webhook payloads (HMAC SHA-256)
  -- Only returned once at agent creation time
  webhook_secret        TEXT NOT NULL,

  -- Structured list of what this agent can do (e.g. ["code_review", "translation"])
  capabilities          JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Pricing
  price_per_task        NUMERIC(10,4) NOT NULL DEFAULT 0.0300,

  -- Stats & metadata
  rating                NUMERIC(3,2)  NOT NULL DEFAULT 0.00,
  total_reviews         INT           NOT NULL DEFAULT 0,
  total_tasks_completed INT           NOT NULL DEFAULT 0,
  avatar_url            TEXT,
  tags                  TEXT[]        DEFAULT '{}',
  is_active             BOOLEAN       NOT NULL DEFAULT true,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  agents IS 'AI agents/bots uploaded by developers to execute client tasks.';
COMMENT ON COLUMN agents.webhook_url IS 'HTTPS endpoint that receives task payloads via POST.';
COMMENT ON COLUMN agents.capabilities IS 'JSONB array describing what this agent can do, used for task matching.';
COMMENT ON COLUMN agents.price_per_task IS 'The cost charged to the client per task execution.';


-- ─── 3. TASKS ───────────────────────────────────────────────────────────────
-- Jobs posted by clients.  Agents scan, claim, and execute these.

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,

  -- Arbitrary structured input for the agent (files, parameters, config…)
  input_data      JSONB DEFAULT '{}'::jsonb,

  attachment_url  TEXT,
  budget          NUMERIC(10,4) NOT NULL DEFAULT 0.0300,
  status          task_status NOT NULL DEFAULT 'open',

  -- Which agent claimed this task (NULL while open)
  claimed_by_agent UUID REFERENCES agents(id) ON DELETE SET NULL,
  claimed_at       TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  tasks IS 'Client-posted jobs that agents can claim and execute.';
COMMENT ON COLUMN tasks.input_data IS 'JSONB payload with structured input for the agent (parameters, file refs, etc.).';
COMMENT ON COLUMN tasks.budget IS 'Maximum the client is willing to pay for this task.';


-- ─── 4. TASK EXECUTIONS ─────────────────────────────────────────────────────
-- One row per attempt of an agent executing a task.
-- Captures the full lifecycle: pending → running → success/failed.

CREATE TABLE task_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  status          execution_status NOT NULL DEFAULT 'pending',

  -- The agent's delivered output (text, markdown, URL, etc.)
  output_result   TEXT,

  -- Full debug trace: each step the bot took, thoughts, tool calls, etc.
  execution_logs  JSONB DEFAULT '[]'::jsonb,

  -- Performance tracking
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  processing_time_ms  INT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  task_executions IS 'Tracks every attempt of an agent processing a task.';
COMMENT ON COLUMN task_executions.execution_logs IS 'JSONB array of log entries for debugging bot reasoning steps.';
COMMENT ON COLUMN task_executions.output_result IS 'Final deliverable produced by the agent.';


-- ─── 5. TRANSACTIONS ────────────────────────────────────────────────────────
-- Financial ledger: one record per completed (or refunded) task payment.

CREATE TABLE transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id           UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  execution_id      UUID REFERENCES task_executions(id) ON DELETE SET NULL,
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  developer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  amount            NUMERIC(10,4) NOT NULL,
  platform_fee      NUMERIC(10,4) NOT NULL,
  developer_payout  NUMERIC(10,4) NOT NULL,

  status            transaction_status NOT NULL DEFAULT 'pending',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  transactions IS 'Payment records from clients to agent developers, with platform fee split.';
COMMENT ON COLUMN transactions.platform_fee IS '70 % of the amount retained by the platform.';
COMMENT ON COLUMN transactions.developer_payout IS '30 % of the amount paid out to the bot developer.';


-- ─── 6. PLATFORM CONFIG ────────────────────────────────────────────────────

CREATE TABLE platform_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_config (key, value) VALUES
  ('task_price',             '0.03'),
  ('platform_fee_percent',   '70'),
  ('developer_fee_percent',  '30');


-- ─── INDEXES ────────────────────────────────────────────────────────────────
-- Cover every FK and every column commonly used in WHERE / ORDER BY.

-- profiles
CREATE INDEX idx_profiles_role       ON profiles(role);

-- agents
CREATE INDEX idx_agents_developer    ON agents(developer_id);
CREATE INDEX idx_agents_category     ON agents(category);
CREATE INDEX idx_agents_active       ON agents(is_active);
CREATE INDEX idx_agents_slug         ON agents(slug);

-- tasks
CREATE INDEX idx_tasks_client        ON tasks(client_id);
CREATE INDEX idx_tasks_status        ON tasks(status);
CREATE INDEX idx_tasks_category      ON tasks(category);
CREATE INDEX idx_tasks_claimed_by    ON tasks(claimed_by_agent);

-- task_executions
CREATE INDEX idx_executions_task     ON task_executions(task_id);
CREATE INDEX idx_executions_agent    ON task_executions(agent_id);
CREATE INDEX idx_executions_status   ON task_executions(status);

-- transactions
CREATE INDEX idx_txn_task            ON transactions(task_id);
CREATE INDEX idx_txn_execution       ON transactions(execution_id);
CREATE INDEX idx_txn_client          ON transactions(client_id);
CREATE INDEX idx_txn_developer       ON transactions(developer_id);
CREATE INDEX idx_txn_status          ON transactions(status);


-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;


-- ─── PROFILES ───────────────────────────────────────────────────────────────

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ─── AGENTS ─────────────────────────────────────────────────────────────────

CREATE POLICY "Active agents are viewable by everyone"
  ON agents FOR SELECT
  USING (is_active = true OR auth.uid() = developer_id);

CREATE POLICY "Developers can insert own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = developer_id);


-- ─── TASKS ──────────────────────────────────────────────────────────────────

CREATE POLICY "Open tasks are viewable by everyone"
  ON tasks FOR SELECT
  USING (
    status = 'open'
    OR auth.uid() = client_id
    OR auth.uid() IN (
        SELECT a.developer_id FROM agents a WHERE a.id = tasks.claimed_by_agent
    )
  );

CREATE POLICY "Clients can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can cancel own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = client_id AND status = 'open');


-- ─── TASK EXECUTIONS ────────────────────────────────────────────────────────

CREATE POLICY "Executions visible to task client and agent developer"
  ON task_executions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT t.client_id FROM tasks t WHERE t.id = task_executions.task_id
    )
    OR auth.uid() IN (
      SELECT a.developer_id FROM agents a WHERE a.id = task_executions.agent_id
    )
  );

CREATE POLICY "Agent developer can insert executions"
  ON task_executions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT a.developer_id FROM agents a WHERE a.id = task_executions.agent_id
    )
  );

CREATE POLICY "Agent developer can update own executions"
  ON task_executions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT a.developer_id FROM agents a WHERE a.id = task_executions.agent_id
    )
  );


-- ─── TRANSACTIONS ───────────────────────────────────────────────────────────

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = developer_id);

-- Transactions are created server-side (service_role), so no INSERT policy for users.


-- ─── PLATFORM CONFIG ────────────────────────────────────────────────────────

CREATE POLICY "Platform config is readable by everyone"
  ON platform_config FOR SELECT
  USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER: auto-update `updated_at` columns
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
