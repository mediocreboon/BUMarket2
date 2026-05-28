import { useState } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Edit3, Save, Camera } from 'lucide-react';

interface MyProfileProps {
  userName: string;
  userType: 'buyer' | 'seller';
}

export function MyProfile({ userName, userType }: MyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userName,
    email: 'student@bu.edu.ph',
    phone: '+63 912 345 6789',
    department: 'Computer Studies',
    studentId: '2024-00001',
    bio: 'BU student and marketplace enthusiast.',
    preferredMeetup: 'Main Library, Cafeteria',
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully! ✅');
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-800">My Profile</h2>
            <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold">{formData.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${userType === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                  <ShieldCheck className="w-3 h-3" />
                  Verified {userType === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">{formData.department} · Student since 2024</p>
            </div>
          </div>

          {/* Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: User, label: 'Full Name', key: 'fullName', type: 'text' },
              { icon: Mail, label: 'Email', key: 'email', type: 'email' },
              { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel' },
              { icon: MapPin, label: 'Department', key: 'department', type: 'text' },
            ].map(field => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" /> {field.label}
                  </label>
                  {isEditing ? (
                    <input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  ) : (
                    <p className="text-slate-700 text-sm">{formData[field.key as keyof typeof formData]}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="block text-xs text-slate-500 mb-1.5">Student ID</label>
            <p className="text-slate-700 text-sm">{formData.studentId}</p>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-slate-500 mb-1.5">Bio</label>
            {isEditing ? (
              <textarea
                rows={2}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            ) : (
              <p className="text-slate-700 text-sm">{formData.bio}</p>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h4 className="text-slate-700 text-sm font-medium mb-4">Activity Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Orders', value: '4' },
              { label: 'Favorites', value: '4' },
              { label: 'Reviews', value: '2' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
