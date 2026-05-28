import { useEffect, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { BuyerLayout } from './components/BuyerLayout';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthCallback from '../pages/AuthCallback';

function LoadingScreen({ label = 'Loading your marketplace…' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center">
      <div className="text-center text-white space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 border-4 border-white/20 rounded-full" />
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <div>
          <p className="text-2xl font-bold">
            <span className="text-white font-[Archivo_Black]">BU</span>
            <span className="text-blue-200 font-[Archivo_Black]">M</span>
            <span className="text-blue-200">arket</span>
          </p>
          <p className="text-blue-200 text-sm mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AuthErrorScreen({
  message,
  onRetry,
  onLogout,
}: {
  message: string;
  onRetry: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="mb-2">
          <span className="font-bold text-slate-900 text-[32px] font-[Archivo_Black]">BU</span>
          <span className="font-bold text-blue-600 text-[32px] font-[Archivo_Black]">M</span>
          <span className="text-blue-600 text-[22px] font-[Archivo]">arket</span>
        </h1>
        <h2 className="text-slate-900 font-semibold mb-2">We could not finish signing you in</h2>
        <p className="text-slate-500 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm"
          >
            Sign out
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  const { user, isLoading, profileError, logout, refresh } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');

  if (isLoading) return <LoadingScreen />;

  if (profileError && !user) {
    return <AuthErrorScreen message={profileError} onRetry={refresh} onLogout={logout} />;
  }

  if (!user) {
    if (view === 'signup') {
      return <SignUpPage onBackToLogin={() => setView('login')} />;
    }
    return <LoginPage onGoToSignUp={() => setView('signup')} />;
  }

  if (user.role === 'admin') return <AdminDashboard onLogout={logout} />;
  if (user.role === 'seller') return <SellerDashboard userName={user.fullName} onLogout={logout} />;
  return <BuyerLayout userName={user.fullName} onLogout={logout} />;
}

export default function App() {
  const [isAuthCallback, setIsAuthCallback] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith('/auth/callback')) {
      setIsAuthCallback(true);
    }
  }, []);

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
