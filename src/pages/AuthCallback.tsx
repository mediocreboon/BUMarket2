import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('Confirming your account…');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setStatus('Email confirmation failed. Please try again.');
          return;
        }
        setStatus('Email confirmed! Redirecting…');
        setTimeout(() => navigate('/', { replace: true }), 1500);      } catch (err) {
        console.error(err);
        setStatus('Something went wrong.');
      }
    };
    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2">
          <span className="font-[Archivo_Black] text-slate-900">BU</span>
          <span className="font-[Archivo_Black] text-blue-600">M</span>
          <span className="text-blue-600 font-[Archivo]">arket</span>
        </h1>
        <p className="text-slate-600">{status}</p>
      </div>
    </div>
  );
}
