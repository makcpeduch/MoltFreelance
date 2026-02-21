import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ─── POST /api/tasks/[taskId]/bids/accept ──────────────────────────────────
// Client accepts a bid. Body: { bid_id: string }
// Auth: Supabase session cookie (must be the task owner).
//
// Flow:
//   1. Verify the user owns the task
//   2. Verify the bid belongs to this task and is pending
//   3. Accept the bid → reject all others
//   4. Claim the task for the winning agent
// ───────────────────────────────────────────────────────────────────────────

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;

        // ── 1. Authenticate user ─────────────────────────────────────────
        const userSupabase = await createClient();
        const {
            data: { user },
        } = await userSupabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated." },
                { status: 401 }
            );
        }

        // ── 2. Parse body ────────────────────────────────────────────────
        const body = await request.json();
        const { bid_id } = body;

        if (!bid_id) {
            return NextResponse.json(
                { error: "Missing bid_id." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // ── 3. Verify task ownership ─────────────────────────────────────
        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .select("id, client_id, status")
            .eq("id", taskId)
            .single();

        if (taskError || !task) {
            return NextResponse.json(
                { error: "Task not found." },
                { status: 404 }
            );
        }

        if (task.client_id !== user.id) {
            return NextResponse.json(
                { error: "You do not own this task." },
                { status: 403 }
            );
        }

        if (task.status !== "open") {
            return NextResponse.json(
                { error: "Task is no longer open." },
                { status: 400 }
            );
        }

        // ── 4. Verify bid ────────────────────────────────────────────────
        const { data: bid, error: bidError } = await supabase
            .from("bids")
            .select("id, task_id, agent_id, proposed_price, status")
            .eq("id", bid_id)
            .single();

        if (bidError || !bid) {
            return NextResponse.json(
                { error: "Bid not found." },
                { status: 404 }
            );
        }

        if (bid.task_id !== taskId) {
            return NextResponse.json(
                { error: "Bid does not belong to this task." },
                { status: 400 }
            );
        }

        if (bid.status !== "pending") {
            return NextResponse.json(
                { error: "Bid is no longer pending." },
                { status: 400 }
            );
        }

        // ── 5. Accept bid, reject others, claim task ─────────────────────

        // Accept this bid
        await supabase
            .from("bids")
            .update({ status: "accepted" })
            .eq("id", bid_id);

        // Reject all other pending bids for this task
        await supabase
            .from("bids")
            .update({ status: "rejected" })
            .eq("task_id", taskId)
            .neq("id", bid_id)
            .eq("status", "pending");

        // Update task: set claimed_by_agent, status → in_progress, budget → proposed_price
        await supabase
            .from("tasks")
            .update({
                status: "in_progress",
                claimed_by_agent: bid.agent_id,
                claimed_at: new Date().toISOString(),
                budget: bid.proposed_price,
            })
            .eq("id", taskId);

        return NextResponse.json(
            {
                success: true,
                message: "Bid accepted. Chat is now open.",
                agent_id: bid.agent_id,
                agreed_price: bid.proposed_price,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("[bids/accept] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
