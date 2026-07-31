import React, { useState } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Phone, Mail, Award, Search, Plus, Filter } from 'lucide-react';
import { Employee, Task } from '../../types';
import { formatSecondsToHM } from '../../utils/formatters';

interface EmployeeMonitoringProps {
  employees: Employee[];
  tasks: Task[];
  onOpenAddTaskModal: (employeeId?: string) => void;
}

export const EmployeeMonitoring: React.FC<EmployeeMonitoringProps> = ({
  employees,
  tasks,
  onOpenAddTaskModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

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
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Employee Active Time & Performance Monitor
          </h2>
          <p className="text-xs text-slate-500">
            Track portal active hours, daily punch status, active tasks, and team productivity scores
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => onOpenAddTaskModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            + Assign Work
          </button>
        </div>
      </div>

      {/* Department Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Filter size={13} />
          Dept:
        </span>
        {['ALL', 'SEO & Growth', 'Development', 'Design & Creative', 'Client Success', 'Management'].map(
          (dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                departmentFilter === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {dept}
            </button>
          )
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          const empTasks = tasks.filter((t) => t.assignedEmployeeId === emp.id);
          const activeTask = empTasks.find((t) => t.status === 'In Progress');

          return (
            <div
              key={emp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4 hover:border-slate-300 transition-all relative overflow-hidden"
            >
              {/* Top Employee Profile */}
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
                    <div className="flex items-center gap-2">
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

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      emp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : emp.status === 'in_meeting'
                        ? 'bg-blue-100 text-blue-800'
                        : emp.status === 'on_break'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {emp.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Portal Active Hours Stats */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Clock size={12} className="text-amber-600" />
                    Active Time Today
                  </span>
                  <p className="font-mono font-bold text-amber-600 text-sm mt-0.5">
                    {formatSecondsToHM(emp.activeSecondsToday)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Award size={12} className="text-emerald-600" />
                    Productivity Score
                  </span>
                  <p className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                    {emp.productivityScore}%
                  </p>
                </div>
              </div>

              {/* Current Active Task */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Current Working Task
                </span>
                {activeTask ? (
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    <p className="font-semibold text-white truncate">{activeTask.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Client: {activeTask.clientName}</span>
                      <span className="font-mono text-blue-300">
                        {activeTask.progressPercentage}% done
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 text-slate-500 italic text-[11px]">
                    No active task currently logged
                  </div>
                )}
              </div>

              {/* Work Assigned & Action Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-400 text-[11px]">
                  Tasks Assigned:{' '}
                  <span className="font-bold text-white">{empTasks.length} total</span>
                </div>

                <button
                  onClick={() => onOpenAddTaskModal(emp.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus size={13} />
                  Assign Work
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
