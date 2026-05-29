import { useState } from 'react';
import { Store, Package, User, Wallet, LogOut, Bell, Menu, X, Home, ShieldCheck } from 'lucide-react';
import { BuyerHome } from './BuyerHome';
import { Marketplace } from './Marketplace';
import { MyOrders } from './MyOrders';
import { MyProfile } from './MyProfile';
import { EWallet } from './EWallet';
import { AIChatbot } from './AIChatbot';
import { NotificationsPanel } from './NotificationsPanel';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

interface BuyerLayoutProps {
  userName: string;
  onLogout: () => void;
}

type BuyerView = 'home' | 'marketplace' | 'orders' | 'notifications' | 'profile' | 'wallet';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const accountItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'wallet', label: 'E-Wallet', icon: Wallet },
];

export function BuyerLayout({ userName, onLogout }: BuyerLayoutProps) {
  const [activeView, setActiveView] = useState<BuyerView>('home');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsiveSidebar(true);

  const navigate = (view: BuyerView) => {
    setActiveView(view);
    closeSidebar();
  };

  const sidebarWidthClass = isMobile
    ? 'w-64'
    : sidebarOpen
      ? 'w-64'
      : 'w-16';

  const sidebarPositionClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
    : 'relative flex-shrink-0';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className={`${sidebarPositionClass} ${sidebarWidthClass} bg-white border-r border-slate-100 min-h-screen flex flex-col`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {sidebarOpen && (
            <span>
              <span className="font-bold text-slate-900 text-[26px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[26px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[20px] font-[Archivo]">arket</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-4 h-4 text-slate-500" /> : <Menu className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

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

        <nav className="flex-1 py-4 px-2 space-y-0.5" aria-label="Main navigation">
          {sidebarOpen && (
            <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mb-2">Main</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id as BuyerView)}
                title={!sidebarOpen ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}

          {sidebarOpen && (
            <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mt-5 mb-2">Account</p>
          )}
          {!sidebarOpen && !isMobile && <div className="my-3 border-t border-slate-100" />}
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id as BuyerView)}
                title={!sidebarOpen ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
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

        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
            aria-label="Logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Open navigation menu"
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-800">BUMarket</span>
          </div>
        )}

        {activeView === 'home' && (
          <BuyerHome
            userName={userName}
            onNavigateToMarketplace={(query) => {
              if (query) setMarketplaceSearch(query);
              setActiveView('marketplace');
            }}
            onNavigateToNotifications={() => navigate('notifications')}
          />
        )}
        {activeView === 'marketplace' && (
          <Marketplace
            userName={userName}
            userType="buyer"
            initialSearchQuery={marketplaceSearch}
            onSearchQueryApplied={() => setMarketplaceSearch('')}
          />
        )}
        {activeView === 'orders' && <MyOrders userType="buyer" />}
        {activeView === 'notifications' && <NotificationsPanel />}
        {activeView === 'profile' && <MyProfile userName={userName} userType="buyer" />}
        {activeView === 'wallet' && <EWallet />}
      </div>
      <AIChatbot context="buyer" page={activeView} />
    </div>
  );
}
