import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';

// Import icons from lucide-react
import { 
  LayoutDashboard, 
  LineChart, 
  DollarSign, 
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Code,
  MessageSquare,
  Target,
  Inbox,
  ClipboardEdit
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const getIcon = (iconName: string) => {
  const iconMap = {
    'LayoutDashboard': LayoutDashboard,
    'LineChart': LineChart,
    'DollarSign': DollarSign,
    'Calendar': Calendar,
    'BarChart3': BarChart3,
    'Code': Code,
    'MessageSquare': MessageSquare,
    'Target': Target,
    'Inbox': Inbox,
    'ClipboardEdit': ClipboardEdit,
  };
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || LayoutDashboard;
  return <IconComponent className="h-5 w-5" />;
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['analytics']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border/40 transition-all duration-300",
      sidebarOpen ? "w-64" : "w-20",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
        {sidebarOpen ? (
          <h2 className="text-xl font-semibold text-primary">NTS G.R.O.W</h2>
        ) : (
          <h2 className="text-xl font-semibold text-primary">NTS</h2>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
        <nav className="mt-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((section) => (
            <div key={section.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => sidebarOpen && toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <span className="mr-3">{getIcon(section.icon)}</span>
                  {sidebarOpen && section.label}
                </div>
                {sidebarOpen && (
                  expandedSections.includes(section.id) ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {sidebarOpen && expandedSections.includes(section.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.children.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) => cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      end
                    >
                      <span className="mr-3">{getIcon(item.icon)}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {/* Logout button at bottom */}
        <div className="p-4 mt-auto border-t border-border/40">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {sidebarOpen && "Log Out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;