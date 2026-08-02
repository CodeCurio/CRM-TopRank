import React, { useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_ATTENDANCE,
  INITIAL_MEETINGS,
  INITIAL_DISCUSSIONS,
  INITIAL_LEDGER,
} from './data/mockData';
import {
  Employee,
  Project,
  Task,
  Invoice,
  AttendanceRecord,
  Meeting,
  TeamDiscussion,
  LedgerEntry,
  WorkStatus,
  EmployeePresenceStatus,
} from './types';
import { Header } from './components/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientFinancialsLedger } from './components/admin/ClientFinancialsLedger';
import { EmployeeMonitoring } from './components/admin/EmployeeMonitoring';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { BusinessAnalytics } from './components/admin/BusinessAnalytics';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ProjectManager } from './components/shared/ProjectManager';
import { MeetingsAndAttendance } from './components/shared/MeetingsAndAttendance';
import { TeamDiscussions } from './components/shared/TeamDiscussions';
import { InvoicePrintModal } from './components/shared/InvoicePrintModal';
import { TaskModal } from './components/shared/TaskModal';
import { LoginModal } from './components/shared/LoginModal';
import { getInvoiceUrgency } from './utils/formatters';
import { 
  fetchAllData, seedDatabase, saveEmployee, deleteEmployee, saveProject, saveTask, 
  saveInvoice, deleteInvoice, saveLedgerEntry, saveDiscussion, saveMeeting,
  isMasterAdminEmail
} from './lib/api';

