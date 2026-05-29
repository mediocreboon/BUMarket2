import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Store, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, demoLoginErrorMessage } from '../../lib/demoAccounts';

export function DemosPage() {
  const { user, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center">
        <p className="text-white text-sm">Loading demo accounts…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleDemoLogin = async (email: string) => {
    setError('');
    setLoadingEmail(email);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      });
      if (authError) {
        setError(demoLoginErrorMessage(authError.message));
        return;
      }
      // AuthContext onAuthStateChange will route to the correct dashboard.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error during demo login.';
      setError(message);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="mb-1">
              <span className="font-bold text-slate-900 text-[38px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[38px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[26px] font-[Archivo]">arket</span>
            </h1>
            <p className="text-slate-500 text-sm">Capstone Demo Accounts</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {DEMO_ACCOUNTS.map((demo) => {
              const Icon = demo.label.includes('Seller') ? Store : ShoppingBag;
              const isBusy = loadingEmail === demo.email;
              return (
                <button
                  key={demo.email}
                  type="button"
                  disabled={Boolean(loadingEmail)}
                  onClick={() => handleDemoLogin(demo.email)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800">{demo.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{demo.description}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{demo.email}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1 flex-shrink-0">
                      <LogIn className="w-3.5 h-3.5" />
                      {isBusy ? 'Signing in…' : 'Enter'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Password for all demo accounts: <code className="text-slate-600">{DEMO_PASSWORD}</code>
          </p>

          <div className="text-center text-sm">
            <Link to="/" className="text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
