import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'agronomist' | 'admin' | 'super-admin';
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasRole: (roles: string | string[]) => boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  hasRole: () => false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id && user.role) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!currentUser) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(currentUser.role);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentUser,
        setCurrentUser,
        hasRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
