import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { toggleSidebar } = useAppContext();
  
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
      </div>
    </header>
  );
};

export default Header;
