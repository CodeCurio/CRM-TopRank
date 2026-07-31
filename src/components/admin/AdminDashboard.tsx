import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Briefcase,
  FileText,
  Plus,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Employee, Project, Invoice, Task } from '../../types';
import { formatCurrency, formatSecondsToHM, getInvoiceUrgency } from '../../utils/formatters';

interface AdminDashboardProps {
  employees: Employee[];
  projects: Project[];
  invoices: Invoice[];
  tasks: Task[];
  onNavigateTab: (tab: string) => void;
  onOpenAddTaskModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  projects,
  invoices,
  tasks,
  onNavigateTab,
  onOpenAddTaskModal,
}) => {
  // Compute Key Financial Metrics
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amountTotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.amountPending, 0);

  const urgentAlertsCount = invoices.filter(
    (inv) =>
      getInvoiceUrgency(inv.dueDate, inv.status) === 'OVERDUE' ||
      getInvoiceUrgency(inv.dueDate, inv.status) === 'DUE_SOON'
  ).length;

  // Compute Active Employees Metrics
  const activeCount = employees.filter((e) => e.status === 'active' || e.status === 'in_meeting').length;
  const avgProductivity = Math.round(
    employees.reduce((acc, e) => acc + e.productivityScore, 0) / (employees.length || 1)
  );

  // Compute Task Distribution for Recharts
  const taskStatusCounts = {
    'To Do': tasks.filter((t) => t.status === 'To Do').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    Review: tasks.filter((t) => t.status === 'Review').length,
    Completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  const taskPieData = [
    { name: 'To Do', value: taskStatusCounts['To Do'], color: '#f59e0b' },
    { name: 'In Progress', value: taskStatusCounts['In Progress'], color: '#3b82f6' },
    { name: 'Review', value: taskStatusCounts['Review'], color: '#8b5cf6' },
    { name: 'Completed', value: taskStatusCounts['Completed'], color: '#10b981' },
  ];

  // Financial Chart Data per Client
  const clientFinancialData = invoices.map((inv) => ({
    client: inv.clientName.split(' ')[0],
    Paid: inv.amountPaid,
    Pending: inv.amountPending,
  }));

  // Employee Time Chart Data
  const employeeTimeData = employees.map((emp) => ({
    name: emp.name.split(' ')[0],
    Hours: Number((emp.activeSecondsToday / 3600).toFixed(1)),
    Productivity: emp.productivityScore,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck size={13} />
              EXECUTIVE DIRECTOR DESK
            </span>
            <span className="text-xs text-blue-300 font-semibold">TopRank India CRM v2.4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Welcome, Rajesh Malhotra
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Monitor real-time employee activity, client billing ledgers, overdue payment alerts, and ongoing deliverable statuses across all TopRank teams.
          </p>
        </div>

        {/* Quick Executive Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onOpenAddTaskModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Assign Work To Employee
          </button>
          <button
            onClick={() => onNavigateTab('billing')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText size={15} />
            Ledger & Invoices
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Workforce */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Active Workforce Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
            <span className="text-xs text-slate-500">/ {employees.length} Staff Online</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Avg Productivity:</span>
            <span className="font-bold text-emerald-600">{avgProductivity}% Score</span>
          </div>
        </div>

        {/* Total Billed & Collection Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Active Revenue Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalPaid)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Total Billed: {formatCurrency(totalBilled)}</span>
            <span className="font-bold text-emerald-600">
              {Math.round((totalPaid / (totalBilled || 1)) * 100)}% Collected
            </span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Pending Dues
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {formatCurrency(totalPending)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Outstanding Client Ledger</span>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-blue-600 hover:underline text-[10px] font-bold"
            >
              View Invoices &rarr;
            </button>
          </div>
        </div>

        {/* Blinking Due Date Alerts Card */}
        <div
          onClick={() => onNavigateTab('billing')}
          className={`cursor-pointer rounded-2xl p-5 text-white shadow-lg transition-all ${
            urgentAlertsCount > 0
              ? 'bg-rose-950/90 border border-rose-600 animate-blink-due hover:brightness-110'
              : 'bg-slate-900 border border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-rose-300 flex items-center gap-1">
              <AlertTriangle size={15} className="animate-bounce" />
              Due Date Alerts
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-bold text-rose-300 mt-2">
            {urgentAlertsCount} Action Pending
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-rose-200 pt-2 border-t border-rose-800/80 font-bold">
            <span>Click to filter overdue invoices</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Revenue: Paid vs Pending (Recharts Bar Chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Client Account Ledger Breakdown (Paid vs Pending)
              </h3>
              <p className="text-xs text-slate-500">Financial distribution across active client accounts</p>
            </div>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Full Ledger &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientFinancialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="client" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Amount Paid" />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Amount Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Deliverable Status Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" />
              Work Progress Breakdown
            </h3>
            <p className="text-xs text-slate-500">Total assigned client tasks by status</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {taskPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Live Monitoring Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Live Employee Workforce Status & Portal Time Today
            </h3>
            <p className="text-xs text-slate-500">Real-time active hours, punch status, and productivity tracking</p>
          </div>
          <button
            onClick={() => onNavigateTab('monitoring')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            Detailed Employee Monitor &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="relative">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    emp.status === 'active'
                      ? 'bg-emerald-500'
                      : emp.status === 'in_meeting'
                      ? 'bg-blue-500'
                      : emp.status === 'on_break'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{emp.name}</h4>
                  <span className="text-[10px] font-bold text-amber-600 font-mono">
                    {formatSecondsToHM(emp.activeSecondsToday)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>Productivity: <strong className="text-emerald-600">{emp.productivityScore}%</strong></span>
                  <span className="capitalize text-slate-700">{emp.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
