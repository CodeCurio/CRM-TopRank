import React from 'react';
import {
  ShieldCheck,
  User,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  ExternalLink,
  LogOut,
  ChevronDown,
  Sparkles,
  UserPlus,
  BarChart3,
  Camera,
} from 'lucide-react';
import { Employee } from '../types';
import { formatSecondsDigital } from '../utils/formatters';
import { EditProfilePicModal } from './shared/EditProfilePicModal';

interface HeaderProps {
  currentEmployee: Employee;
  allEmployees: Employee[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchUser: (emp: Employee) => void;
  onOpenLoginModal: () => void;
  onLogout?: () => void; // Added optional onLogout
  onUpdateAvatar?: (newAvatarUrl: string) => Promise<void> | void;
  overdueInvoicesCount: number;
  dueSoonInvoicesCount: number;
  isPunchActive: boolean;
  activeSeconds: number;
  onTogglePunch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEmployee,
  allEmployees,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onOpenLoginModal,
  onLogout,
  onUpdateAvatar,
  overdueInvoicesCount,
  dueSoonInvoicesCount,
  isPunchActive,
  activeSeconds,
  onTogglePunch,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showEditPicModal, setShowEditPicModal] = React.useState(false);

  const totalUrgentAlerts = overdueInvoicesCount + dueSoonInvoicesCount;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner with Brand Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Website Link */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.toprankindia.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FTopRank%20logo.0yo.5zwcff6~f.webp&w=128&q=75" 
              alt="TopRank Logo" 
              className="h-10 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl tracking-tight">
                  CRM <span className="text-[#215DBC] font-light">Portal</span>
                </span>
              </div>
              <a
                href="https://toprankindia.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                toprankindia.com
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-medium">TopRank Work Portal Active</span>
          </div>
        </div>

        {/* Right Section: Due Date Alert & Profile Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Urgent Payment Due Alert Badge */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                totalUrgentAlerts > 0
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 animate-blink-due hover:bg-rose-900'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
              title="Click to open Client Billing & Ledger Due Date Alerts"
            >
              <AlertTriangle
                size={14}
                className={totalUrgentAlerts > 0 ? 'text-rose-400 animate-bounce' : ''}
              />
              <span>
                {totalUrgentAlerts > 0
                  ? `${totalUrgentAlerts} Due Alerts!`
                  : 'Billing Active'}
              </span>
              {totalUrgentAlerts > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {overdueInvoicesCount} Overdue
                </span>
              )}
            </button>
          )}

          {/* User Profile / Persona Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
            >
              <img
                src={currentEmployee.avatar}
                alt={currentEmployee.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {currentEmployee.name}
                  {currentEmployee.isAdmin && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      currentEmployee.adminRole === 'Founder' 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    }`}>
                      {currentEmployee.adminRole === 'Founder' ? '👑 Founder' : currentEmployee.adminRole === 'Co-Founder' ? '🛡️ Co-Founder' : '👑 Admin'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-blue-300 truncate max-w-[120px]">
                  {currentEmployee.role}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-slate-200">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-medium text-slate-400">Current Login:</p>
                  <p className="text-sm font-bold text-white">{currentEmployee.name}</p>
                  <p className="text-xs text-blue-400">{currentEmployee.email}</p>
                </div>

                {onUpdateAvatar && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowEditPicModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-blue-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
                    >
                      <Camera size={14} className="text-blue-400" />
                      Edit Profile Picture
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        onOpenLoginModal();
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {/* Executive Admin View */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck size={15} className="text-amber-400" />
              Executive Admin Dashboard
            </button>
          )}

          {/* Employee Workspace */}
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'employee'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User size={15} />
            My Work & Attendance
          </button>

          {/* Billing & Client Ledger */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative ${
                activeTab === 'billing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText size={15} />
              Billing & Invoice
              {overdueInvoicesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          )}

          {/* Ongoing Projects & Work Status */}
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Briefcase size={15} />
            Work Progress & Projects
          </button>

          {/* Employee Work Inspector */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'monitoring'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users size={15} />
              Staff Work Inspector & Tasks
            </button>
          )}

          {/* Employee Management */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('staffing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'staffing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <UserPlus size={15} />
              Manage Staff
            </button>
          )}

          {/* Sales, Expansion & Revenue Analytics */}
          {currentEmployee.isAdmin && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 size={15} className="text-emerald-400" />
              Sales & Business Tracking
            </button>
          )}

          {/* Team Meetings & Presence */}
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'meetings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar size={15} />
            Meetings & Attendance Sheet
          </button>

          {/* Discussions */}
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'discussions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare size={15} />
            Team Discussions
          </button>
        </div>
      </div>
    </header>
  );
};
