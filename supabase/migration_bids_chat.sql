-- ============================================================================
-- MoltFreelance — Bids + Chat Messages Migration
-- Run this in the Supabase SQL Editor
-- ============================================================================


-- ─── ENUM ──────────────────────────────────────────────────────────────────

CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');


-- ─── BIDS ──────────────────────────────────────────────────────────────────

CREATE TABLE bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  proposed_price  NUMERIC(10,4) NOT NULL,
  message         TEXT,
  status          bid_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  bids IS 'Price proposals from agents on open tasks.';
COMMENT ON COLUMN bids.proposed_price IS 'The price the agent proposes to complete the task for.';

-- Indexes
CREATE INDEX idx_bids_task    ON bids(task_id);
CREATE INDEX idx_bids_agent   ON bids(agent_id);
CREATE INDEX idx_bids_status  ON bids(status);

-- Unique: one bid per agent per task
CREATE UNIQUE INDEX idx_bids_unique_agent_task ON bids(task_id, agent_id);


-- ─── CHAT MESSAGES ─────────────────────────────────────────────────────────

CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  chat_messages IS 'Real-time chat between client and agent developer for in-progress tasks.';

-- Indexes
CREATE INDEX idx_chat_task      ON chat_messages(task_id);
CREATE INDEX idx_chat_sender    ON chat_messages(sender_id);
CREATE INDEX idx_chat_created   ON chat_messages(task_id, created_at);


-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE bids          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;


-- ─── BIDS RLS ──────────────────────────────────────────────────────────────

CREATE POLICY "Bids visible to task client and bid agent developer"
  ON bids FOR SELECT
  USING (
    auth.uid() IN (
      SELECT t.client_id FROM tasks t WHERE t.id = bids.task_id
    )
    OR auth.uid() IN (
      SELECT a.developer_id FROM agents a WHERE a.id = bids.agent_id
    )
  );

CREATE POLICY "Agent developer can insert bids"
  ON bids FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT a.developer_id FROM agents a WHERE a.id = bids.agent_id
    )
  );

CREATE POLICY "Task client can update bids (accept/reject)"
  ON bids FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT t.client_id FROM tasks t WHERE t.id = bids.task_id
    )
  );


-- ─── CHAT MESSAGES RLS ────────────────────────────────────────────────────

CREATE POLICY "Chat visible to task client and assigned agent developer"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT t.client_id FROM tasks t WHERE t.id = chat_messages.task_id
    )
    OR auth.uid() IN (
      SELECT a.developer_id FROM agents a
      WHERE a.id = (SELECT t.claimed_by_agent FROM tasks t WHERE t.id = chat_messages.task_id)
    )
  );

CREATE POLICY "Task participants can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      auth.uid() IN (
        SELECT t.client_id FROM tasks t WHERE t.id = chat_messages.task_id
      )
      OR auth.uid() IN (
        SELECT a.developer_id FROM agents a
        WHERE a.id = (SELECT t.claimed_by_agent FROM tasks t WHERE t.id = chat_messages.task_id)
      )
    )
  );


-- ─── Enable Realtime on both tables ────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
