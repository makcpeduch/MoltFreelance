import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_URL = "http://localhost:3000";
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testPassword123!';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🚀 Starting Bot E2E Workflow Test...");

    // 1. Create Developer User
    const devEmail = `dev_${Date.now()}@test.com`;
    const { data: devAuth, error: devErr } = await supabase.auth.admin.createUser({
        email: devEmail,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Test Dev', username: `dev_${Date.now()}` }
    });
    if (devErr) throw devErr;
    console.log("✅ Created Developer User:", devAuth.user.id);

    // Ensure Profile is created
    const { error: devProfErr } = await supabase.from('profiles').upsert({
        id: devAuth.user.id,
        role: 'developer',
        username: `dev_${Date.now()}`,
        full_name: 'Test Dev'
    });
    if (devProfErr) throw devProfErr;

    // 2. Create Agent
    const agentWebhookSecret = "whsec_" + Math.random().toString(36).substring(2);
    const { data: agent, error: agentErr } = await supabase.from('agents').insert({
        developer_id: devAuth.user.id,
        name: 'Test Bot Alpha',
        slug: `test-bot-${Date.now()}`,
        description: 'Mock bot for testing.',
        long_description: 'Validating end to end bot flow via API tests.',
        webhook_url: 'https://example.com/webhook',
        webhook_secret: agentWebhookSecret,
        category: 'Development',
        price_per_task: 1.5
    }).select().single();
    if (agentErr) throw agentErr;
    console.log("✅ Created Agent:", agent.id, "with secret:", agentWebhookSecret);

    // 3. Create Client User
    const clientEmail = `client_${Date.now()}@test.com`;
    const { data: clientAuth, error: clientErr } = await supabase.auth.admin.createUser({
        email: clientEmail,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Test Client', username: `client_${Date.now()}` }
    });
    if (clientErr) throw clientErr;
    console.log("✅ Created Client User:", clientAuth.user.id);

    // Ensure Profile is created and give client balance
    const { error: clientProfErr } = await supabase.from('profiles').upsert({
        id: clientAuth.user.id,
        role: 'client',
        username: `client_${Date.now()}`,
        full_name: 'Test Client',
        balance: 100
    });
    if (clientProfErr) throw clientProfErr;

    // 4. Create Task
    const { data: task, error: taskErr } = await supabase.from('tasks').insert({
        client_id: clientAuth.user.id,
        title: 'Generate JSON Data',
        description: 'Test task for E2E.',
        category: 'Development',
        budget: 0,
        status: 'open'
    }).select().single();
    if (taskErr) throw taskErr;
    console.log("✅ Created Task:", task.id);

    // 5. Bot Submits Bid via API
    console.log("\n🤖 Simulating Bot Bid...");
    const bidPayload = { proposed_price: 2.5, message: "I can do this instantly for $2.50" };
    const bidRawBody = JSON.stringify(bidPayload);
    const bidSignature = createHmac("sha256", agentWebhookSecret).update(bidRawBody).digest("hex");

    const bidRes = await fetch(`${API_URL}/api/tasks/${task.id}/bid?agent_id=${agent.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Agent-Signature": bidSignature
        },
        body: bidRawBody
    });

    const bidData = await bidRes.json();
    if (!bidRes.ok) throw new Error(`Bid API failed: ${JSON.stringify(bidData)}`);
    console.log("✅ Bid Success:", bidData);

    // 6. Client Accepts Bid (Direct DB update for testing purposes)
    console.log("\n👤 Client accepts bid...");
    const { error: acceptErr } = await supabase.from('tasks').update({
        status: 'in_progress',
        claimed_by_agent: agent.id,
        budget: bidPayload.proposed_price,
        claimed_at: new Date().toISOString()
    }).eq('id', task.id);

    // Also update bid status
    await supabase.from('bids').update({ status: 'accepted' }).eq('id', bidData.bid.id);
    if (acceptErr) throw acceptErr;
    console.log("✅ Bid Accepted! Task is now in_progress.");

    // 7. Bot Completes Task via API
    console.log("\n🤖 Simulating Bot Completion...");
    const completePayload = {
        status: "success",
        result_data: "{\"message\": \"Hello World from Bot\"}",
        cost: bidPayload.proposed_price
    };
    const completeRawBody = JSON.stringify(completePayload);
    const completeSignature = createHmac("sha256", agentWebhookSecret).update(completeRawBody).digest("hex");

    const completeRes = await fetch(`${API_URL}/api/tasks/${task.id}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Agent-Signature": completeSignature
        },
        body: completeRawBody
    });

    const completeData = await completeRes.json();
    if (!completeRes.ok) throw new Error(`Complete API failed: ${JSON.stringify(completeData)}`);
    console.log("✅ Task Complete Success:", completeData);

    // 8. Verify Balances and Final DB States
    const { data: finalClient } = await supabase.from('profiles').select('balance').eq('id', clientAuth.user.id).single();
    const { data: finalDev } = await supabase.from('profiles').select('balance').eq('id', devAuth.user.id).single();
    const { data: finalAgent } = await supabase.from('agents').select('total_tasks_completed').eq('id', agent.id).single();

    console.log("\n📊 Final Status:");
    console.log(`- Client original balance: $100.00 -> New: $${finalClient.balance}`);
    console.log(`- Developer original balance: $0.00 -> New: $${finalDev.balance}`);
    console.log(`- Agent tasks completed: ${finalAgent.total_tasks_completed}`);

    console.log("\n🎉 Workflow verification passed locally!");
}
await run().catch(console.error);
