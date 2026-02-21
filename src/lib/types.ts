// ============================================================================
// MoltFreelance — Database TypeScript Types
// These interfaces mirror the Supabase PostgreSQL schema exactly.
// ============================================================================

// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = "client" | "developer";

export type TaskStatus = "open" | "in_progress" | "completed" | "failed" | "cancelled";

export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export type TransactionStatus = "pending" | "completed" | "refunded";

export type AgentCategory =
  | "All"
  | "Code"
  | "Design"
  | "Writing"
  | "Data"
  | "Legal"
  | "Marketing"
  | "Audio";

// ─── 1. Profile ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 2. Agent ───────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category: string;
  webhook_url: string;
  webhook_secret?: string;
  capabilities: Record<string, unknown>[];
  price_per_task: number;
  rating: number;
  total_reviews: number;
  total_tasks_completed: number;
  avatar_url: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── 3. Task ────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  input_data: Record<string, unknown>;
  attachment_url: string | null;
  budget: number;
  status: TaskStatus;
  claimed_by_agent: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 4. Task Execution ─────────────────────────────────────────────────────

export interface TaskExecution {
  id: string;
  task_id: string;
  agent_id: string;
  status: ExecutionStatus;
  output_result: string | null;
  execution_logs: Record<string, unknown>[];
  started_at: string | null;
  completed_at: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

// ─── 5. Transaction ────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  task_id: string;
  execution_id: string | null;
  client_id: string;
  developer_id: string;
  amount: number;
  platform_fee: number;
  developer_payout: number;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

// ─── 6. Platform Config ────────────────────────────────────────────────────

export interface PlatformConfig {
  key: string;
  value: string;
  updated_at: string;
}

// ─── Convenience: Joined / Nested Types ─────────────────────────────────────

export interface AgentWithDeveloper extends Agent {
  developer: Profile;
}

export interface TaskWithRelations extends Task {
  client: Profile;
  agent: Agent | null;
  executions: TaskExecution[];
}

export interface TaskExecutionWithRelations extends TaskExecution {
  task: Task;
  agent: Agent;
}

export interface TransactionWithRelations extends Transaction {
  task: Task;
  client: Profile;
  developer: Profile;
  execution: TaskExecution | null;
}

// ─── 7. Bid ────────────────────────────────────────────────────────────────

export type BidStatus = "pending" | "accepted" | "rejected";

export interface Bid {
  id: string;
  task_id: string;
  agent_id: string;
  proposed_price: number;
  message: string | null;
  status: BidStatus;
  created_at: string;
}

export interface BidWithAgent extends Bid {
  agent: Agent;
}

// ─── 8. Chat Message ───────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  task_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: Profile;
}

// ─── Convenience: Task with Bids ────────────────────────────────────────────

export interface TaskWithBids extends Task {
  client: Profile;
  agent: Agent | null;
  bids: BidWithAgent[];
}
