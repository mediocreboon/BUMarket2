import { User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

interface MyProfileProps {
  userName: string;
  userType: 'buyer' | 'seller';
}

export function MyProfile({ userName, userType }: MyProfileProps) {
  const formData = {
    fullName: userName,
    email: 'Managed by your signed-in account',
    phone: 'Not provided',
    department: 'Not provided',
    studentId: 'Not provided',
    bio: 'Profile details are managed through your BUMarket account.',
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-slate-800">My Profile</h2>
            <p className="text-slate-500 text-sm mt-1">View your account information</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold">{formData.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${userType === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                  <ShieldCheck className="w-3 h-3" />
                  Verified {userType === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">{formData.department}</p>
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
                  <p className="text-slate-700 text-sm break-words">{formData[field.key as keyof typeof formData]}</p>
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
            <p className="text-slate-700 text-sm">{formData.bio}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h4 className="text-slate-700 text-sm font-medium mb-2">Account Activity</h4>
          <p className="text-sm text-slate-500">
            Track current marketplace activity from My Orders, Favorites, and Notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
