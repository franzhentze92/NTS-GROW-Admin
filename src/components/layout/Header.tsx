import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { toggleSidebar } = useAppContext();
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('currentUser');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <header className={`h-16 border-b border-border/40 bg-background px-4 ${className}`}>
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold md:hidden">NTS G.R.O.W</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
