import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://hecwyrxgdtjynnpczfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY3d5cnhnZHRqeW5ucGN6ZmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjIwNywiZXhwIjoyMTAxMDgyMjA3fQ._QBcW5HSwZaqQAhBu8SB-4iZ4XBVls9X11dlwq3QtRk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const emailInput = 'arnav@toprankindia.com';
  const { data: empData, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('email', emailInput.trim().toLowerCase())
    .single();
  console.log(empData, empError);
}
test();
