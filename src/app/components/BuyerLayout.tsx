import { useState } from 'react';
import { Store, Package, Heart, User, Wallet, LogOut, Bell, Menu, X, Home, ShieldCheck } from 'lucide-react';
import { BuyerHome } from './BuyerHome';
import { Marketplace } from './Marketplace';
import { MyOrders } from './MyOrders';
import { Favorites } from './Favorites';
import { MyProfile } from './MyProfile';
import { EWallet } from './EWallet';
import { AIChatbot } from './AIChatbot';

interface BuyerLayoutProps {
  userName: string;
  onLogout: () => void;
}

type BuyerView = 'home' | 'marketplace' | 'orders' | 'favorites' | 'profile' | 'wallet';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'favorites', label: 'Favorites', icon: Heart },
];

const accountItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'wallet', label: 'E-Wallet', icon: Wallet },
];

export function BuyerLayout({ userName, onLogout }: BuyerLayoutProps) {
  const [activeView, setActiveView] = useState<BuyerView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const Sidebar = (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-100 min-h-screen flex flex-col transition-all duration-200 flex-shrink-0`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {sidebarOpen && (
          <span>
            <span className="font-bold text-slate-900 text-[26px] font-[Archivo_Black]">BU</span>
            <span className="font-bold text-blue-600 text-[26px] font-[Archivo_Black]">M</span>
            <span className="text-blue-600 text-[20px] font-[Archivo]">arket</span>
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <X className="w-4 h-4 text-slate-500" /> : <Menu className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* User Badge */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-800 text-sm font-medium truncate">{userName}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-blue-500">Student Buyer</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {sidebarOpen && (
          <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mb-2">Main</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as BuyerView)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {isActive && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
            </button>
          );
        })}

        {sidebarOpen && (
          <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mt-5 mb-2">Account</p>
        )}
        {!sidebarOpen && <div className="my-3 border-t border-slate-100" />}
        {accountItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as BuyerView)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onLogout}
          title={!sidebarOpen ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {Sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {activeView === 'home' && (
          <BuyerHome
            userName={displayName}
            onNavigateToMarketplace={() => setActiveView('marketplace')}
          />
        )}
        {activeView === 'marketplace' && <Marketplace userName={userName} userType="buyer" />}
        {activeView === 'orders' && <MyOrders userType="buyer" />}
        {activeView === 'favorites' && <Favorites />}
        {activeView === 'notifications' && <NotificationsPanel />}
        {activeView === 'profile' && <MyProfile userName={userName} userType="buyer" />}
        {activeView === 'wallet' && <EWallet />}
      </div>
      <AIChatbot context="buyer" page={activeView} />
    </div>
  );
}
