import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
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
    if (!userString) {
      // If not logged in, redirect to login page.
      // The Layout component is not used for the login page route,
      // so we don't need to check the current path.
      navigate('/login', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'md:ml-20'}`}>
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
        <footer style={{ textAlign: 'center', fontSize: '0.95rem', color: '#888', padding: '0.75rem 0', letterSpacing: 1 }}>
          Powered by NTS G.R.O.W
        </footer>
      </div>
    </div>
  );
};

export default Layout;
