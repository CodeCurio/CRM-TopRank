import React, { useState } from 'react';
import { Plus, X, Briefcase, Trash2, ListPlus, CheckCircle2, Layers } from 'lucide-react';
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
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    initialEmployeeId || employees[0]?.id || ''
  );
  const [clientName, setClientName] = useState('Godrej Capital Ltd.');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [dueDate, setDueDate] = useState('2026-08-10');
  const [category, setCategory] = useState<Task['category']>('SEO Audit');

  // Single Work Input State
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');

  // Work Items List State (Batch / Queue System)
  const [workList, setWorkList] = useState<Array<{ id: string; title: string; description: string }>>([]);

  const handleAddToList = () => {
    if (!currentTitle.trim()) return;
    setWorkList((prev) => [
      ...prev,
      {
        id: `work-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: currentTitle.trim(),
        description: currentDescription.trim(),
      },
    ]);
    setCurrentTitle('');
    setCurrentDescription('');
  };

  const handleRemoveFromList = (id: string) => {
    setWorkList((prev) => prev.filter((item) => item.id !== id));
  };

  // Success confirmation state
  const [successInfo, setSuccessInfo] = useState<{ empName: string; count: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emp = employees.find((e) => e.id === assignedEmployeeId) || employees[0];
    if (!emp) return;

    // Determine tasks to create
    const itemsToAssign = [...workList];

    // If list is empty but user filled current title, add it as single task
    if (itemsToAssign.length === 0 && currentTitle.trim()) {
      itemsToAssign.push({
        id: `work-item-single`,
        title: currentTitle.trim(),
        description: currentDescription.trim(),
      });
    }

    if (itemsToAssign.length === 0) {
      alert('Please enter a work title or add work items to the list.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Create tasks for each item
    itemsToAssign.forEach((item, idx) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${idx}`,
        title: item.title,
        description: item.description,
        clientName: clientName || 'General Work',
        assignedEmployeeId: emp.id,
        assignedEmployeeName: emp.name,
        assignedEmployeeAvatar: emp.avatar,
        assignedEmployeeEmail: emp.email,
        priority,
        status: 'To Do',
        dueDate,
        estimatedHours: 0,
        loggedHours: 0,
        progressPercentage: 0,
        createdDate: todayStr,
        category,
        commentsCount: 0,
      };

      onAddTask(newTask);
    });

    setSuccessInfo({
      empName: emp.name,
      count: itemsToAssign.length,
    });
  };

  if (successInfo) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Work Assigned Successfully!</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Assigned <strong className="text-blue-600">{successInfo.count} work item(s)</strong> to{' '}
              <strong className="text-slate-900">{successInfo.empName}</strong>.
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mt-3">
              ✓ The assigned work is now immediately visible on the employee's portal dashboard.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
          >
            Done & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 text-slate-900 shadow-2xl my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Work to Staff</h3>
              <p className="text-xs text-slate-500">Create & assign individual or list of work items</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee & Client Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assignee Employee <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client / Project Account
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Godrej Capital Ltd."
              />
            </div>
          </div>

          {/* Priority, Category & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="SEO Audit">SEO Audit</option>
                <option value="Web Development">Web Development</option>
                <option value="Content Marketing">Content Marketing</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="PPC Campaign">PPC Campaign</option>
                <option value="Client Onboarding">Client Onboarding</option>
                <option value="General Task">General Task</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Work List Builder Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ListPlus size={16} className="text-blue-600" />
                Add Work Items / Tasks
              </label>
              {workList.length > 0 && (
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {workList.length} Work Items in List
                </span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter work title (e.g. Update Mobile Homepage Banner)..."
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddToList();
                  }
                }}
                className="w-full bg-white border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional brief description / instructions..."
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-300 text-xs font-medium text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddToList}
                  disabled={!currentTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <Plus size={15} /> Add to List
                </button>
              </div>
            </div>

            {/* Rendered Work List Queue */}
            {workList.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 pt-2 border-t border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Queued Work Items List:
                </p>
                {workList.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromList(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {workList.length > 0
                ? `${workList.length} tasks will be assigned`
                : currentTitle.trim()
                ? '1 task will be assigned'
                : 'Add work items above'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                {workList.length > 1 ? `Assign All ${workList.length} Tasks` : 'Assign Work'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

