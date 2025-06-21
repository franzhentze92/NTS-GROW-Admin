import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '@/contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useAppContext();

  // Check if user is logged in
  useEffect(() => {
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;
    
    // If not logged in and not on login page, redirect to login
    if (!user && location.pathname !== '/') {
      navigate('/');
    }
    
    // If logged in and on login page, redirect to dashboard
    if (user && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);

  // Don't render layout for login page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
      >
        <Header />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
