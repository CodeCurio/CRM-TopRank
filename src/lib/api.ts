import { supabase } from './supabaseClient';
import { 
  Employee, Project, Task, Invoice, AttendanceRecord, Meeting, TeamDiscussion, LedgerEntry 
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_ATTENDANCE,
  INITIAL_MEETINGS,
  INITIAL_DISCUSSIONS,
  INITIAL_LEDGER,
} from '../data/mockData';

export const MASTER_ADMIN_EMAILS = [
  'arnav@toprankindia.com',
  'toprankdigitalservice@gmail.com',
  'admin@toprankindia.com',
];

export const isMasterAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return MASTER_ADMIN_EMAILS.includes(clean) || clean.startsWith('admin@');
};

// Fetch all data
export const fetchAllData = async () => {
  const [
    { data: employees },
    { data: projects },
    { data: tasks },
    { data: invoices },
    { data: attendance },
    { data: meetings },
    { data: discussions },
    { data: ledger }
  ] = await Promise.all([
    supabase.from('employees').select('*').order('name'),
    supabase.from('projects').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('invoices').select('*'),
    supabase.from('attendance').select('*'),
    supabase.from('meetings').select('*'),
    supabase.from('discussions').select('*').order('timestamp', { ascending: false }),
    supabase.from('ledger').select('*').order('date', { ascending: false })
  ]);

  let employeeList: Employee[] = employees || [];

  // Sync Supabase Auth users to ensure all registered employees appear in Manage Staff
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users && usersData.users.length > 0) {
      for (const u of usersData.users) {
        if (!u.email) continue;
        const cleanEmail = u.email.trim().toLowerCase();
        const existingIndex = employeeList.findIndex(
          (e) => e.id === u.id || e.email.toLowerCase() === cleanEmail
        );

        const isAdmin = isMasterAdminEmail(cleanEmail);

        if (existingIndex === -1) {
          const rawName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = rawName
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const newEmp: Employee = {
            id: u.id,
            name: formattedName || 'TopRank Staff',
            email: cleanEmail,
            role: isAdmin ? 'Master Admin' : 'Executive Specialist',
            department: isAdmin ? 'Management' : 'Operations',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'Staff')}&background=0D8ABC&color=fff`,
            phone: '',
            status: 'active',
            activeSecondsToday: 0,
            lastPunchIn: '09:00 AM',
            hourlyRate: 1000,
            completedTasksCount: 0,
            pendingTasksCount: 0,
            productivityScore: 100,
            isAdmin: isAdmin,
            adminRole: isAdmin ? 'Founder' : undefined,
          };

          const cleanPayload = {
            id: newEmp.id,
            name: newEmp.name,
            email: cleanEmail,
            role: newEmp.role,
            department: newEmp.department,
            avatar: newEmp.avatar,
            phone: '',
            status: 'active',
            activeSecondsToday: 0,
            lastPunchIn: '09:00 AM',
            hourlyRate: 1000,
            completedTasksCount: 0,
            pendingTasksCount: 0,
            productivityScore: 100,
            isAdmin: newEmp.isAdmin,
          };

          await supabase.from('employees').upsert(cleanPayload);
          employeeList.push(newEmp);
        } else {
          // If master admin email, force isAdmin = true
          if (isAdmin && !employeeList[existingIndex].isAdmin) {
            employeeList[existingIndex].isAdmin = true;
            employeeList[existingIndex].role = 'Master Admin';
            employeeList[existingIndex].adminRole = 'Founder';
            await supabase.from('employees').update({ isAdmin: true, role: 'Master Admin' }).eq('id', employeeList[existingIndex].id);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing auth users in fetchAllData:', err);
  }

  return {
    employees: employeeList,
    projects: projects || [],
    tasks: tasks || [],
    invoices: invoices || [],
    attendance: attendance || [],
    meetings: meetings || [],
    discussions: discussions || [],
    ledger: ledger || []
  };
};

export const seedDatabase = async () => {
  const { data: existing } = await supabase.from('employees').select('id').limit(1);
  if (!existing || existing.length === 0) {
    await Promise.all([
      supabase.from('employees').upsert(INITIAL_EMPLOYEES),
      supabase.from('projects').upsert(INITIAL_PROJECTS),
      supabase.from('tasks').upsert(INITIAL_TASKS),
      supabase.from('invoices').upsert(INITIAL_INVOICES),
      supabase.from('attendance').upsert(INITIAL_ATTENDANCE),
      supabase.from('meetings').upsert(INITIAL_MEETINGS),
      supabase.from('discussions').upsert(INITIAL_DISCUSSIONS),
      supabase.from('ledger').upsert(INITIAL_LEDGER),
    ]);
  }
};

export const saveEmployee = async (employee: Employee): Promise<Employee> => {
  const cleanEmail = employee.email ? employee.email.trim().toLowerCase() : '';
  
  // First, create or update the user in Supabase Auth using Admin API
  if (cleanEmail && employee.password) {
    try {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = usersData.users.find((u: any) => u.email?.toLowerCase() === cleanEmail);

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: employee.password,
          email_confirm: true,
        });
        
        if (createError) throw createError;
        
        if (newUser.user) {
          employee.id = newUser.user.id;
        }
      } else {
        if (employee.id.startsWith('emp-')) {
          employee.id = existingUser.id;
        }
        
        // Update password in Supabase Auth
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: employee.password,
        });
      }
    } catch (err) {
      console.error('Error creating/updating Auth user:', err);
    }
  }

  const cleanPayload = {
    id: employee.id,
    name: employee.name,
    email: cleanEmail,
    role: employee.role,
    department: employee.department,
    avatar: employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=0D8ABC&color=fff`,
    phone: employee.phone || '',
    status: employee.status || 'offline',
    activeSecondsToday: employee.activeSecondsToday || 0,
    lastPunchIn: employee.lastPunchIn || '09:00 AM',
    hourlyRate: employee.hourlyRate || 0,
    completedTasksCount: employee.completedTasksCount || 0,
    pendingTasksCount: employee.pendingTasksCount || 0,
    productivityScore: employee.productivityScore || 100,
    isAdmin: Boolean(employee.isAdmin),
  };

  const { error } = await supabase.from('employees').upsert(cleanPayload);
  if (error) {
    console.error('Error saving employee to database:', error);
    throw error;
  }

  return employee;
};

