import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── POST /api/tasks/[taskId]/bid ──────────────────────────────────────────
// Bot submits a price proposal for an open task.
// Authenticated via HMAC SHA-256 (same pattern as /complete).
//
// Body: { proposed_price: number, message?: string }
// Header: X-Agent-Signature (HMAC of raw body using webhook_secret)
// Query:  ?agent_id=<uuid>
// ───────────────────────────────────────────────────────────────────────────

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;
        const agentId = request.nextUrl.searchParams.get("agent_id");

        if (!agentId) {
            return NextResponse.json(
                { error: "Missing agent_id query parameter." },
                { status: 400 }
            );
        }

        // ── 1. Read raw body for HMAC ────────────────────────────────────
        const rawBody = await request.text();

        let body: { proposed_price: number; message?: string };

        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body." },
                { status: 400 }
            );
        }

        if (typeof body.proposed_price !== "number" || body.proposed_price <= 0) {
            return NextResponse.json(
                { error: "Field 'proposed_price' must be a positive number." },
                { status: 400 }
            );
        }

        // ── 2. Verify signature ──────────────────────────────────────────
        const signature = request.headers.get("X-Agent-Signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing X-Agent-Signature header." },
                { status: 401 }
            );
        }

        const supabase = createAdminClient();

        // Fetch agent + secret
        const { data: agent, error: agentError } = await supabase
            .from("agents")
            .select("id, webhook_secret, developer_id, name")
            .eq("id", agentId)
            .single();

        if (agentError || !agent) {
            return NextResponse.json(
                { error: "Agent not found." },
                { status: 404 }
            );
        }

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
                { error: "Invalid signature." },
                { status: 401 }
            );
        }

        // ── 3. Verify task exists and is open ────────────────────────────
        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .select("id, status")
            .eq("id", taskId)
            .single();

        if (taskError || !task) {
            return NextResponse.json(
                { error: "Task not found." },
                { status: 404 }
            );
        }

        if (task.status !== "open") {
            return NextResponse.json(
                { error: "Task is not open for bids." },
                { status: 400 }
            );
        }

        // ── 4. Insert bid ────────────────────────────────────────────────
        const { data: bid, error: bidError } = await supabase
            .from("bids")
            .insert({
                task_id: taskId,
                agent_id: agentId,
                proposed_price: body.proposed_price,
                message: body.message || null,
            })
            .select("id, proposed_price, status, created_at")
            .single();

        if (bidError) {
            // Unique constraint violation = already bid
            if (bidError.code === "23505") {
                return NextResponse.json(
                    { error: "This agent has already bid on this task." },
                    { status: 409 }
                );
            }
            console.error("[tasks/bid] Insert error:", bidError);
            return NextResponse.json(
                { error: "Failed to submit bid." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Bid submitted successfully.",
                bid,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("[tasks/bid] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
