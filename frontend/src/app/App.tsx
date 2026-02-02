import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { DataProvider } from '@/app/context/DataContext';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { LandingPage } from '@/app/pages/LandingPage';
import { DashboardHome } from '@/app/pages/student/DashboardHome';
import { Academics } from '@/app/pages/student/Academics';
import { Events } from '@/app/pages/student/Events';
import { Infrastructure } from '@/app/pages/student/Infrastructure';
import { QueryBox } from '@/app/pages/student/QueryBox';
import { Profile } from '@/app/pages/student/Profile';
import { Leaderboard } from '@/app/pages/student/Leaderboard';
import { AdminDashboard } from '@/app/pages/admin/AdminDashboard';

const AppContent = () => {
  const { isAuthenticated, user, userData, isAdmin, isStudent } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Strict admin check
  const isRealAdmin = user?.role === 'admin' && user?.email === 'siddiqshaik613@gmail.com';

  useEffect(() => {
    if (isAuthenticated && user && userData) {
      // Set default view based on VERIFIED user role
      if (isRealAdmin) {
        setCurrentView('admin-dashboard');
      } else {
        // Force all other users to student dashboard
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, user, userData, isRealAdmin]);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // SECURITY: Force redirect if non-admin tries to access admin dashboard
  if (currentView === 'admin-dashboard' && !isRealAdmin) {
    setCurrentView('dashboard');
    return null; // Prevent flash of admin content
  }

  // SECURITY: Prevent students from accessing admin routes
  if (!isRealAdmin && ['admin-dashboard'].includes(currentView)) {
    setCurrentView('dashboard');
    return null;
  }

  return (
    <DashboardLayout currentView={currentView} setCurrentView={setCurrentView}>
      {!isRealAdmin ? (
        // STUDENT ROUTES ONLY
        <>
          {currentView === 'dashboard' && <DashboardHome setCurrentView={setCurrentView} />}
          {currentView === 'academics' && <Academics />}
          {currentView === 'events' && <Events />}
          {currentView === 'infrastructure' && <Infrastructure />}
          {currentView === 'query' && <QueryBox />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'leaderboard' && <Leaderboard />}
        </>
      ) : (
        // ADMIN ROUTES ONLY
        <>
          {currentView === 'admin-dashboard' && <AdminDashboard />}
          {currentView === 'events' && <Events />}
          {currentView === 'infrastructure' && <Infrastructure />}
          {currentView === 'profile' && <Profile />}
        </>
      )}
    </DashboardLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
