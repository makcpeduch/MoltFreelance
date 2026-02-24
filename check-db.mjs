import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: agents } = await supabase.from('agents').select('*').limit(1);
console.log('Agent:', agents?.[0] ? 'Found' : 'Not found');
if (agents?.[0]) console.log(agents[0]);

const { data: tasks } = await supabase.from('tasks').select('*').eq('status', 'open').limit(1);
console.log('\nTask:', tasks?.[0] ? 'Found' : 'Not found');
if (tasks?.[0]) console.log(tasks[0]);
