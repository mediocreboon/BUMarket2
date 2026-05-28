import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLogin: (type: 'buyer' | 'seller' | 'admin', name: string) => void;
  onGoToSignUp: (type: 'buyer' | 'seller') => void;
}

type TabType = 'buyer' | 'seller' | 'admin';

export function LoginPage({ onLogin, onGoToSignUp }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ LOGIN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      // ❌ AUTH ERROR HANDLING
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

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // ✅ GET USER ROLE FROM PROFILES
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        setError('Failed to load user profile.');
        return;
      }

      const role = profile.role as 'buyer' | 'seller' | 'admin';
      const name = profile.full_name || email;

      // 🔐 ROLE ROUTING
      if (role === 'admin') {
        onLogin('admin', name);
        return;
      }

      if (role !== activeTab) {
        setError(
          `This account is registered as ${
            role === 'buyer' ? 'Student Buyer' : 'Student Seller'
          }. Please switch tabs.`
        );

        await supabase.auth.signOut();
        return;
      }

      // ✅ SUCCESS LOGIN
      onLogin(role, name);
    } catch (err) {
      console.error(err);
      setError('Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🧪 DEMO LOGIN (SAFE)
  const handleDemoLogin = (role: 'buyer' | 'seller' | 'admin') => {
    const names = {
      buyer: 'Demo Buyer',
      seller: 'Demo Seller',
      admin: 'Admin',
    };

    onLogin(role, names[role]);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'buyer', label: 'Student Buyer' },
    { id: 'seller', label: 'Student Seller' },
    { id: 'admin', label: 'Admin' },
  ];

  // ✅ UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Logo */}
          <div className="text-center mb-7">
            <h1 className="mb-1">
              <span className="font-bold text-slate-900 text-[38px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[38px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[26px] font-[Archivo]">arket</span>
            </h1>
            <p className="text-slate-500 text-sm">
              A Marketplace for Student Entrepreneurs
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-slate-50"
                placeholder="your.name@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-slate-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Secure Login
                </>
              )}
            </button>
          </form>

          {/* Sign up */}
          {activeTab !== 'admin' && (
            <div className="mt-5 text-center text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => onGoToSignUp(activeTab)}
                className="text-blue-600 font-medium"
              >
                Sign up here
              </button>
            </div>
          )}

          {/* Demo */}
          <div className="mt-5 pt-5 border-t text-center">
            <p className="text-xs text-slate-400 mb-3">
              🧪 Prototype Demo
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(['buyer', 'seller', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="text-xs py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                >
                  Demo {role}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}