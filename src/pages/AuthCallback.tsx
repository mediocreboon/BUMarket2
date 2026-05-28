import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('Confirming your account…');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const handleAuth = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            throw new Error('No confirmation session was found. Please open the latest email link or sign in again.');
          }
        }

        setStatus('Email confirmed! Redirecting…');
        redirectTimer = setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err: any) {
        console.error(err);
        setHasError(true);
        setStatus(err?.message || 'Email confirmation failed. Please try again.');
      }
    };

    handleAuth();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2">
          <span className="font-[Archivo_Black] text-slate-900">BU</span>
          <span className="font-[Archivo_Black] text-blue-600">M</span>
          <span className="text-blue-600 font-[Archivo]">arket</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-sm">{status}</p>
        {hasError && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm"
            >
              Try again
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
            >
              Go to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
