import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, Profile } from '../../lib/db';

interface MyProfileProps {
  userName: string;
  userType: 'buyer' | 'seller';
}

export function MyProfile({ userName, userType }: MyProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      const row = await fetchProfile(user.id);
      if (active) {
        setProfile(row);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const displayName = profile?.full_name || userName;
  const email = profile?.email || user?.email || '—';
  const phone = profile?.phone || 'Not provided';
  const department = profile?.department || 'Not provided';
  const verificationLabel =
    profile?.verification_status === 'verified'
      ? `Verified ${userType === 'seller' ? 'Seller' : 'Buyer'}`
      : profile?.verification_status === 'pending'
        ? 'Verification pending'
        : 'Verification rejected';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-800">My Profile</h2>
          <p className="text-slate-500 text-sm mt-1">Your account information from Supabase</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-800">
          Profile editing is coming soon. This view is read-only for capstone deployment.
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500 text-sm">
            Loading profile…
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold">{displayName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                      userType === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {verificationLabel}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1 capitalize">{user?.role || userType} account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Full Name', value: displayName },
                { icon: Mail, label: 'Email', value: email },
                { icon: Phone, label: 'Phone Number', value: phone },
                { icon: MapPin, label: 'Department', value: department },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label}>
                    <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5" /> {field.label}
                    </label>
                    <p className="text-slate-700 text-sm">{field.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
