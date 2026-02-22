import { createClient } from "@supabase/supabase-js";

// ─── Supabase Admin Client (Service Role) ───────────────────────────────────
// Uses the service role key to bypass RLS.
// Use ONLY in server-side code (API routes) for operations that
// cannot be scoped to a single user (e.g. bot callbacks, cron jobs).
// NEVER expose this client or key to the browser.
// ─────────────────────────────────────────────────────────────────────────────

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
