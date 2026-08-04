import React, { useState } from 'react';
import { Coffee, CheckCircle2, Camera, ShieldCheck, User, Briefcase } from 'lucide-react';
import { Employee, EmployeePresenceStatus } from '../types';
import { EditProfilePicModal } from './shared/EditProfilePicModal';

interface TimeTrackerWidgetProps {
  currentEmployee: Employee;
  isPunchActive?: boolean;
  activeSeconds?: number;
  onTogglePunch?: () => void;
  onStatusChange: (status: EmployeePresenceStatus) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => Promise<void> | void;
}

export const TimeTrackerWidget: React.FC<TimeTrackerWidgetProps> = ({
  currentEmployee,
  onStatusChange,
  onUpdateAvatar,
}) => {
  const [showEditPicModal, setShowEditPicModal] = useState<boolean>(false);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Employee Info & Avatar Edit */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group cursor-pointer" onClick={() => setShowEditPicModal(true)}>
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/50 shadow-md group-hover:opacity-90 transition-all"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditPicModal(true);
              }}
              className="absolute -top-1.5 -right-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-lg border border-slate-900 transition-transform hover:scale-110"
              title="Change Profile Picture"
            >
              <Camera size={13} />
            </button>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                currentEmployee.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-xl text-white">{currentEmployee.name}</h3>
              <span className="text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2.5 py-0.5 rounded-full">
                {currentEmployee.role}
              </span>
              {currentEmployee.isAdmin && (
                <span className="text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Department: <strong className="text-slate-200">{currentEmployee.department}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-200">{currentEmployee.email}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Presence Status Buttons & Profile Edit */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {onUpdateAvatar && (
            <button
              type="button"
              onClick={() => setShowEditPicModal(true)}
              className="text-xs font-bold text-blue-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Camera size={14} /> Update Photo
            </button>
          )}

          {/* Status Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onStatusChange('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentEmployee.status === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 size={13} />
              Active
            </button>
            <button
              onClick={() => onStatusChange('on_break')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentEmployee.status === 'on_break'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee size={13} />
              Break
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Picture Modal */}
      {showEditPicModal && onUpdateAvatar && (
        <EditProfilePicModal
          isOpen={showEditPicModal}
          onClose={() => setShowEditPicModal(false)}
          currentEmployee={currentEmployee}
          onUpdateAvatar={onUpdateAvatar}
        />
      )}
    </div>
  );
};
