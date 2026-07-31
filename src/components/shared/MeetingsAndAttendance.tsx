import React, { useState } from 'react';
import { Calendar, Video, CheckCircle, Clock, MapPin, Plus, UserCheck, Users, ExternalLink } from 'lucide-react';
import { Meeting, AttendanceRecord, Employee } from '../../types';

interface MeetingsAndAttendanceProps {
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  employees: Employee[];
  currentEmployee: Employee;
  onToggleMeetingPresence: (meetingId: string, employeeId: string) => void;
  onScheduleMeeting: (meeting: Meeting) => void;
}

export const MeetingsAndAttendance: React.FC<MeetingsAndAttendanceProps> = ({
  meetings,
  attendance,
  employees,
  currentEmployee,
  onToggleMeetingPresence,
  onScheduleMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'attendance'>('meetings');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Meeting State
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('TopRank General Sync');
  const [newDate, setNewDate] = useState('2026-08-01');
  const [newStartTime, setNewStartTime] = useState('11:00 AM');
  const [newEndTime, setNewEndTime] = useState('11:45 AM');
  const [newAgenda, setNewAgenda] = useState('');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newM: Meeting = {
      id: `m-${Date.now()}`,
      title: newTitle,
      projectName: newProject,
      hostName: currentEmployee.name,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      meetLink: `https://meet.google.com/toprank-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Upcoming',
      agenda: newAgenda || 'Team alignment & project progress sync.',
      attendees: employees.map((e) => ({
        employeeId: e.id,
        employeeName: e.name,
        status: 'Accepted',
        isPresent: false,
      })),
    };

    onScheduleMeeting(newM);
    setShowScheduleModal(false);
    setNewTitle('');
    setNewAgenda('');
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'meetings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video size={15} />
            Team Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={15} />
            Daily Attendance Sheet
          </button>
        </div>

        {activeTab === 'meetings' && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            + Schedule Meeting
          </button>
        )}
      </div>

      {activeTab === 'meetings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {m.projectName}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Host: {m.hostName}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    m.status === 'Live'
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : m.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Calendar size={13} /> {m.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={13} /> {m.startTime} - {m.endTime}
                  </span>
                </div>
                <p className="text-slate-400 pt-1 border-t border-slate-800/80">{m.agenda}</p>
              </div>

              {/* Attendance Checklist in Meeting */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users size={13} />
                  Meeting Presence Checklist:
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {m.attendees.map((att) => (
                    <div
                      key={att.employeeId}
                      onClick={() => onToggleMeetingPresence(m.id, att.employeeId)}
                      className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-blue-500/50 transition-colors"
                    >
                      <span className="font-medium text-slate-200">{att.employeeName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          att.isPresent
                            ? 'bg-emerald-900/80 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {att.isPresent ? '✓ Present' : 'Mark Present'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={m.meetLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Video size={15} />
                Join Google Meeting
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        /* Attendance Sheet Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl overflow-x-auto">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-blue-400" />
            Today's Team Attendance Matrix (2026-07-31)
          </h3>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-950/50">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Active Hours</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{att.employeeName}</td>
                  <td className="py-3 px-4 font-mono text-amber-300">{att.punchIn}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {att.totalActiveHours}
                  </td>
                  <td className="py-3 px-4 text-slate-300 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> {att.location}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'Present'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : att.status === 'WFH'
                          ? 'bg-blue-900/60 text-blue-300'
                          : 'bg-amber-900/60 text-amber-300'
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video size={18} className="text-blue-400" />
                Schedule TopRank Team Meeting
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Growth Strategy Sync"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Project Context
                </label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Agenda / Notes
                </label>
                <textarea
                  rows={3}
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                  placeholder="Topics to discuss with team members..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
