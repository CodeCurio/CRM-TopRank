import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  Briefcase,
  AlertCircle,
  Calendar,
  MessageSquare,
  Plus,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Employee, Task, Meeting, WorkStatus } from '../../types';
import { TimeTrackerWidget } from '../TimeTrackerWidget';

interface EmployeeDashboardProps {
  currentEmployee: Employee;
  tasks: Task[];
  meetings: Meeting[];
  isPunchActive: boolean;
  activeSeconds: number;
  onTogglePunch: () => void;
  onStatusChange: (status: any) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: WorkStatus, loggedHoursIncrement?: number) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentEmployee,
  tasks,
  meetings,
  isPunchActive,
  activeSeconds,
  onTogglePunch,
  onStatusChange,
  onUpdateTaskStatus,
}) => {
  const [taskFilter, setTaskFilter] = useState<string>('ALL');

  // Filter tasks assigned to this logged-in employee
  const myTasks = tasks.filter((t) => t.assignedEmployeeId === currentEmployee.id);

  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  const completedCount = myTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = myTasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Live Time Tracker Clock Widget */}
      <TimeTrackerWidget
        currentEmployee={currentEmployee}
        isPunchActive={isPunchActive}
        activeSeconds={activeSeconds}
        onTogglePunch={onTogglePunch}
        onStatusChange={onStatusChange}
      />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pending Work Deliverables</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Completed Deliverables</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Work Assignments Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" />
              My Assigned Work & Project Tasks ({myTasks.length})
            </h2>
            <p className="text-xs text-slate-500">
              Update task progress, move work status, and log hours worked
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {['ALL', 'In Progress', 'To Do', 'Review', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setTaskFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  taskFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              No tasks found in this status category.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                          : task.priority === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {task.priority} Priority
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        task.status === 'Completed'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                          : task.status === 'Review'
                          ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mt-2">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                  <p className="text-[11px] text-blue-400 mt-1 font-semibold">
                    Client: {task.clientName} | Category: {task.category}
                  </p>
                </div>

                {/* Progress Bar & Hours */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>
                      Logged: <strong className="text-white">{task.loggedHours} hrs</strong> / Est: {task.estimatedHours} hrs
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Due: {task.dueDate}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${task.progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* Actions to move status */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() =>
                        onUpdateTaskStatus(task.id, task.status, 1)
                      }
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                      title="Log +1 Hour Worked"
                    >
                      <Plus size={11} /> +1 Hr Log
                    </button>

                    <div className="flex items-center gap-1">
                      {task.status === 'To Do' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          Start Work <ChevronRight size={13} />
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'Review')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          Send for Review <ChevronRight size={13} />
                        </button>
                      )}
                      {task.status === 'Review' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          Mark Complete <CheckCircle2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
