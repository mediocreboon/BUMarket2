import { ShoppingBag, Package, Heart, User, Wallet, LogOut, Store, UserCircle } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: 'marketplace' | 'orders' | 'favorites' | 'profile' | 'wallet' | 'sellerProfile') => void;
  onLogout: () => void;
  userType: 'buyer' | 'seller';
}

export function Sidebar({ activeView, setActiveView, onLogout, userType }: SidebarProps) {
  const menuItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  // Only add Seller Profile for seller users
  if (userType === 'seller') {
    menuItems.push({ id: 'sellerProfile', label: 'Seller Profile', icon: UserCircle });
  }

  const accountItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'wallet', label: 'E-Wallet', icon: Wallet },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span>
            <span className="font-bold text-black text-[32px] font-[Archivo_Black]">BU</span>
            <span className="font-bold text-blue-600 text-[32px] font-[Archivo_Black]">M</span>
            <span className="text-blue-600 text-[24px]">arket</span>
          </span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-6">
        <div className="px-4 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Main Menu</p>
        </div>
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Account Section */}
        <div className="px-4 mb-4 mt-8">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Account</p>
        </div>
        <nav className="space-y-1 px-3">
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}