export const resetEmployeePassword = async (email: string, newPassword: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existingUser = usersData.users.find((u: any) => u.email?.toLowerCase() === cleanEmail);
  if (!existingUser) {
    // Create if user doesn't exist yet in Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: newPassword,
      email_confirm: true,
    });
    if (createError) throw createError;
    return newUser.user;
  } else {
    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: newPassword,
    });
    if (error) throw error;
    return data.user;
  }
};

export const deleteEmployee = async (id: string, email?: string) => {
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  // Delete from employees table
  await supabase.from('employees').delete().eq('id', id);
  if (cleanEmail) {
    await supabase.from('employees').delete().ilike('email', cleanEmail);
  }

  // Delete from Supabase Auth so fetchAllData won't resurrect them
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users) {
      const match = usersData.users.find(
        (u: any) => u.id === id || (cleanEmail && u.email?.toLowerCase() === cleanEmail)
      );
      if (match) {
        await supabase.auth.admin.deleteUser(match.id);
      }
    }
  } catch (err) {
    console.error('Error deleting employee from Auth:', err);
  }
};

export const saveProject = async (project: Project) => {
  await supabase.from('projects').upsert(project);
};

export const saveTask = async (task: Task) => {
  await supabase.from('tasks').upsert(task);
};

export const saveInvoice = async (invoice: Invoice) => {
  await supabase.from('invoices').upsert(invoice);
};

export const deleteInvoice = async (id: string) => {
  await supabase.from('invoices').delete().eq('id', id);
};

export const saveLedgerEntry = async (entry: LedgerEntry) => {
  await supabase.from('ledger').upsert(entry);
};

export const saveDiscussion = async (discussion: TeamDiscussion) => {
  await supabase.from('discussions').upsert(discussion);
};

export const saveMeeting = async (meeting: Meeting) => {
  await supabase.from('meetings').upsert(meeting);
};
