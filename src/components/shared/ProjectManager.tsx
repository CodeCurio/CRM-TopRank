import React, { useState } from 'react';
import { Briefcase, Calendar, DollarSign, User, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import { Project, Task } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProjectManagerProps {
  projects: Project[];
  tasks: Task[];
  onOpenAddTaskModal: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  tasks,
  onOpenAddTaskModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.leadEmployeeName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            Ongoing Work Status & Client Projects
          </h2>
          <p className="text-xs text-slate-500">
            Check client project completion progress, budgets, assigned leads, and ongoing status updates
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Project or Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={onOpenAddTaskModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            + New Project Deliverable
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => {
          const projectTasks = tasks.filter((t) => t.clientName === proj.clientName);
          const completedCount = projectTasks.filter((t) => t.status === 'Completed').length;

          return (
            <div
              key={proj.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {proj.clientName}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{proj.name}</h3>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    proj.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : proj.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

              {/* Status Note */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} />
                  Latest Ongoing Work Status Note:
                </span>
                <p className="text-slate-700 italic">{proj.ongoingStatusNote}</p>
              </div>

              {/* Progress & Financials */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-300">
                  <span>Overall Project Completion</span>
                  <span className="font-mono font-bold text-emerald-400">{proj.completionRate}%</span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${proj.completionRate}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                  <div>
                    Project Lead: <strong className="text-white">{proj.leadEmployeeName}</strong>
                  </div>
                  <div className="text-right">
                    Deadline: <strong className="text-amber-300">{proj.deadline}</strong>
                  </div>
                  <div>
                    Total Budget: <strong className="text-white">{formatCurrency(proj.totalBudget)}</strong>
                  </div>
                  <div className="text-right">
                    Spent: <strong className="text-emerald-400">{formatCurrency(proj.spentBudget)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
