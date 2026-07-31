import React, { useState } from 'react';
import { Mail, ShieldCheck, UserCheck, X, ArrowRight, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Employee } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface LoginModalProps {
  employees: Employee[];
  onClose: () => void;
  onSelectEmployee: (emp: Employee) => void;
  isCancellable?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  employees,
  onClose,
  onSelectEmployee,
  isCancellable = true,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    try {
      let authUser = null;

      // 1. Attempt standard password login
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: passwordInput,
      });

      if (error) {
        // Fallback: If account does not exist in Auth yet, try creating it via Admin API or list Users
        try {
          const { data: usersData } = await supabase.auth.admin.listUsers();
          const existingUser = usersData?.users?.find(
            (u: any) => u.email?.toLowerCase() === cleanEmail
          );

          if (!existingUser) {
            // Create the auth user automatically if first-time user
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: cleanEmail,
              password: passwordInput,
              email_confirm: true,
            });

            if (!createError && newUser?.user) {
              authUser = newUser.user;
              // Sign in again with newly created credentials
              const retry = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: passwordInput,
              });
              if (retry.data?.user) {
                authUser = retry.data.user;
              }
            } else if (createError) {
              setErrorMessage(createError.message || 'Authentication failed.');
              setLoading(false);
              return;
            }
          } else {
            // User exists in auth but password was incorrect
            setErrorMessage('Invalid email or password. Please check your credentials.');
            setLoading(false);
            return;
          }
        } catch (adminErr) {
          setErrorMessage(error.message || 'Invalid email or password. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        authUser = data.user;
      }

      if (authUser) {
        let empData: Employee | null = null;

        // 2. Query employee profile by ID
        const { data: byId } = await supabase
          .from('employees')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (byId) {
          empData = byId as Employee;
        } else {
          // 3. Query employee profile by case-insensitive email
          const { data: byEmail } = await supabase
            .from('employees')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

          if (byEmail) {
            empData = byEmail as Employee;
            if (empData.id !== authUser.id) {
              empData.id = authUser.id;
              await supabase.from('employees').upsert(empData);
            }
          }
        }

        // 4. Auto-provision profile if still not found in employees table
        if (!empData) {
          const rawName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = rawName
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const isTopRankAdmin =
            cleanEmail.includes('toprank') ||
            cleanEmail.includes('admin') ||
            cleanEmail.includes('gmail');

          empData = {
            id: authUser.id,
            name: formattedName || 'TopRank Member',
            email: cleanEmail,
            role: isTopRankAdmin ? 'Master Admin' : 'Senior Specialist',
            department: isTopRankAdmin ? 'Management' : 'Development',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'User')}&background=0D8ABC&color=fff`,
            phone: '',
            status: 'active',
            activeSecondsToday: 0,
            lastPunchIn: '09:00 AM',
            hourlyRate: 1000,
            completedTasksCount: 0,
            pendingTasksCount: 0,
            productivityScore: 100,
            isAdmin: isTopRankAdmin,
            adminRole: isTopRankAdmin ? 'Founder' : undefined,
          };

          const { error: insertError } = await supabase.from('employees').upsert(empData);
          if (insertError) {
            console.error('Error auto-creating employee profile:', insertError);
          }
        }

        onSelectEmployee(empData);
        if (isCancellable) {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative space-y-6">
        {/* Top Header */}
        <div className="flex flex-col items-center justify-center border-b border-slate-800 pb-5">
          <img 
            src="https://www.toprankindia.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FTopRank%20logo.0yo.5zwcff6~f.webp&w=128&q=75" 
            alt="TopRank Logo" 
            className="h-12 object-contain mb-3"
          />
          <h3 className="font-extrabold text-lg text-white">Employee Login</h3>
          <p className="text-xs text-blue-300">TopRank India Secure Portal</p>
          
          {isCancellable && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Email & Password Login Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Corporate Email ID
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="email@toprankindia.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium bg-rose-950/50 p-2.5 rounded-xl border border-rose-800/60">
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Secure Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

