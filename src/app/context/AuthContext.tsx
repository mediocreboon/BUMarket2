import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { fetchProfile, upsertProfile, Profile } from '../../lib/db';

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
  profileError: string | null;
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

type SessionUser = { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null };

function getBootstrapProfile(sessionUser: SessionUser) {
  const meta = sessionUser.user_metadata || {};
  const requestedRole: AuthUser['role'] = meta.role === 'seller' ? 'seller' : 'buyer';
  const role: AuthUser['role'] =
    sessionUser.email && sessionUser.email.toLowerCase().startsWith('admin@')
      ? 'admin'
      : requestedRole;
  const fullName =
    typeof meta.fullName === 'string'
      ? meta.fullName
      : typeof meta.full_name === 'string'
        ? meta.full_name
        : sessionUser.email?.split('@')[0] ?? 'BUMarket User';

  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    full_name: fullName,
    role,
    verification_status: 'verified' as const,
  };
}

async function loadUserForSession(sessionUser: SessionUser): Promise<AuthUser> {
  let profile = await fetchProfile(sessionUser.id);

  // If there's no profile row yet (trigger failed or pre-existing user), create one.
  if (!profile) {
    const created = await upsertProfile(getBootstrapProfile(sessionUser));
    if (!created) {
      throw new Error('We could not create your profile. Please try signing in again.');
    }
    profile = await fetchProfile(sessionUser.id);
  }

  if (!profile) {
    throw new Error('We could not load your profile. Please try again.');
  }

  return profileToUser(profile);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const mounted = useRef(true);
  const loadSeq = useRef(0);
  const profileLoad = useRef<{ userId: string; promise: Promise<AuthUser> } | null>(null);

  const loadProfileOnce = useCallback((sessionUser: SessionUser) => {
    if (profileLoad.current?.userId === sessionUser.id) {
      return profileLoad.current.promise;
    }

    const promise = loadUserForSession(sessionUser).finally(() => {
      if (profileLoad.current?.promise === promise) {
        profileLoad.current = null;
      }
    });

    profileLoad.current = { userId: sessionUser.id, promise };
    return promise;
  }, []);

  const applySession = useCallback(
    async (session: Session | null, seq: number) => {
      if (!session?.user) {
        if (mounted.current && seq === loadSeq.current) {
          setUser(null);
          setProfileError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const next = await loadProfileOnce(session.user);
        if (mounted.current && seq === loadSeq.current) {
          setUser(next);
          setProfileError(null);
        }
      } catch (err: any) {
        console.error('[auth] profile load error:', err);
        if (mounted.current && seq === loadSeq.current) {
          setUser(null);
          setProfileError(err?.message || 'We could not load your profile. Please try again.');
        }
      } finally {
        if (mounted.current && seq === loadSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [loadProfileOnce]
  );

  const refresh = useCallback(async () => {
    const seq = ++loadSeq.current;
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      await applySession(session, seq);
    } catch (err: any) {
      console.error('[auth] session refresh error:', err);
      if (mounted.current && seq === loadSeq.current) {
        setUser(null);
        setProfileError(err?.message || 'We could not restore your session. Please sign in again.');
        setIsLoading(false);
      }
    }
  }, [applySession]);

  useEffect(() => {
    mounted.current = true;

    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        loadSeq.current += 1;
        profileLoad.current = null;
        setUser(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }

      const seq = ++loadSeq.current;
      setIsLoading(true);
      await applySession(session, seq);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [applySession, refresh]);

  const logout = async () => {
    const seq = ++loadSeq.current;
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      profileLoad.current = null;
      if (mounted.current && seq === loadSeq.current) {
        setUser(null);
        setProfileError(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, profileError, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
