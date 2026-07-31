import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://hecwyrxgdtjynnpczfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY3d5cnhnZHRqeW5ucGN6ZmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjIwNywiZXhwIjoyMTAxMDgyMjA3fQ._QBcW5HSwZaqQAhBu8SB-4iZ4XBVls9X11dlwq3QtRk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  const { data: employees } = await supabase.from('employees').select('*');
  for (const emp of employees) {
    if (emp.email !== 'arnav@toprankindia.com') {
      const { error } = await supabase.from('employees').delete().eq('id', emp.id);
      if (error) {
        console.error("Error deleting", emp.email, error);
      } else {
        console.log(`Deleted ${emp.email}`);
      }
    }
  }
}
clean();
