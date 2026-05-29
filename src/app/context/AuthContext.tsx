import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { createProfileOnSignup, fetchProfile, Profile } from '../../lib/db';

export interface AuthUser {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  fullName: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileToUser(p: Profile): AuthUser {
  return {
    id: p.id,
    email: p.email,
    role: p.role,
    fullName: p.full_name || p.email,
    verificationStatus: p.verification_status,
  };
}

function signupRoleFromMetadata(meta: Record<string, unknown>): 'buyer' | 'seller' {
  return meta.role === 'seller' ? 'seller' : 'buyer';
}

async function loadUserForSession(sessionUser: { id: string; email?: string | null; user_metadata?: any }) {
  let profile = await fetchProfile(sessionUser.id);

  if (!profile) {
    const meta = sessionUser.user_metadata || {};
    const role = signupRoleFromMetadata(meta);
    const fullName = meta.fullName || meta.full_name || (sessionUser.email?.split('@')[0] ?? 'BUMarket User');

    await createProfileOnSignup({
      id: sessionUser.id,
      email: sessionUser.email || '',
      full_name: fullName,
      role,
    });
    profile = await fetchProfile(sessionUser.id);
  }

  return profile ? profileToUser(profile) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const next = await loadUserForSession(session.user);
      if (mounted.current) setUser(next);
    } else if (mounted.current) {
      setUser(null);
    }
  };

  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        await refresh();
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted.current) return;
      if (session?.user) {
        const next = await loadUserForSession(session.user);
        if (mounted.current) {
          setUser(next);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
