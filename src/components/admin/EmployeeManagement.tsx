import React, { useState, useRef } from 'react';
import { 
  UserPlus, UserMinus, ShieldCheck, Mail, Briefcase, Phone, Save, X, Activity, 
  Upload, CreditCard, Eye, EyeOff, CheckCircle, Copy, Printer, Lock, FileText, 
  Building2, Key, Sparkles, Image as ImageIcon, RefreshCw, KeyRound, Trash2
} from 'lucide-react';
import { Employee, AdminRole, Department } from '../../types';
import { resetEmployeePassword, isMasterAdminEmail } from '../../lib/api';

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
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // New employee created credentials modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  // Reset password modal state
  const [resetModalEmp, setResetModalEmp] = useState<Employee | null>(null);
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [showResetPasswordInput, setShowResetPasswordInput] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');
  const [confirmDeleteEmp, setConfirmDeleteEmp] = useState<Employee | null>(null);
  const [adminDeleteNotice, setAdminDeleteNotice] = useState<string>('');

  // View Document Modal state
  const [viewDocModal, setViewDocModal] = useState<{
    docTitle: string;
    docNumber: string;
    docPhotoUrl?: string;
    employeeName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFileInputRef = useRef<HTMLInputElement>(null);
  const panFileInputRef = useRef<HTMLInputElement>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = 'TR@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    role: '',
    department: 'Development',
    phone: '',
    aadhaarNumber: '',
    aadhaarPhotoUrl: '',
    panNumber: '',
    panPhotoUrl: '',
    password: generateRandomPassword(),
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

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Aadhaar photo size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee((prev) => ({ ...prev, aadhaarPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("PAN photo size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee((prev) => ({ ...prev, panPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      alert("Please fill in required fields: Name, Email, and Role.");
      return;
    }

    const assignedPassword = newEmployee.password || generateRandomPassword();

    const emp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name!,
      email: newEmployee.email!.trim().toLowerCase(),
      role: newEmployee.role!,
      department: newEmployee.department || 'Development',
      phone: newEmployee.phone || '',
      aadhaarNumber: newEmployee.aadhaarNumber || '',
      aadhaarPhotoUrl: newEmployee.aadhaarPhotoUrl || '',
      panNumber: (newEmployee.panNumber || '').toUpperCase(),
      panPhotoUrl: newEmployee.panPhotoUrl || '',
      password: assignedPassword,
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

    // Show popup modal with created ID and password
    setCreatedCredentials({
      name: emp.name,
      email: emp.email,
      password: assignedPassword,
    });

    setShowAddForm(false);
    setNewEmployee({
      name: '',
      email: '',
      role: '',
      department: 'Development',
      phone: '',
      aadhaarNumber: '',
      aadhaarPhotoUrl: '',
      panNumber: '',
      panPhotoUrl: '',
      password: generateRandomPassword(),
      isAdmin: false,
      adminRole: 'Co-Founder',
      hourlyRate: 1000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });
  };

  const handleCopyCredentials = (email: string, pass: string) => {
    const text = `TopRank India CRM Login Credentials:\nEmail: ${email}\nPassword: ${pass}\nPortal: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const handleExecutePasswordReset = async () => {
    if (!resetModalEmp || !newResetPassword) {
      alert("Please enter a valid new password.");
      return;
    }

    setIsResetting(true);
    setResetSuccessMsg('');
    try {
      await resetEmployeePassword(resetModalEmp.email, newResetPassword);
      setResetSuccessMsg(`Password for ${resetModalEmp.name} updated successfully in Supabase Auth!`);
      setTimeout(() => {
        setResetModalEmp(null);
        setNewResetPassword('');
        setResetSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      alert(`Failed to update password: ${err?.message || err}`);
    } finally {
      setIsResetting(false);
    }
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

            {/* Aadhaar Card Number & Photo Upload */}
            <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Aadhaar Card Details</span>
                <span className="text-[10px] text-emerald-600 font-semibold">12 Digits</span>
              </label>
              <input
                type="text"
                value={newEmployee.aadhaarNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, aadhaarNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 font-mono tracking-wider rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="7829-4019-1102"
                maxLength={14}
              />
              
              <div>
                <input
                  type="file"
                  ref={aadhaarFileInputRef}
                  accept="image/*"
                  onChange={handleAadhaarFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => aadhaarFileInputRef.current?.click()}
                    className="flex-1 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Upload size={13} />
                    <span>{newEmployee.aadhaarPhotoUrl ? 'Change Aadhaar Photo' : 'Upload Aadhaar Photo'}</span>
                  </button>
                  {newEmployee.aadhaarPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setNewEmployee({ ...newEmployee, aadhaarPhotoUrl: '' })}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                      title="Remove Aadhaar photo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {newEmployee.aadhaarPhotoUrl && (
                  <div className="mt-2 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-emerald-200">
                    <img
                      src={newEmployee.aadhaarPhotoUrl}
                      alt="Aadhaar Card Preview"
                      className="w-12 h-12 object-cover rounded border border-slate-200"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> Aadhaar Photo Attached
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PAN Card Number & Photo Upload */}
            <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>PAN Card Details</span>
                <span className="text-[10px] text-emerald-600 font-semibold">10 Chars</span>
              </label>
              <input
                type="text"
                value={newEmployee.panNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, panNumber: e.target.value.toUpperCase() })}
                className="w-full bg-white border border-slate-300 font-mono tracking-wider uppercase rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="ABCDE1234F"
                maxLength={10}
              />

              <div>
                <input
                  type="file"
                  ref={panFileInputRef}
                  accept="image/*"
                  onChange={handlePanFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => panFileInputRef.current?.click()}
                    className="flex-1 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Upload size={13} />
                    <span>{newEmployee.panPhotoUrl ? 'Change PAN Photo' : 'Upload PAN Photo'}</span>
                  </button>
                  {newEmployee.panPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setNewEmployee({ ...newEmployee, panPhotoUrl: '' })}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                      title="Remove PAN photo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {newEmployee.panPhotoUrl && (
                  <div className="mt-2 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-blue-200">
                    <img
                      src={newEmployee.panPhotoUrl}
                      alt="PAN Card Preview"
                      className="w-12 h-12 object-cover rounded border border-slate-200"
                    />
                    <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> PAN Photo Attached
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Portal Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <KeyRound size={13} className="text-blue-600" />
                  <span>Login Password (ID / PASS) *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setNewEmployee({ ...newEmployee, password: generateRandomPassword() })}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={11} />
                  Auto-Generate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newEmployee.password || ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono rounded-xl px-3 py-2 pr-10 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  placeholder="Set Password (e.g. TR@94821)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">This password will be assigned for the employee to sign in.</p>
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
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
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
                        {emp.aadhaarPhotoUrl && (
                          <button
                            onClick={() =>
                              setViewDocModal({
                                docTitle: 'Aadhaar Card Photo',
                                docNumber: emp.aadhaarNumber || 'Attached',
                                docPhotoUrl: emp.aadhaarPhotoUrl,
                                employeeName: emp.name,
                              })
                            }
                            className="text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-300 shadow-xs"
                            title="View Aadhaar Card Photo"
                          >
                            <FileText size={11} />
                            <span>Aadhaar Photo</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 w-16 shrink-0">PAN CARD:</span>
                        {emp.panNumber ? (
                          <span className="font-mono text-slate-700 font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[11px] border border-blue-200">
                            {emp.panNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not provided</span>
                        )}
                        {emp.panPhotoUrl && (
                          <button
                            onClick={() =>
                              setViewDocModal({
                                docTitle: 'PAN Card Photo',
                                docNumber: emp.panNumber || 'Attached',
                                docPhotoUrl: emp.panPhotoUrl,
                                employeeName: emp.name,
                              })
                            }
                            className="text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-blue-300 shadow-xs"
                            title="View PAN Card Photo"
                          >
                            <FileText size={11} />
                            <span>PAN Photo</span>
                          </button>
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
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setResetModalEmp(emp);
                          setNewResetPassword(generateRandomPassword());
                          setShowResetPasswordInput(true);
                          setResetSuccessMsg('');
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Manage / Reset Login Password"
                      >
                        <Key size={15} />
                        <span className="hidden lg:inline text-[11px]">Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          if (isMasterAdminEmail(emp.email)) {
                            setAdminDeleteNotice(`Master Admin account (${emp.email}) cannot be deleted.`);
                            return;
                          }
                          setAdminDeleteNotice('');
                          setConfirmDeleteEmp(emp);
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                        title="Remove Employee"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
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

      {/* Created Credentials Success Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Employee Registered!</h3>
                  <p className="text-xs text-slate-500">ID & Password generated for {createdCredentials.name}</p>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Employee Name</span>
                <span className="text-sm font-bold text-slate-800">{createdCredentials.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Login Email ID</span>
                <span className="text-sm font-mono font-semibold text-blue-700">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Password</span>
                <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block mt-0.5">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCopyCredentials(createdCredentials.email, createdCredentials.password)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {copiedCredentials ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copiedCredentials ? 'Credentials Copied to Clipboard!' : 'Copy Login Credentials'}
              </button>

              <button
                onClick={() => setCreatedCredentials(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal for Master Admin */}
      {resetModalEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reset Employee Password</h3>
                  <p className="text-xs text-slate-500">Update login password for {resetModalEmp.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Employee Email</div>
                <div className="font-mono text-sm font-bold text-slate-800">{resetModalEmp.email}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">New Password *</label>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={11} />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordInput ? 'text' : 'password'}
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 font-mono rounded-xl px-3 py-2 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordInput(!showResetPasswordInput)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPasswordInput ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {resetSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalEmp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePasswordReset}
                disabled={isResetting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isResetting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isResetting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Photo Modal */}
      {viewDocModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  {viewDocModal.docTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewDocModal.employeeName} • Number: <span className="font-mono font-bold text-slate-800">{viewDocModal.docNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setViewDocModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {viewDocModal.docPhotoUrl ? (
              <div className="space-y-4">
                <div className="bg-slate-900/5 p-2 rounded-xl border border-slate-200 flex items-center justify-center max-h-[400px] overflow-hidden">
                  <img
                    src={viewDocModal.docPhotoUrl}
                    alt={viewDocModal.docTitle}
                    className="max-h-[380px] w-auto object-contain rounded-lg shadow-md"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <a
                    href={viewDocModal.docPhotoUrl}
                    download={`${viewDocModal.employeeName.replace(/\s+/g, '_')}_${viewDocModal.docTitle.replace(/\s+/g, '_')}.png`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Upload size={14} className="rotate-180" />
                    Download Document Photo
                  </a>
                  <button
                    onClick={() => setViewDocModal(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                No document image attached.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Staff Deletion Modal */}
      {confirmDeleteEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <UserMinus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Remove Employee</h3>
                  <p className="text-xs text-slate-500">Confirm staff removal from TopRank system</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDeleteEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 mb-5 space-y-2">
              <p className="text-xs font-medium text-slate-800">
                Are you sure you want to permanently remove <strong className="text-slate-900 font-bold">{confirmDeleteEmp.name}</strong>?
              </p>
              <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-rose-200/60">
                Email: <span className="font-bold text-rose-700">{confirmDeleteEmp.email}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                This will delete their employee record and revoke their access.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteEmp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveEmployee(confirmDeleteEmp.id);
                  setConfirmDeleteEmp(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Confirm Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Protected Notice Modal */}
      {adminDeleteNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Protected Account</h3>
            <p className="text-xs text-slate-600 mb-5">{adminDeleteNotice}</p>
            <button
              onClick={() => setAdminDeleteNotice('')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

