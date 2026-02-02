import React, { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { useAuth } from '@/app/context/AuthContext';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, setCurrentView }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile/Desktop Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30 h-14 lg:h-16 flex items-center px-4 lg:px-8 justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          
          {/* Page Title */}
          <h2 className="text-lg lg:text-xl font-bold text-slate-800 capitalize truncate">
            {currentView.replace('-', ' ')}
          </h2>
          
          {/* User Info - Hidden on mobile, shown on desktop */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role === 'student' ? `${user?.branch} • ${user?.semester} sem` : 'Administrator'}</p>
            </div>
            
            {/* Mobile User Avatar */}
            <div className="lg:hidden w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
