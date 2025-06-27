import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Star, LogOut, User, Menu, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';
import { NAV_ITEMS } from '@/lib/constants';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar, currentUser, setCurrentUser } = useAppContext();
  const [pageTitle, setPageTitle] = useState('');

  React.useEffect(() => {
    function isNavItemWithPath(item: any): item is { path: string; label: string } {
      return typeof item === 'object' && !!item && typeof item.path === 'string' && typeof item.label === 'string';
    }
    const allNavItems = NAV_ITEMS.flatMap(section =>
      Array.isArray(section.children)
        ? section.children.filter(isNavItemWithPath)
        : isNavItemWithPath(section) ? [section] : []
    );
    const currentNavItem = allNavItems.find(item => item.path === location.pathname);
    setPageTitle(currentNavItem?.label || '');
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'AU';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'agronomist':
        return 'Agronomist';
      default:
        return role;
    }
  };
  
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 md:hidden" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          {/* No page title shown */}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Star className="h-5 w-5" />
          <span className="sr-only">Favorites</span>
        </Button>
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser?.avatar_url || currentUser?.avatarUrl || ''} alt={`@${currentUser?.name}`} />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                  <p className="text-xs leading-none text-primary font-medium">
                    {getRoleDisplayName(currentUser.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default TopBar; 