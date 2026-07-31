import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://hecwyrxgdtjynnpczfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY3d5cnhnZHRqeW5ucGN6ZmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjIwNywiZXhwIjoyMTAxMDgyMjA3fQ._QBcW5HSwZaqQAhBu8SB-4iZ4XBVls9X11dlwq3QtRk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  await supabase.from('ledger').delete().neq('id', 'dummy');
  await supabase.from('discussions').delete().neq('id', 'dummy');
  await supabase.from('meetings').delete().neq('id', 'dummy');
  await supabase.from('attendance').delete().neq('id', 'dummy');
  await supabase.from('tasks').delete().neq('id', 'dummy');
  await supabase.from('invoices').delete().neq('id', 'dummy');
  await supabase.from('projects').delete().neq('id', 'dummy');
  await supabase.from('employees').delete().neq('id', 'dummy');
  console.log("Wiped all tables");
}
wipe();
