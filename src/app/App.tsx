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

function AppRouter() {
  const { user, isLoading, logout } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');

  if (isLoading) return <LoadingScreen />;

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
