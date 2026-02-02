import React from 'react';
import { Home, BookOpen, Calendar, Map, Trophy, MessageSquare, User, LogOut, LayoutDashboard, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const Sidebar = ({ currentView, setCurrentView, isSidebarOpen = false, setIsSidebarOpen }: SidebarProps) => {
  const { user, logout } = useAuth();

  // Strict admin validation
  const isRealAdmin = user?.role === 'admin' && user?.email === 'siddiqshaik613@gmail.com';

  const studentItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'infrastructure', label: 'Infrastructure', icon: Map },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'query', label: 'Query Box', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'infrastructure', label: 'Infrastructure', icon: Map },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Only show admin items to verified admin
  const menuItems = isRealAdmin ? adminItems : studentItems;

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    // Close mobile sidebar on menu item click
    if (setIsSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside className={`
      w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50
      transform transition-transform duration-300 ease-in-out
      ${
        isSidebarOpen 
          ? 'translate-x-0' 
          : '-translate-x-full lg:translate-x-0'
      }
    `}>
      {/* Header with Logo */}
      <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-between">
        {/* Mobile Close Button */}
        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-slate-400" />
          </button>
        )}
        
        {/* Logo and Title */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="https://i.postimg.cc/htNM9R26/Screenshot-2026-02-01-222826.png" alt="VRSEC Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-xl lg:text-2xl tracking-wide truncate">Apna SAHE</h1>
            <p className="text-xs lg:text-sm text-slate-400 uppercase tracking-wider truncate">
              {isRealAdmin ? 'Admin Portal' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 mb-6 lg:mb-8 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs lg:text-sm flex-shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="font-bold text-xs lg:text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="mt-auto p-4 lg:p-6 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            if (setIsSidebarOpen) setIsSidebarOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors touch-manipulation active:bg-red-950/50"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
};
