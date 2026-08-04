import { supabase } from './supabaseClient';
import { 
  Employee, Project, Task, Invoice, AttendanceRecord, Meeting, TeamDiscussion, LedgerEntry, AgencyService 
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
  INITIAL_SERVICES,
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

// Local employee metadata store helper for instant client-side persistence
const getLocalEmployeeCache = (): Record<string, Partial<Employee>> => {
  try {
    const raw = localStorage.getItem('toprank_employees_metadata_store');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setLocalEmployeeCache = (email: string, emp: Partial<Employee>) => {
  try {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    const cache = getLocalEmployeeCache();
    cache[clean] = { ...(cache[clean] || {}), ...emp };
    localStorage.setItem('toprank_employees_metadata_store', JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to write local metadata cache:', e);
  }
};

// Fetch all data
export const fetchAllData = async () => {
  const localCache = getLocalEmployeeCache();

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

  let employeeList: Employee[] = (employees || []).map((e: any) => {
    const cleanEmail = e.email ? e.email.trim().toLowerCase() : '';
    const cached = localCache[cleanEmail] || {};
    return {
      id: e.id,
      name: e.name,
      email: cleanEmail,
      role: e.role,
      department: e.department,
      avatar: e.avatar || e.photo_url || cached.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name || 'Staff')}&background=0D8ABC&color=fff`,
      phone: e.phone || cached.phone || '',
      status: e.status || 'offline',
      activeSecondsToday: e.activeSecondsToday || e.active_seconds_today || 0,
      lastPunchIn: e.lastPunchIn || e.last_punch_in || '09:00 AM',
      hourlyRate: e.hourlyRate || e.hourly_rate || 0,
      completedTasksCount: e.completedTasksCount || e.completed_tasks_count || 0,
      pendingTasksCount: e.pendingTasksCount || e.pending_tasks_count || 0,
      productivityScore: e.productivityScore || e.productivity_score || 100,
      isAdmin: Boolean(e.isAdmin ?? e.is_admin ?? cached.isAdmin),
      adminRole: e.adminRole || e.admin_role || cached.adminRole || (e.isAdmin ? 'Co-Founder' : undefined),
      aadhaarNumber: e.aadhaarNumber || e.aadhaar_number || cached.aadhaarNumber || '',
      aadhaarPhotoUrl: e.aadhaarPhotoUrl || e.aadhaar_photo_url || cached.aadhaarPhotoUrl || '',
      panNumber: e.panNumber || e.pan_number || cached.panNumber || '',
      panPhotoUrl: e.panPhotoUrl || e.pan_photo_url || cached.panPhotoUrl || '',
      password: e.password || cached.password || '',
      employeeCode: e.employeeCode || e.employee_code || cached.employeeCode || '',
    };
  });

  // Sync Supabase Auth users to ensure all registered employees appear in Manage Staff
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users && usersData.users.length > 0) {
      for (const u of usersData.users) {
        if (!u.email) continue;
        const cleanEmail = u.email.trim().toLowerCase();
        const meta = u.user_metadata || {};
        const localMeta = localCache[cleanEmail] || {};

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
            name: meta.name || localMeta.name || formattedName || 'TopRank Staff',
            email: cleanEmail,
            role: meta.role || localMeta.role || (isAdmin ? 'Master Admin' : 'Executive Specialist'),
            department: meta.department || localMeta.department || (isAdmin ? 'Management' : 'Operations'),
            avatar: meta.avatar || localMeta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'Staff')}&background=0D8ABC&color=fff`,
            phone: meta.phone || localMeta.phone || '',
            status: 'active',
            activeSecondsToday: 0,
            lastPunchIn: '09:00 AM',
            hourlyRate: 1000,
            completedTasksCount: 0,
            pendingTasksCount: 0,
            productivityScore: 100,
            isAdmin: isAdmin || Boolean(meta.isAdmin || localMeta.isAdmin),
            adminRole: meta.adminRole || localMeta.adminRole || (isAdmin ? 'Founder' : undefined),
            aadhaarNumber: meta.aadhaarNumber || localMeta.aadhaarNumber || '',
            aadhaarPhotoUrl: meta.aadhaarPhotoUrl || localMeta.aadhaarPhotoUrl || '',
            panNumber: meta.panNumber || localMeta.panNumber || '',
            panPhotoUrl: meta.panPhotoUrl || localMeta.panPhotoUrl || '',
            password: meta.password || localMeta.password || '',
            employeeCode: meta.employeeCode || localMeta.employeeCode || '',
          };

          employeeList.push(newEmp);
        } else {
          // Merge metadata into existing record
          const emp = employeeList[existingIndex];
          if (meta.avatar || localMeta.avatar) emp.avatar = meta.avatar || localMeta.avatar;
          if (meta.aadhaarNumber || localMeta.aadhaarNumber) emp.aadhaarNumber = meta.aadhaarNumber || localMeta.aadhaarNumber;
          if (meta.aadhaarPhotoUrl || localMeta.aadhaarPhotoUrl) emp.aadhaarPhotoUrl = meta.aadhaarPhotoUrl || localMeta.aadhaarPhotoUrl;
          if (meta.panNumber || localMeta.panNumber) emp.panNumber = meta.panNumber || localMeta.panNumber;
          if (meta.panPhotoUrl || localMeta.panPhotoUrl) emp.panPhotoUrl = meta.panPhotoUrl || localMeta.panPhotoUrl;
          if (meta.password || localMeta.password) emp.password = meta.password || localMeta.password;
          if (meta.phone || localMeta.phone) emp.phone = meta.phone || localMeta.phone;

          if (isAdmin) {
            emp.isAdmin = true;
            emp.role = 'Master Admin';
            emp.adminRole = 'Founder';
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing auth users in fetchAllData:', err);
  }

  // Read local task store cache to ensure client persistence
  let taskList: Task[] = tasks || [];
  try {
    const rawLocalTasks = localStorage.getItem('toprank_tasks_store');
    if (rawLocalTasks) {
      const localTasks: Task[] = JSON.parse(rawLocalTasks);
      const localTaskMap = new Map(localTasks.map((t) => [t.id, t]));

      // Merge/override existing tasks with updated local tasks
      taskList = taskList.map((t) => localTaskMap.get(t.id) || t);

      // Append any newly created local tasks not in remote list
      const existingIds = new Set(taskList.map((t) => t.id));
      for (const lt of localTasks) {
        if (!existingIds.has(lt.id)) {
          taskList.unshift(lt);
        }
      }
    }
  } catch (e) {
    console.warn('Task local storage read error:', e);
  }

  // Read local invoice store cache to ensure client persistence across reloads
  let invoiceList: Invoice[] = invoices || [];
  try {
    const rawLocalInvoices = localStorage.getItem('toprank_invoices_store');
    if (rawLocalInvoices) {
      const localInvoices: Invoice[] = JSON.parse(rawLocalInvoices);
      const localInvMap = new Map(localInvoices.map((i) => [i.id, i]));

      // Merge/override remote invoices with local cache
      invoiceList = invoiceList.map((i) => localInvMap.get(i.id) || i);

      // Append any newly created local invoices not yet in remote list
      const existingInvIds = new Set(invoiceList.map((i) => i.id));
      for (const li of localInvoices) {
        if (!existingInvIds.has(li.id)) {
          invoiceList.unshift(li);
        }
      }
    }
  } catch (e) {
    console.warn('Invoice local storage read error:', e);
  }

  // Read local ledger store cache
  let ledgerList: LedgerEntry[] = ledger || [];
  try {
    const rawLocalLedger = localStorage.getItem('toprank_ledger_store');
    if (rawLocalLedger) {
      const localLedger: LedgerEntry[] = JSON.parse(rawLocalLedger);
      const localLedgerMap = new Map(localLedger.map((l) => [l.id, l]));

      ledgerList = ledgerList.map((l) => localLedgerMap.get(l.id) || l);
      const existingLedgerIds = new Set(ledgerList.map((l) => l.id));
      for (const ll of localLedger) {
        if (!existingLedgerIds.has(ll.id)) {
          ledgerList.unshift(ll);
        }
      }
    }
  } catch (e) {
    console.warn('Ledger local storage read error:', e);
  }

  return {
    employees: employeeList,
    projects: projects || [],
    tasks: taskList,
    invoices: invoiceList,
    attendance: attendance || [],
    meetings: meetings || [],
    discussions: discussions || [],
    ledger: ledgerList
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
  if (!cleanEmail) return employee;

  // 1. Always update local cache mirror
  setLocalEmployeeCache(cleanEmail, employee);

  const userMetadata = {
    name: employee.name,
    email: cleanEmail,
    role: employee.role,
    department: employee.department,
    avatar: employee.avatar,
    phone: employee.phone || '',
    aadhaarNumber: employee.aadhaarNumber || '',
    aadhaarPhotoUrl: employee.aadhaarPhotoUrl || '',
    panNumber: employee.panNumber || '',
    panPhotoUrl: employee.panPhotoUrl || '',
    password: employee.password || '',
    isAdmin: Boolean(employee.isAdmin),
    adminRole: employee.adminRole || '',
    employeeCode: employee.employeeCode || '',
  };

  // 2. Sync to Supabase Auth User Metadata & Password via Admin API
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users) {
      const existingUser = usersData.users.find((u: any) => u.email?.toLowerCase() === cleanEmail);

      if (!existingUser) {
        const { data: newUser } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: employee.password || 'TopRank123!',
          email_confirm: true,
          user_metadata: userMetadata,
        });

        if (newUser?.user) {
          employee.id = newUser.user.id;
        }
      } else {
        if (employee.id.startsWith('emp-')) {
          employee.id = existingUser.id;
        }

        const updatePayload: any = {
          user_metadata: {
            ...(existingUser.user_metadata || {}),
            ...userMetadata,
          },
        };

        if (employee.password) {
          updatePayload.password = employee.password;
        }

        await supabase.auth.admin.updateUserById(existingUser.id, updatePayload);
      }
    }
  } catch (authErr) {
    console.error('Error syncing Supabase Auth user metadata:', authErr);
  }

  // 3. Sync to Supabase DB 'employees' table
  const fullPayload: any = {
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
    aadhaarNumber: employee.aadhaarNumber || '',
    aadhaarPhotoUrl: employee.aadhaarPhotoUrl || '',
    panNumber: employee.panNumber || '',
    panPhotoUrl: employee.panPhotoUrl || '',
    password: employee.password || '',
    adminRole: employee.adminRole || '',
    employeeCode: employee.employeeCode || '',
    // Snake case fallbacks
    aadhaar_number: employee.aadhaarNumber || '',
    aadhaar_photo_url: employee.aadhaarPhotoUrl || '',
    pan_number: employee.panNumber || '',
    pan_photo_url: employee.panPhotoUrl || '',
    admin_role: employee.adminRole || '',
  };

  try {
    const { error } = await supabase.from('employees').upsert(fullPayload);
    if (error) {
      console.warn('Full payload upsert notice, saving base payload:', error.message);
      const basePayload = {
        id: employee.id,
        name: employee.name,
        email: cleanEmail,
        role: employee.role,
        department: employee.department,
        avatar: employee.avatar,
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
      await supabase.from('employees').upsert(basePayload);
    }
  } catch (dbErr) {
    console.error('Error saving employee row to DB:', dbErr);
  }

  return employee;
};

export const sendPasswordResetVerificationEmail = async (accountEmail: string) => {
  const cleanEmail = accountEmail.trim().toLowerCase();
  const masterAdminEmail = 'arnav@toprankindia.com';

  // 1. Send reset password email via Supabase Auth API to arnav@toprankindia.com
  try {
    await supabase.auth.resetPasswordForEmail(masterAdminEmail, {
      redirectTo: window.location.origin || window.location.href,
    });
  } catch (err) {
    console.warn('Supabase reset email trigger notice:', err);
  }

  // 2. Also send reset email to account email if different
  if (cleanEmail !== masterAdminEmail) {
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin || window.location.href,
      });
    } catch (err) {
      console.warn('Account email reset trigger notice:', err);
    }
  }

  // 3. Generate 6-digit security verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. Record security notification for arnav@toprankindia.com
  try {
    await supabase.from('discussions').insert({
      id: `pwd-reset-${Date.now()}`,
      employeeId: 'system',
      employeeName: 'TopRank Security',
      employeeAvatar: 'https://ui-avatars.com/api/?name=Security&background=0D8ABC&color=fff',
      content: `🔒 PASSWORD RESET VERIFICATION: Security Code [ ${verificationCode} ] requested for (${cleanEmail}). Dispatched to ${masterAdminEmail}.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notification log error:', err);
  }

  return {
    verificationCode,
    recipientEmail: masterAdminEmail,
    accountEmail: cleanEmail,
  };
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
  try {
    const rawLocal = localStorage.getItem('toprank_tasks_store');
    const list: Task[] = rawLocal ? JSON.parse(rawLocal) : [];
    const updated = [task, ...list.filter((t) => t.id !== task.id)];
    localStorage.setItem('toprank_tasks_store', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local task cache save error:', e);
  }

  try {
    const payload: any = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      clientName: task.clientName || 'General Work',
      assignedEmployeeId: task.assignedEmployeeId,
      assignedEmployeeName: task.assignedEmployeeName,
      assignedEmployeeAvatar: task.assignedEmployeeAvatar || '',
      assignedEmployeeEmail: task.assignedEmployeeEmail || '',
      priority: task.priority || 'Medium',
      status: task.status || 'To Do',
      dueDate: task.dueDate || '',
      estimatedHours: task.estimatedHours || 0,
      loggedHours: task.loggedHours || 0,
      progressPercentage: task.progressPercentage || 0,
      createdDate: task.createdDate || new Date().toISOString().split('T')[0],
      category: task.category || 'General Task',
    };
    await supabase.from('tasks').upsert(payload);
  } catch (err) {
    console.warn('Supabase saveTask notice:', err);
  }
};

export const saveInvoice = async (invoice: Invoice) => {
  // 1. Sync to local storage store for instant persistence across reloads
  try {
    const rawLocal = localStorage.getItem('toprank_invoices_store');
    const list: Invoice[] = rawLocal ? JSON.parse(rawLocal) : [];
    const updated = [invoice, ...list.filter((inv) => inv.id !== invoice.id)];
    localStorage.setItem('toprank_invoices_store', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local invoice cache save error:', e);
  }

  // 2. Sync to Supabase database table
  try {
    await supabase.from('invoices').upsert(invoice);
  } catch (err) {
    console.warn('Supabase saveInvoice notice:', err);
  }
};

export const deleteInvoice = async (id: string) => {
  // 1. Remove from local storage store
  try {
    const rawLocal = localStorage.getItem('toprank_invoices_store');
    if (rawLocal) {
      const list: Invoice[] = JSON.parse(rawLocal);
      const filtered = list.filter((inv) => inv.id !== id);
      localStorage.setItem('toprank_invoices_store', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Local invoice delete cache error:', e);
  }

  // 2. Remove from Supabase
  try {
    await supabase.from('invoices').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteInvoice notice:', err);
  }
};

export const saveLedgerEntry = async (entry: LedgerEntry) => {
  // 1. Sync to local storage store
  try {
    const rawLocal = localStorage.getItem('toprank_ledger_store');
    const list: LedgerEntry[] = rawLocal ? JSON.parse(rawLocal) : [];
    const updated = [entry, ...list.filter((l) => l.id !== entry.id)];
    localStorage.setItem('toprank_ledger_store', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local ledger cache save error:', e);
  }

  // 2. Sync to Supabase
  try {
    await supabase.from('ledger').upsert(entry);
  } catch (err) {
    console.warn('Supabase saveLedgerEntry notice:', err);
  }
};

export const saveDiscussion = async (discussion: TeamDiscussion) => {
  await supabase.from('discussions').upsert(discussion);
};

export const saveMeeting = async (meeting: Meeting) => {
  await supabase.from('meetings').upsert(meeting);
};

export const fetchServicesFromSupabase = async (): Promise<AgencyService[]> => {
  try {
    const { data, error } = await supabase.from('services').select('*').order('createdDate', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        department: s.department || 'Ads',
        defaultPrice: Number(s.default_price ?? s.defaultPrice ?? 0),
        description: s.description || '',
        createdDate: s.created_date || s.createdDate || new Date().toISOString().split('T')[0],
      }));
    }
  } catch (err) {
    console.warn('Supabase services fetch error (falling back to local cache):', err);
  }

  // Fallback to localStorage + INITIAL_SERVICES
  try {
    const local = localStorage.getItem('toprank_agency_services');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage services read error:', e);
  }

  return INITIAL_SERVICES;
};

export const saveServiceToSupabase = async (service: AgencyService): Promise<AgencyService> => {
  // Save to Supabase
  try {
    const payload = {
      id: service.id,
      name: service.name,
      department: service.department || 'Ads',
      default_price: service.defaultPrice || 0,
      description: service.description || '',
      created_date: service.createdDate || new Date().toISOString().split('T')[0],
    };
    await supabase.from('services').upsert(payload);
  } catch (err) {
    console.warn('Supabase service save error:', err);
  }

  // Sync to localStorage
  try {
    const current = await fetchServicesFromSupabase();
    const existingIdx = current.findIndex((s) => s.id === service.id);
    let updated: AgencyService[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = service;
    } else {
      updated = [service, ...current];
    }
    localStorage.setItem('toprank_agency_services', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage service save error:', e);
  }

  return service;
};
