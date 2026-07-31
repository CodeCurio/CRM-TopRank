import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://hecwyrxgdtjynnpczfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY3d5cnhnZHRqeW5ucGN6ZmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjIwNywiZXhwIjoyMTAxMDgyMjA3fQ._QBcW5HSwZaqQAhBu8SB-4iZ4XBVls9X11dlwq3QtRk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const arnav = users.users.find(u => u.email === 'arnav@toprankindia.com');
  
  if (arnav) {
    console.log("Found arnav in auth:", arnav.id);
    const { error } = await supabase.from('employees').upsert({
      id: arnav.id,
      name: 'Arnav',
      email: 'arnav@toprankindia.com',
      role: 'Master Admin',
      department: 'Management',
      avatar: 'https://ui-avatars.com/api/?name=Arnav&background=0D8ABC&color=fff',
      phone: '',
      status: 'active',
      activeSecondsToday: 0,
      lastPunchIn: '09:00 AM',
      hourlyRate: 0,
      completedTasksCount: 0,
      pendingTasksCount: 0,
      productivityScore: 100,
      isAdmin: true
    });
    if (error) {
      console.error("Error seeding:", error);
    } else {
      console.log("Seeded employee table with Arnav");
    }
  } else {
    console.log("Arnav not found in auth users.");
  }
}
seed();
