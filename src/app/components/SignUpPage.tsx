import { useState, type FormEvent } from 'react';
import { ArrowLeft, ShoppingBag, Store, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { upsertProfile } from '../../lib/db';

interface SignUpPageProps {
  onBackToLogin: () => void;
}

type Role = 'buyer' | 'seller';
type SignUpSuccess = {
  email: string;
  needsConfirmation: boolean;
};

const DEPARTMENTS = [
  'Computer Studies',
  'Engineering',
  'Teacher Education',
  'Technology',
  'Nursing',
  'Entrepreneurship',
  'Other',
];

export function SignUpPage({ onBackToLogin }: SignUpPageProps) {
  const [role, setRole] = useState<Role>('buyer');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Studies',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SignUpSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) return setError('Please enter your full name.');
    if (!form.email.includes('@')) return setError('Please enter a valid email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            fullName: form.fullName,
            role,
            department: form.department,
            phone: form.phone,
          },
        },
      });

      if (signUpError) {
        const m = signUpError.message.toLowerCase();
        if (m.includes('already') || m.includes('registered')) {
          setError('An account with this email already exists. Please sign in.');
        } else {
          setError(signUpError.message);
        }
        return;
      }
      if (!data.user) {
        setError('Sign up failed. Please try again.');
        return;
      }

      if (data.session) {
        // Best-effort upsert in case the auth trigger isn't installed.
        await upsertProfile({
          id: data.user.id,
          email: form.email.trim(),
          full_name: form.fullName.trim(),
          role,
          verification_status: 'verified',
          department: form.department,
          phone: form.phone || null,
        });
      }

      setSuccess({
        email: form.email.trim(),
        needsConfirmation: !data.session,
      });
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-slate-900 text-xl font-semibold mb-1">
            {success.needsConfirmation ? 'Check your email' : 'Account Created!'}
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            {success.needsConfirmation
              ? `We sent a confirmation link to ${success.email}. Confirm your email, then sign in.`
              : 'Welcome to BUMarket. Loading your dashboard now...'}
          </p>
          <button
            onClick={onBackToLogin}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {success.needsConfirmation ? 'Go to Sign In' : 'Back to Sign In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-blue-100 hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-7">
          <div className="text-center mb-6">
            <h1 className="mb-1">
              <span className="font-bold text-slate-900 text-[28px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[28px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[20px] font-[Archivo]">arket</span>
            </h1>
            <p className="text-slate-500 text-sm">Create your account</p>
          </div>

          {/* Role selector (no admin) */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                role === 'buyer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Student Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                role === 'seller'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-sm font-medium">Student Seller</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="you@university.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="+63 9XX..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="At least 6 chars"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Confirm</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 mt-2 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
                role === 'buyer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading
                ? 'Creating account…'
                : `Create ${role === 'buyer' ? 'Buyer' : 'Seller'} Account`}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            By signing up, you agree to follow campus marketplace etiquette and stay safe at meet-ups.
          </p>
        </div>
      </div>
    </div>
  );
}