export default function App() {
  const [loading, setLoading] = useState(true);

  // Load state from Supabase
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [discussions, setDiscussions] = useState<TeamDiscussion[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  const [activeTab, setActiveTab] = useState<string>('admin');

  // Live Timer Punch State
  const [isPunchActive, setIsPunchActive] = useState<boolean>(true);
  const [activeSeconds, setActiveSeconds] = useState<number>(0);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [taskModalEmpId, setTaskModalEmpId] = useState<string | undefined>(undefined);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        await seedDatabase();
        const data = await fetchAllData();
        setEmployees(data.employees);
        setProjects(data.projects);
        setTasks(data.tasks);
        setInvoices(data.invoices);
        setAttendance(data.attendance);
        setMeetings(data.meetings);
        setDiscussions(data.discussions);
        setLedger(data.ledger);

        const { supabase } = await import('./lib/supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();
        
        let found: Employee | null = null;
        if (session && session.user) {
          const sessionEmail = (session.user.email || '').toLowerCase();
          found = data.employees.find(
            (e) => e.id === session.user.id || e.email.toLowerCase() === sessionEmail
          ) || null;

          if (found) {
            if (isMasterAdminEmail(found.email)) {
              found.isAdmin = true;
              found.adminRole = 'Founder';
            } else {
              found.isAdmin = Boolean(found.isAdmin);
              if (!found.isAdmin) {
                found.adminRole = undefined;
              }
            }
          }

          if (!found && sessionEmail) {
            // Auto-provision profile for active session if missing from database list
            const rawName = sessionEmail.split('@')[0].replace(/[._-]/g, ' ');
            const formattedName = rawName
              .split(' ')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            const isTopRankAdmin = isMasterAdminEmail(sessionEmail);

            const newProfile: Employee = {
              id: session.user.id,
              name: formattedName || 'TopRank Member',
              email: sessionEmail,
              role: isTopRankAdmin ? 'Master Admin' : 'Senior Specialist',
              department: isTopRankAdmin ? 'Management' : 'Development',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'User')}&background=0D8ABC&color=fff`,
              phone: '',
              status: 'active',
              activeSecondsToday: 0,
              lastPunchIn: '09:00 AM',
              hourlyRate: 1000,
              completedTasksCount: 0,
              pendingTasksCount: 0,
              productivityScore: 100,
              isAdmin: isTopRankAdmin,
              adminRole: isTopRankAdmin ? 'Founder' : undefined,
            };

            try {
              await saveEmployee(newProfile);
            } catch (err) {
              console.error('Error saving auto-provisioned profile:', err);
            }

            data.employees.push(newProfile);
            setEmployees([...data.employees]);
            found = newProfile;
          }
        }

        if (!found) {
          const savedEmpId = localStorage.getItem('toprank_current_emp_id');
          found = data.employees.find((e) => e.id === savedEmpId);
        }

        if (found) {
          if (isMasterAdminEmail(found.email)) {
            found.isAdmin = true;
            found.adminRole = 'Founder';
          } else {
            found.isAdmin = Boolean(found.isAdmin);
            if (!found.isAdmin) {
              found.adminRole = undefined;
            }
          }
          setCurrentEmployee(found);
          setActiveSeconds(found.activeSecondsToday || 0);
          localStorage.setItem('toprank_current_emp_id', found.id);
          if (!found.isAdmin) {
            setActiveTab('employee');
          } else {
            setActiveTab('admin');
          }
        } else {
          setShowLoginModal(true);
        }
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      localStorage.setItem('toprank_current_emp_id', currentEmployee.id);
      setActiveSeconds(currentEmployee.activeSecondsToday || 18000);

      // Security Check: If non-admin logged in, enforce non-admin tab access
      if (!currentEmployee.isAdmin && ['admin', 'billing', 'monitoring', 'staffing', 'analytics'].includes(activeTab)) {
        setActiveTab('employee');
      }
    }
  }, [currentEmployee, activeTab]);

  // Live Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isPunchActive && currentEmployee) {
      interval = setInterval(() => {
        setActiveSeconds((prev) => {
          const next = prev + 1;
          // Update current employee active seconds
          setEmployees((empList) =>
            empList.map((e) =>
              e.id === currentEmployee.id ? { ...e, activeSecondsToday: next } : e
            )
          );
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPunchActive, currentEmployee?.id]);

  // Handle Switch User
  const handleSwitchUser = (emp: Employee) => {
    let target = { ...emp };
    if (isMasterAdminEmail(target.email)) {
      target.isAdmin = true;
      target.adminRole = 'Founder';
    }
    setCurrentEmployee(target);
    setActiveSeconds(target.activeSecondsToday || 0);
    localStorage.setItem('toprank_current_emp_id', target.id);
    if (!target.isAdmin) {
      setActiveTab('employee');
    } else {
      setActiveTab('admin');
    }
  };

  // Handle Add Employee
  const handleAddEmployee = async (emp: Employee) => {
    try {
      const saved = await saveEmployee(emp);
      const targetEmp = saved || emp;
      setEmployees((prev) => [
        targetEmp,
        ...prev.filter((e) => e.id !== targetEmp.id && e.email.toLowerCase() !== targetEmp.email.toLowerCase())
      ]);
    } catch (e) {
      console.error('Failed to save employee:', e);
      setEmployees((prev) => [
        emp,
        ...prev.filter((e) => e.id !== emp.id && e.email.toLowerCase() !== emp.email.toLowerCase())
      ]);
    }
  };

  // Handle Remove Employee
  const handleRemoveEmployee = async (id: string) => {
    const targetEmp = employees.find((e) => e.id === id);
    setEmployees((prev) =>
      prev.filter(
        (e) =>
          e.id !== id &&
          (targetEmp ? e.email.toLowerCase() !== targetEmp.email.toLowerCase() : true)
      )
    );
    try {
      await deleteEmployee(id, targetEmp?.email);
    } catch (e) {
      console.error('Error in handleRemoveEmployee:', e);
    }
  };

  // Handle Punch Toggle
  const handleTogglePunch = () => {
    setIsPunchActive(!isPunchActive);
  };

  // Handle Logout
  const handleLogout = async () => {
    localStorage.removeItem('toprank_current_emp_id');
    setCurrentEmployee(null);
    setShowLoginModal(true);
    try {
      await import('./lib/supabaseClient').then(({ supabase }) => supabase.auth.signOut());
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Employee Presence Status Change
  const handleStatusChange = async (status: EmployeePresenceStatus) => {
    const updated = { ...currentEmployee, status } as Employee;
    setCurrentEmployee(updated);
    setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
    try { await saveEmployee(updated); } catch (e) {}
  };

  // Handle Adding Invoice
  const handleAddInvoice = async (newInv: Invoice) => {
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices);

    // Record ledger entry
    const newLeg: LedgerEntry = {
      id: `leg-${Date.now()}`,
      date: '2026-07-31',
      description: `Invoice Billed - ${newInv.projectName}`,
      clientName: newInv.clientName,
      type: 'Invoice Billed',
      amount: newInv.amountTotal,
      balanceAfter: 0,
      referenceNo: newInv.invoiceNumber,
    };
    setLedger([newLeg, ...ledger]);

    try {
      await saveInvoice(newInv);
      await saveLedgerEntry(newLeg);
    } catch (e) {}
  };

  // Handle Recording Client Payment
  const handleRecordPayment = async (
    invoiceId: string,
    amount: number,
    method: string,
    reference: string
  ) => {
    let updatedInvoice: Invoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const newPaid = inv.amountPaid + amount;
        const newPending = Math.max(0, inv.amountTotal - newPaid);
        const newStatus =
          newPending === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

        const historyItem = {
          id: `p-${Date.now()}`,
          amount,
          date: '2026-07-31',
          method,
          reference,
        };

        const result = {
          ...inv,
          amountPaid: newPaid,
          amountPending: newPending,
          status: newStatus,
          paymentHistory: [...(inv.paymentHistory || []), historyItem],
        };
        updatedInvoice = result;
        return result;
      })
    );

    // Add Credit to Ledger
    const targetInv = invoices.find((i) => i.id === invoiceId);
    let newLeg: LedgerEntry | undefined;
    if (targetInv) {
      newLeg = {
        id: `leg-${Date.now()}`,
        date: '2026-07-31',
        description: `${method} Payment - ${targetInv.projectName}`,
        clientName: targetInv.clientName,
        type: 'Credit (Payment Received)',
        amount,
        balanceAfter: 0,
        referenceNo: reference,
      };
      setLedger([newLeg, ...ledger]);
    }

    try {
      if (updatedInvoice) await saveInvoice(updatedInvoice);
      if (newLeg) await saveLedgerEntry(newLeg);
    } catch (e) {}
  };

  // Handle Updating Billed Invoice (Founder Privilege)
  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
    try {
      await saveInvoice(updatedInvoice);
    } catch (e) {}
  };

  // Handle Deleting Invoice (Founder Privilege)
  const handleDeleteInvoice = async (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    try {
      await deleteInvoice(invoiceId);
    } catch (e) {}
  };

  // Handle Updating Task Status or Logged Hours
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: WorkStatus,
    loggedHoursIncrement = 0
  ) => {
    let updatedTask: Task | undefined;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const updatedLogged = t.loggedHours + loggedHoursIncrement;
        const updatedProgress =
          newStatus === 'Completed'
            ? 100
            : newStatus === 'Review'
            ? 90
            : newStatus === 'In Progress'
            ? Math.max(t.progressPercentage, 30)
            : 0;

        const result = {
          ...t,
          status: newStatus,
          loggedHours: updatedLogged,
          progressPercentage: updatedProgress,
        };
        updatedTask = result;
        return result;
      })
    );
    try { if (updatedTask) await saveTask(updatedTask); } catch (e) {}
  };

  // Handle Adding New Task
  const handleAddTask = async (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    try { await saveTask(newTask); } catch (e) {}
  };

  // Handle Meeting Presence Toggle
  const handleToggleMeetingPresence = async (meetingId: string, employeeId: string) => {
    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;

        const updatedAttendees = m.attendees.map((att) =>
          att.employeeId === employeeId
            ? { ...att, isPresent: !att.isPresent }
            : att
        );
        const result = { ...m, attendees: updatedAttendees };
        updatedMeeting = result;
        return result;
      })
    );
    try { if (updatedMeeting) await saveMeeting(updatedMeeting); } catch (e) {}
  };

  // Handle Scheduling Meeting
  const handleScheduleMeeting = async (meeting: Meeting) => {
    setMeetings([meeting, ...meetings]);
    try { await saveMeeting(meeting); } catch (e) {}
  };

  // Handle Posting Discussion
  const handlePostDiscussion = async (disc: TeamDiscussion) => {
    setDiscussions([disc, ...discussions]);
    try { await saveDiscussion(disc); } catch (e) {}
  };

  // Handle Adding Discussion Reply
  const handleAddReply = async (discId: string, replyContent: string) => {
    let updatedDisc: TeamDiscussion | undefined;
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== discId) return d;
        const newReply = {
          id: `r-${Date.now()}`,
          authorName: currentEmployee!.name,
          authorAvatar: currentEmployee!.avatar,
          content: replyContent,
          timestamp: 'Just now',
        };
        const result = { ...d, replies: [...d.replies, newReply] };
        updatedDisc = result;
        return result;
      })
    );
    try { if (updatedDisc) await saveDiscussion(updatedDisc); } catch (e) {}
  };

  // Overdue and Due Soon Invoices Count for Header Badge
  const overdueInvoicesCount = invoices.filter(
    (i) => getInvoiceUrgency(i.dueDate, i.status) === 'OVERDUE'
  ).length;

  const dueSoonInvoicesCount = invoices.filter(
    (i) => getInvoiceUrgency(i.dueDate, i.status) === 'DUE_SOON'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="text-blue-500 font-bold text-xl animate-pulse">Loading CRM Data...</div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative">
        <LoginModal
          employees={employees}
          onClose={() => {}}
          onSelectEmployee={handleSwitchUser}
          isCancellable={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-12">
      {/* Header */}
      <Header
        currentEmployee={currentEmployee}
        allEmployees={employees}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchUser={handleSwitchUser}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        overdueInvoicesCount={overdueInvoicesCount}
        dueSoonInvoicesCount={dueSoonInvoicesCount}
        isPunchActive={isPunchActive}
        activeSeconds={activeSeconds}
        onTogglePunch={handleTogglePunch}
      />

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'admin' && (
          <AdminDashboard
            employees={employees}
            projects={projects}
            invoices={invoices}
            tasks={tasks}
            onNavigateTab={setActiveTab}
            onOpenAddTaskModal={() => {
              setTaskModalEmpId(undefined);
              setShowTaskModal(true);
            }}
          />
        )}

        {activeTab === 'employee' && (
          <EmployeeDashboard
            currentEmployee={currentEmployee}
            tasks={tasks}
            meetings={meetings}
            isPunchActive={isPunchActive}
            activeSeconds={activeSeconds}
            onTogglePunch={handleTogglePunch}
            onStatusChange={handleStatusChange}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'billing' && (
          <ClientFinancialsLedger
            invoices={invoices}
            ledger={ledger}
            currentEmployee={currentEmployee}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onRecordPayment={handleRecordPayment}
            onPrintInvoice={(inv) => setPrintInvoice(inv)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManager
            projects={projects}
            tasks={tasks}
            onOpenAddTaskModal={() => {
              setTaskModalEmpId(undefined);
              setShowTaskModal(true);
            }}
          />
        )}

        {activeTab === 'monitoring' && (
          <EmployeeMonitoring
            employees={employees}
            tasks={tasks}
            onOpenAddTaskModal={(empId) => {
              setTaskModalEmpId(empId);
              setShowTaskModal(true);
            }}
          />
        )}

        {activeTab === 'staffing' && (
          <EmployeeManagement
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        )}

        {activeTab === 'analytics' && (
          <BusinessAnalytics
            employees={employees}
            invoices={invoices}
            ledger={ledger}
            projects={projects}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsAndAttendance
            meetings={meetings}
            attendance={attendance}
            employees={employees}
            currentEmployee={currentEmployee}
            onToggleMeetingPresence={handleToggleMeetingPresence}
            onScheduleMeeting={handleScheduleMeeting}
          />
        )}

        {activeTab === 'discussions' && (
          <TeamDiscussions
            discussions={discussions}
            currentEmployee={currentEmployee}
            onPostDiscussion={handlePostDiscussion}
            onAddReply={handleAddReply}
          />
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          employees={employees}
          onClose={() => setShowLoginModal(false)}
          onSelectEmployee={handleSwitchUser}
        />
      )}

      {/* Assign Task / Work Modal */}
      {showTaskModal && (
        <TaskModal
          employees={employees}
          initialEmployeeId={taskModalEmpId}
          onClose={() => setShowTaskModal(false)}
          onAddTask={handleAddTask}
        />
      )}

      {/* Printable Invoice Modal */}
      {printInvoice && (
        <InvoicePrintModal
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
}
