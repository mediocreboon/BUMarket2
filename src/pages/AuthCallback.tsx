import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() { {
  const [status, setStatus] = useState('Confirming your account...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus('Email confirmation failed. Please try again.');
          return;
        }

        setStatus('Email confirmed! Redirecting to login...');

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus('Something went wrong.');
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-2">BUMarket</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
}