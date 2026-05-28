import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onGoToSignUp: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Demo Buyer', email: 'buyer@bumarket.com' },
  { label: 'Demo Seller', email: 'seller@bumarket.com' },
];

export function LoginPage({ onGoToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          setError('Incorrect email or password.');
        } else if (msg.includes('email not confirmed')) {
          setError('Please verify your email before logging in.');
        } else {
          setError(authError.message);
        }
        return;
      }
      // AuthContext will pick up the session and route automatically.
    } catch (err: any) {
      setError(err?.message || 'Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('bumarket123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <h1 className="mb-1">
              <span className="font-bold text-slate-900 text-[38px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[38px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[26px] font-[Archivo]">arket</span>
            </h1>
            <p className="text-slate-500 text-sm">A Marketplace for Student Entrepreneurs</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-slate-50"
                placeholder="you@bumarket.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-slate-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isLoading ? (
                'Signing in…'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <button onClick={onGoToSignUp} className="text-blue-600 font-medium hover:underline">
              Sign up here
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-3 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Demo accounts (password: bumarket123)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email)}
                  className="text-xs py-2 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Sign in with <code>admin@bumarket.com</code> for the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
