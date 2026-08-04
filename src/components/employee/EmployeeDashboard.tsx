import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Calendar,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { Employee, Task, Meeting, WorkStatus } from '../../types';
import { TimeTrackerWidget } from '../TimeTrackerWidget';

interface EmployeeDashboardProps {
  currentEmployee: Employee;
  tasks: Task[];
  meetings: Meeting[];
  isPunchActive?: boolean;
  activeSeconds?: number;
  onTogglePunch?: () => void;
  onStatusChange: (status: any) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: WorkStatus, loggedHoursIncrement?: number) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => Promise<void> | void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentEmployee,
  tasks,
  meetings,
  onStatusChange,
  onUpdateTaskStatus,
  onUpdateAvatar,
}) => {
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Helper to match task to employee by ID, Email, or Name
  const isTaskForEmployee = (task: Task, emp: Employee) => {
    if (!task || !emp) return false;
    if (task.assignedEmployeeId && task.assignedEmployeeId === emp.id) return true;
    if (
      task.assignedEmployeeEmail &&
      emp.email &&
      task.assignedEmployeeEmail.trim().toLowerCase() === emp.email.trim().toLowerCase()
    ) {
      return true;
    }
    if (
      task.assignedEmployeeName &&
      emp.name &&
      task.assignedEmployeeName.trim().toLowerCase() === emp.name.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  // Filter tasks assigned to this logged-in employee
  const myTasks = tasks.filter((t) => isTaskForEmployee(t, currentEmployee));

  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (taskFilter === 'ALL') return true;
    if (taskFilter === 'PENDING') return t.status !== 'Completed';
    return t.status === taskFilter;
  });

  const completedCount = myTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = myTasks.filter((t) => t.status !== 'Completed').length;
  const totalCount = myTasks.length;

  const handleToggleTaskCompletion = (task: Task) => {
    const nextStatus: WorkStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    onUpdateTaskStatus(task.id, nextStatus);
  };

  return (
    <div className="space-y-6">
      {/* Employee Profile Header */}
      <TimeTrackerWidget
        currentEmployee={currentEmployee}
        onStatusChange={onStatusChange}
        onUpdateAvatar={onUpdateAvatar}
      />

      {/* Overview KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Assigned Tasks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Briefcase size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pending Tasks</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">In Progress Tasks</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Completed Tasks</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Work Section - Tasks Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              My Work Section ({myTasks.length} Assigned Tasks)
            </h2>
            <p className="text-xs text-slate-500">
              Check off completed tasks assigned by Admin to update work progress in real-time
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-56">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search assigned work..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
              {[
                { label: 'ALL', key: 'ALL' },
                { label: 'PENDING', key: 'PENDING' },
                { label: 'IN PROGRESS', key: 'In Progress' },
                { label: 'COMPLETED', key: 'Completed' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTaskFilter(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    taskFilter === item.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm text-slate-700">No tasks found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {myTasks.length === 0
                  ? 'Admin has not assigned any tasks yet.'
                  : 'No tasks match the selected search or status filter.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Left: Checkbox & Task Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTaskCompletion(task)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                          : 'border-slate-300 hover:border-blue-500 bg-white text-transparent'
                      }`}
                      title={isCompleted ? 'Mark as Incomplete' : 'Check to Mark Completed'}
                    >
                      <Check size={14} className="stroke-[3]" />
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : task.status === 'Review'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {task.status}
                        </span>

                        {task.category && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {task.category}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`font-bold text-sm ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                        <span>Client: <strong className="text-slate-800">{task.clientName || 'General Work'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Calendar size={12} className="text-slate-400" />
                          Due Date: <strong className="text-slate-900">{task.dueDate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons & Status Selector */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Direct Check / Uncheck Action */}
                    <button
                      onClick={() => handleToggleTaskCompletion(task)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                        isCompleted
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>{isCompleted ? 'Task Completed' : 'Mark Completed'}</span>
                    </button>

                    {/* Change Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as WorkStatus)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Under Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
