import React, { useState } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';
import { Task, Employee, TaskPriority } from '../../types';

interface TaskModalProps {
  employees: Employee[];
  initialEmployeeId?: string;
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  employees,
  initialEmployeeId,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('Godrej Capital Ltd.');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    initialEmployeeId || employees[0]?.id || ''
  );
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [dueDate, setDueDate] = useState('2026-08-10');
  const [estimatedHours, setEstimatedHours] = useState(12);
  const [category, setCategory] = useState<Task['category']>('SEO Audit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const emp = employees.find((e) => e.id === assignedEmployeeId) || employees[0];

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      clientName,
      assignedEmployeeId: emp.id,
      assignedEmployeeName: emp.name,
      assignedEmployeeAvatar: emp.avatar,
      priority,
      status: 'To Do',
      dueDate,
      estimatedHours: Number(estimatedHours),
      loggedHours: 0,
      progressPercentage: 0,
      createdDate: '2026-07-31',
      category,
      commentsCount: 0,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase size={18} className="text-blue-400" />
            Assign Work / Deliverable to Employee
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Work / Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mobile Pagespeed Optimization & LCP fixes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Assignee Employee
              </label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Client Account
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              >
                <option value="SEO Audit">SEO Audit</option>
                <option value="Web Development">Web Development</option>
                <option value="Content Marketing">Content Marketing</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="PPC Campaign">PPC Campaign</option>
                <option value="Client Onboarding">Client Onboarding</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Work Instructions & Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide scope details for the employee..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              Assign Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
