import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Filter,
  Briefcase,
  Check,
  Clock,
  User,
  ChevronDown,
  ListFilter,
  Calendar,
  Eye,
  CheckSquare,
  Hourglass,
  Layers,
} from 'lucide-react';
import { Employee, Task, WorkStatus } from '../../types';

interface EmployeeMonitoringProps {
  employees: Employee[];
  tasks: Task[];
  onOpenAddTaskModal: (employeeId?: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: WorkStatus) => void;
}

export const EmployeeMonitoring: React.FC<EmployeeMonitoringProps> = ({
  employees,
  tasks,
  onOpenAddTaskModal,
  onUpdateTaskStatus,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [workTabFilter, setWorkTabFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // Helper function to match task to an employee by ID, Email or Name
  const getEmployeeTasks = (emp: Employee) => {
    return tasks.filter(
      (t) =>
        (t.assignedEmployeeId && t.assignedEmployeeId === emp.id) ||
        (t.assignedEmployeeEmail &&
          emp.email &&
          t.assignedEmployeeEmail.trim().toLowerCase() === emp.email.trim().toLowerCase()) ||
        (t.assignedEmployeeName &&
          emp.name &&
          t.assignedEmployeeName.trim().toLowerCase() === emp.name.trim().toLowerCase())
    );
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Filtered employees for overview grid when 'ALL' is selected
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (departmentFilter === 'ALL') return true;
    return emp.department === departmentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Main Dropdown Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Users size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Employee Work Inspector & Task Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select an employee from the dropdown to inspect assigned work, track finished vs pending tasks, and assign new deliverables.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Primary Employee Dropdown Selector */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                Choose Staff / Employee:
              </label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setWorkTabFilter('ALL');
                  }}
                  className="w-full bg-slate-50 border-2 border-blue-500/30 hover:border-blue-500 text-xs font-bold text-slate-900 rounded-2xl pl-10 pr-8 py-3 appearance-none focus:outline-none focus:border-blue-600 shadow-2xs transition-all"
                >
                  <option value="ALL">👥 All Employees (Overview Grid)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.name} — {emp.role}
                    </option>
                  ))}
                </select>
                <User size={16} className="absolute left-3.5 top-3.5 text-blue-600 pointer-events-none" />
                <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Global Assign Work Button */}
            <div className="self-end sm:self-auto pt-4 sm:pt-0">
              <button
                onClick={() => onOpenAddTaskModal(selectedEmployeeId !== 'ALL' ? selectedEmployeeId : undefined)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                + Assign Work {selectedEmployee ? `to ${selectedEmployee.name.split(' ')[0]}` : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Search & Department Filters (When in ALL mode) */}
        {selectedEmployeeId === 'ALL' && (
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1 shrink-0">
                <Filter size={13} />
                Dept:
              </span>
              {['ALL', 'SEO & Growth', 'Development', 'Design & Creative', 'Client Success', 'Management'].map(
                (dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      departmentFilter === dept
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {dept}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* SINGLE EMPLOYEE DETAILED WORK INSPECTION VIEW */}
      {selectedEmployee ? (
        (() => {
          const empTasks = getEmployeeTasks(selectedEmployee);
          const completedTasks = empTasks.filter((t) => t.status === 'Completed');
          const pendingTasks = empTasks.filter((t) => t.status !== 'Completed');
          const completionPercentage = empTasks.length
            ? Math.round((completedTasks.length / empTasks.length) * 100)
            : 0;

          const displayedTasks = empTasks.filter((t) => {
            if (workTabFilter === 'COMPLETED') return t.status === 'Completed';
            if (workTabFilter === 'PENDING') return t.status !== 'Completed';
            return true;
          });

          return (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Employee Banner Profile & Stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedEmployee.avatar}
                        alt={selectedEmployee.name}
                        className="w-16 h-16 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          selectedEmployee.status === 'active'
                            ? 'bg-emerald-500 animate-pulse'
                            : selectedEmployee.status === 'in_meeting'
                            ? 'bg-blue-500'
                            : selectedEmployee.status === 'on_break'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-xl text-slate-900">{selectedEmployee.name}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            selectedEmployee.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {selectedEmployee.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 font-bold mt-0.5">{selectedEmployee.role}</p>
                      <p className="text-xs text-slate-500">{selectedEmployee.department} • {selectedEmployee.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => setSelectedEmployeeId('ALL')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      ← Back to All Staff
                    </button>
                    <button
                      onClick={() => onOpenAddTaskModal(selectedEmployee.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={15} />
                      + Assign New Work
                    </button>
                  </div>
                </div>

                {/* Performance & Work Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Work */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Work Assigned</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{empTasks.length}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tasks created for this employee</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Layers size={22} />
                    </div>
                  </div>

                  {/* Work Done (Kya Kiya) */}
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Work Done (Completed)
                      </p>
                      <p className="text-2xl font-black text-emerald-800 mt-1">{completedTasks.length}</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">{completionPercentage}% Work completed</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckSquare size={22} />
                    </div>
                  </div>

                  {/* Work Pending (Kya Baki Hai) */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                        <Hourglass size={13} />
                        Work Pending (To Do)
                      </p>
                      <p className="text-2xl font-black text-amber-800 mt-1">{pendingTasks.length}</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Remaining deliverable items</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Clock size={22} />
                    </div>
                  </div>

                  {/* Overall Progress Rate */}
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Completion Rate</p>
                      <p className="text-2xl font-black text-blue-900 mt-1">{completionPercentage}%</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Items List & Filter Tabs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />
                    Work Breakdown for {selectedEmployee.name}
                  </h3>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setWorkTabFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        workTabFilter === 'ALL'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Work ({empTasks.length})
                    </button>

                    <button
                      onClick={() => setWorkTabFilter('PENDING')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        workTabFilter === 'PENDING'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                    >
                      ⏳ Pending ({pendingTasks.length})
                    </button>

                    <button
                      onClick={() => setWorkTabFilter('COMPLETED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        workTabFilter === 'COMPLETED'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                    >
                      ✓ Completed ({completedTasks.length})
                    </button>
                  </div>
                </div>

                {/* Work Cards Rendering */}
                {displayedTasks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <CheckCircle2 size={36} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">
                      No work items in "{workTabFilter}" tab
                    </p>
                    <p className="text-xs text-slate-400">
                      Use the "+ Assign New Work" button to assign tasks to {selectedEmployee.name}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedTasks.map((t, idx) => {
                      const isDone = t.status === 'Completed';

                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            isDone
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    t.priority === 'Urgent'
                                      ? 'bg-rose-100 text-rose-800'
                                      : t.priority === 'High'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {t.priority}
                                </span>

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : t.status === 'In Progress'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {isDone ? '✓ Completed' : t.status}
                                </span>

                                {t.category && (
                                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {t.category}
                                  </span>
                                )}
                              </div>

                              <h4
                                className={`font-bold text-sm ${
                                  isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                                }`}
                              >
                                {t.title}
                              </h4>

                              {t.description && (
                                <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                              )}

                              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                                <span>Client: <strong className="text-slate-800">{t.clientName}</strong></span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400" />
                                  Due: <strong className="text-slate-900 font-mono">{t.dueDate}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Admin Status Toggle */}
                          {onUpdateTaskStatus && (
                            <div className="shrink-0 self-end md:self-center">
                              <select
                                value={t.status}
                                onChange={(e) =>
                                  onUpdateTaskStatus(t.id, e.target.value as WorkStatus)
                                }
                                className={`text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none cursor-pointer shadow-2xs ${
                                  isDone
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                    : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <option value="To Do">Status: To Do</option>
                                <option value="In Progress">Status: In Progress</option>
                                <option value="Review">Status: Under Review</option>
                                <option value="Completed">Status: Completed ✓</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        /* ALL EMPLOYEES GRID OVERVIEW VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const empTasks = getEmployeeTasks(emp);
            const completedTasks = empTasks.filter((t) => t.status === 'Completed');
            const pendingTasks = empTasks.filter((t) => t.status !== 'Completed');

            return (
              <div
                key={emp.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 shadow-sm space-y-4 hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Profile Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            emp.status === 'active'
                              ? 'bg-emerald-500 animate-pulse'
                              : emp.status === 'in_meeting'
                              ? 'bg-blue-500'
                              : emp.status === 'on_break'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                          {emp.isAdmin && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 font-semibold">{emp.role}</p>
                        <p className="text-[10px] text-slate-500">{emp.department}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {emp.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Work Completed vs Pending Bar */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned</span>
                      <p className="font-black text-slate-900 text-sm mt-0.5">{empTasks.length}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</span>
                      <p className="font-black text-amber-600 text-sm mt-0.5">{pendingTasks.length}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Done ✓</span>
                      <p className="font-black text-emerald-600 text-sm mt-0.5">{completedTasks.length}</p>
                    </div>
                  </div>

                  {/* Assigned Work Items List Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Assigned Work List</span>
                      <span>{empTasks.length} items</span>
                    </div>

                    {empTasks.length > 0 ? (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {empTasks.map((t) => (
                          <div
                            key={t.id}
                            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={`font-semibold text-xs truncate ${
                                  t.status === 'Completed'
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-800'
                                }`}
                              >
                                {t.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                Client: {t.clientName} | Due: {t.dueDate}
                              </p>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0 ${
                                t.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : t.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.status === 'Completed' ? '✓ Done' : t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-400 italic text-[11px] text-center">
                        No work assigned yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Eye size={14} className="text-blue-600" />
                    Inspect Work
                  </button>

                  <button
                    onClick={() => onOpenAddTaskModal(emp.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Plus size={14} />
                    + Assign Work
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

