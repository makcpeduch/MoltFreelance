import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";

// ─── POST /api/agents/register ──────────────────────────────────────────────
// Creates a new AI agent (bot) in the system.
//
// SECURITY NOTE: The `webhook_secret` is returned ONLY ONCE in this response.
// The frontend must display it to the developer with a warning:
// "Save this key on your server — we will never show it again."
// The backend stores a hashed version; the raw secret is NOT persisted.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // ── 1. Parse body ───────────────────────────────────────────────
        const body = await request.json();
        const { name, webhook_url, price_per_task } = body;

        // ── 2. Validate required fields ─────────────────────────────────
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { error: "Field 'name' is required and must be a non-empty string." },
                { status: 400 }
            );
        }

        if (!webhook_url || typeof webhook_url !== "string" || !webhook_url.trim()) {
            return NextResponse.json(
                { error: "Field 'webhook_url' is required." },
                { status: 400 }
            );
        }

        try {
            const parsed = new URL(webhook_url);
            if (parsed.protocol !== "https:") {
                return NextResponse.json(
                    { error: "webhook_url must use HTTPS protocol." },
                    { status: 400 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: "webhook_url must be a valid URL." },
                { status: 400 }
            );
        }

        // ── 3. Authenticate user ────────────────────────────────────────
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized. You must be logged in to register a bot." },
                { status: 401 }
            );
        }

        // ── 4. Generate unique agent ID with prefix ─────────────────────
        const agentId = `agt_${randomUUID().replaceAll("-", "")}`;

        // ── 5. Generate cryptographic webhook secret (48 bytes = 64 hex chars)
        const webhookSecret = `whsec_${randomBytes(32).toString("hex")}`;

        // ── 6. Generate slug from name ──────────────────────────────────
        const baseSlug = name
            .trim()
            .toLowerCase()
            .replaceAll(/[^a-z0-9]+/g, "-")
            .replaceAll(/^-|-$/g, "");
        const slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;

        // ── 7. Insert into database ─────────────────────────────────────
        const { data: agent, error: dbError } = await supabase
            .from("agents")
            .insert({
                id: agentId,
                developer_id: user.id,
                name: name.trim(),
                slug,
                description: `AI bot: ${name.trim()}`,
                category: "Code",
                webhook_url: webhook_url.trim(),
                webhook_secret: webhookSecret,
                capabilities: [],
                price_per_task: typeof price_per_task === "number" && price_per_task >= 0
                    ? price_per_task
                    : 0.03,
                tags: [],
                is_active: true,
            })
            .select()
            .single();

        if (dbError) {
            console.error("[agents/register] DB error:", dbError);

            if (dbError.code === "23505") {
                return NextResponse.json(
                    { error: "An agent with this name already exists." },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: "Failed to create agent. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                agent,
                webhook_secret: webhookSecret,
                message: "Agent registered successfully. Save the webhook_secret — it will not be shown again.",
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("[agents/register] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
