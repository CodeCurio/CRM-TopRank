import React, { useState, useRef } from 'react';
import { 
  UserPlus, UserMinus, ShieldCheck, Mail, Briefcase, Phone, Save, X, Activity, 
  Upload, CreditCard, Eye, EyeOff, CheckCircle, Copy, Printer, Lock, FileText, 
  Building2, Key, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { Employee, AdminRole, Department } from '../../types';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onRemoveEmployee: (id: string) => void;
}

const MNC_DEPARTMENTS: Department[] = [
  'Development',
  'SEO & Growth',
  'Design & Creative',
  'Client Success',
  'Management',
  'Human Resources',
  'Finance & Accounts',
  'Sales & Marketing',
  'Legal & Compliance',
  'Product & Engineering',
];

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onAddEmployee, onRemoveEmployee }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Toggles for sensitive fields
  const [showPassword, setShowPassword] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    role: '',
    department: 'Development',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    password: 'Password@123',
    isAdmin: false,
    adminRole: 'Co-Founder',
    hourlyRate: 1000,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      alert("Please fill in required fields: Name, Email, and Role.");
      return;
    }

    const emp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name!,
      email: newEmployee.email!,
      role: newEmployee.role!,
      department: newEmployee.department || 'Development',
      phone: newEmployee.phone || '',
      aadhaarNumber: newEmployee.aadhaarNumber || '',
      panNumber: (newEmployee.panNumber || '').toUpperCase(),
      password: newEmployee.password || 'Password@123',
      avatar: newEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      status: 'offline',
      activeSecondsToday: 0,
      lastPunchIn: null,
      hourlyRate: Number(newEmployee.hourlyRate) || 0,
      completedTasksCount: 0,
      pendingTasksCount: 0,
      productivityScore: 100,
      isAdmin: newEmployee.isAdmin || false,
      adminRole: newEmployee.isAdmin ? (newEmployee.adminRole || 'Co-Founder') : undefined,
    };

    onAddEmployee(emp);
    setShowAddForm(false);
    setNewEmployee({
      name: '',
      email: '',
      role: '',
      department: 'Development',
      phone: '',
      aadhaarNumber: '',
      panNumber: '',
      password: 'Password@123',
      isAdmin: false,
      adminRole: 'Co-Founder',
      hourlyRate: 1000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Corporate Staff & Employee Management
          </h2>
          <p className="text-sm text-slate-500">Manage employee profiles, profile images, department assignments, Aadhaar & PAN verification, and portal access</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
        >
          {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
          {showAddForm ? 'Close Form' : 'Register New Employee'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                Create Employee Profile
              </h3>
              <p className="text-xs text-slate-500">Enter complete onboarding info including Aadhaar, PAN, Department & Portal Password</p>
            </div>
          </div>

          {/* Profile Photo Upload Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img 
                src={newEmployee.avatar} 
                alt="Avatar Preview" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-200"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md"
                title="Upload Profile Image"
              >
                <Upload size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Employee Profile Image *
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <ImageIcon size={14} />
                  Upload Photo from Computer
                </button>
                <span className="text-xs text-slate-400">or enter image URL:</span>
                <input
                  type="text"
                  value={newEmployee.avatar}
                  onChange={(e) => setNewEmployee({ ...newEmployee, avatar: e.target.value })}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP files up to 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Rahul Sharma"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Corporate Email *</label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="rahul.sharma@toprankindia.com"
              />
            </div>

            {/* Job Role */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Designation / Role *</label>
              <input
                type="text"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Senior Fullstack Engineer"
              />
            </div>

            {/* Department Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Department *</label>
              <select
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500"
              >
                {MNC_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Aadhaar Card Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                <span>Aadhaar Card Number</span>
                <span className="text-[10px] text-emerald-600 font-semibold">12 Digits</span>
              </label>
              <input
                type="text"
                value={newEmployee.aadhaarNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, aadhaarNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 font-mono tracking-wider rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="7829-4019-1102"
                maxLength={14}
              />
            </div>

            {/* PAN Card Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                <span>PAN Card Number</span>
                <span className="text-[10px] text-emerald-600 font-semibold">10 Chars</span>
              </label>
              <input
                type="text"
                value={newEmployee.panNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, panNumber: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 font-mono tracking-wider uppercase rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>

            {/* Portal Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 font-mono rounded-xl px-3 py-2 pr-10 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Password@123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Hourly Billing Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hourly Billing Rate (₹)</label>
              <input
                type="number"
                value={newEmployee.hourlyRate || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, hourlyRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="1200"
              />
            </div>

            {/* Admin Level Selection */}
            <div className="md:col-span-2 lg:col-span-3 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEmployee.isAdmin || false}
                  onChange={(e) => setNewEmployee({ ...newEmployee, isAdmin: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-800">Grant Executive Admin Privileges</span>
              </label>
              
              {newEmployee.isAdmin && (
                <div className="ml-6 space-y-2 pt-1 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Select Admin Level:</span>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="adminRole"
                        value="Founder"
                        checked={newEmployee.adminRole === 'Founder'}
                        onChange={() => setNewEmployee({ ...newEmployee, adminRole: 'Founder' })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        👑 Founder
                      </span>
                      <span className="text-slate-500 text-[11px]">(Unrestricted master privileges across financials & records)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="adminRole"
                        value="Co-Founder"
                        checked={newEmployee.adminRole === 'Co-Founder'}
                        onChange={() => setNewEmployee({ ...newEmployee, adminRole: 'Co-Founder' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                        🛡️ Co-Founder
                      </span>
                      <span className="text-slate-500 text-[11px]">(Full admin operations; locked from modifying billed invoice data)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Save size={16} />
              Save Employee Profile
            </button>
          </div>
        </div>
      )}

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            Active Employee Directory ({employees.length})
          </h3>
          <span className="text-xs text-slate-500">View employee details, Aadhaar, PAN & credentials</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5 align-middle w-[30%] min-w-[260px]">Employee</th>
                <th className="px-4 py-3.5 align-middle w-[25%] min-w-[200px]">Department & Role</th>
                <th className="px-4 py-3.5 align-middle w-[28%] min-w-[220px]">Government Verification</th>
                <th className="px-4 py-3.5 align-middle w-[12%] min-w-[130px]">Access Level</th>
                <th className="px-4 py-3.5 align-middle w-[5%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                          <span className="truncate">{emp.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{emp.email}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-blue-600 shrink-0" />
                        <span>{emp.role}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-md w-fit">
                        {emp.department || 'General'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-16 shrink-0">AADHAAR:</span>
                        {emp.aadhaarNumber ? (
                          <span className="font-mono text-slate-700 font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                            {showAadhaar[emp.id] ? emp.aadhaarNumber : `XXXX-XXXX-${emp.aadhaarNumber.slice(-4)}`}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not provided</span>
                        )}
                        {emp.aadhaarNumber && (
                          <button
                            onClick={() => setShowAadhaar((prev) => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                            className="text-slate-400 hover:text-slate-600"
                            title="Toggle Aadhaar Visibility"
                          >
                            {showAadhaar[emp.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-16 shrink-0">PAN CARD:</span>
                        {emp.panNumber ? (
                          <span className="font-mono text-slate-700 font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[11px] border border-blue-200">
                            {emp.panNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    {emp.isAdmin ? (
                      emp.adminRole === 'Founder' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 shadow-sm">
                          👑 FOUNDER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-300 shadow-sm">
                          🛡️ CO-FOUNDER
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                        STAFF
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right align-middle">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${emp.name}?`)) {
                          onRemoveEmployee(emp.id);
                        }
                      }}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                      title="Remove Employee"
                    >
                      <UserMinus size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No employees registered in system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

