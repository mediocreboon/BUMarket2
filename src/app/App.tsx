import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { BuyerLayout } from './components/BuyerLayout';
import { SignUpPageBuyer } from './components/SignUpPageBuyer';
import { SignUpPageSeller } from './components/SignUpPageSeller';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from '../lib/supabase';
import AuthCallback from "../pages/AuthCallback";

type View = 'login' | 'signupBuyer' | 'signupSeller';
type UserRole = 'buyer' | 'seller' | 'admin' | null;


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [currentView, setCurrentView] = useState<View>('login');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthCallback, setIsAuthCallback] = useState(false);

      useEffect(() => {
        if (window.location.pathname === '/auth/callback') {
        setIsAuthCallback(true);
      }
    }, []);

      if (isAuthCallback) {
      return <AuthCallback />;
    }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = session.user.user_metadata?.role as UserRole;
          const fullName = session.user.user_metadata?.fullName || session.user.email || 'User';
          if (role) {
            setUserType(role);
            setUserName(fullName);
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role as UserRole;
        const fullName = session.user.user_metadata?.fullName || session.user.email || 'User';
        if (role) {
          setUserType(role);
          setUserName(fullName);
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
        setUserType(null);
        setUserName('');
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isCheckingSession) {
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
            <p className="text-blue-200 text-sm mt-1">Loading your marketplace…</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = (type: 'buyer' | 'seller' | 'admin', name: string) => {
    setUserType(type as UserRole);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleSignUp = (type: 'buyer' | 'seller', name: string) => {
    setUserType(type);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setUserType(null);
    setUserName('');
    setCurrentView('login');
  };

  // ── Unauthenticated views ────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (currentView === 'signupBuyer') {
      return (
        <SignUpPageBuyer
          onSignUp={(name) => handleSignUp('buyer', name)}
          onBackToLogin={() => setCurrentView('login')}
        />
      );
    }
    if (currentView === 'signupSeller') {
      return (
        <SignUpPageSeller
          onSignUp={(name) => handleSignUp('seller', name)}
          onBackToLogin={() => setCurrentView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToSignUp={(type) => setCurrentView(type === 'buyer' ? 'signupBuyer' : 'signupSeller')}
      />
    );
  }

  // ── Authenticated views ──────────────────────────────────────────────────
  if (userType === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userType === 'seller') {
    return <SellerDashboard userName={userName} onLogout={handleLogout} />;
  }

  return <BuyerLayout userName={userName} onLogout={handleLogout} />;
}

