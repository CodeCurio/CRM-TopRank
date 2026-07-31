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

  return {
    employees: employees || [],
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

  const employeePayload = { ...employee, email: cleanEmail };
  delete employeePayload.password;
  delete employeePayload.adminRole;
  delete employeePayload.aadhaarNumber;
  delete employeePayload.aadhaarPhotoUrl;
  delete employeePayload.panNumber;
  delete employeePayload.panPhotoUrl;
  delete employeePayload.employeeCode;

  const { error } = await supabase.from('employees').upsert(employeePayload);
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

export const deleteEmployee = async (id: string) => {
  await supabase.from('employees').delete().eq('id', id);
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
