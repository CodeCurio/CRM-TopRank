import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://hecwyrxgdtjynnpczfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY3d5cnhnZHRqeW5ucGN6ZmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjIwNywiZXhwIjoyMTAxMDgyMjA3fQ._QBcW5HSwZaqQAhBu8SB-4iZ4XBVls9X11dlwq3QtRk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: employees, error } = await supabase.from('employees').select('id, email, password, adminRole');
  if(error) console.error(error);
  console.log("Employees in DB:", employees);
}
check();
