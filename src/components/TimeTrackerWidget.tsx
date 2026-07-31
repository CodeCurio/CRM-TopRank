import React from 'react';
import { Play, Pause, Coffee, CheckCircle2, Zap } from 'lucide-react';
import { Employee, EmployeePresenceStatus } from '../types';
import { formatSecondsDigital, formatSecondsToHM } from '../utils/formatters';

interface TimeTrackerWidgetProps {
  currentEmployee: Employee;
  isPunchActive: boolean;
  activeSeconds: number;
  onTogglePunch: () => void;
  onStatusChange: (status: EmployeePresenceStatus) => void;
}

export const TimeTrackerWidget: React.FC<TimeTrackerWidgetProps> = ({
  currentEmployee,
  isPunchActive,
  activeSeconds,
  onTogglePunch,
  onStatusChange,
}) => {
  const targetSeconds = 8 * 3600; // 8 hours goal
  const progressPercent = Math.min(100, Math.round((activeSeconds / targetSeconds) * 100));

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Punch Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/50 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                isPunchActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">{currentEmployee.name}</h3>
              <span className="text-[11px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">
                {currentEmployee.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Punched In at: <span className="text-slate-200 font-medium">{currentEmployee.lastPunchIn || '09:00 AM'}</span> | Dept: {currentEmployee.department}
            </p>
          </div>
        </div>

        {/* Center: Live Digital Clock & Progress */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800 w-full md:w-auto min-w-[240px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap size={12} className="text-amber-400" />
            Portal Active Time Today
          </span>
          <div className="font-mono text-3xl font-extrabold text-amber-400 tracking-tight">
            {formatSecondsDigital(activeSeconds)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">
            {progressPercent}% of 8.0h Daily Goal ({formatSecondsToHM(activeSeconds)})
          </span>
        </div>

        {/* Right: Actions (Punch In/Out & Status Selector) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onStatusChange('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentEmployee.status === 'on_break'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee size={13} />
              Break
            </button>
          </div>

          {/* Punch Toggle Button */}
          <button
            onClick={onTogglePunch}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              isPunchActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ring-2 ring-emerald-500/30'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
            }`}
          >
            {isPunchActive ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPunchActive ? 'PAUSE TIMER' : 'START PUNCH'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
