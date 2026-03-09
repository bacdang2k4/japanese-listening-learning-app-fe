import React, { useState, useMemo } from 'react';
import {
  Menu,
  X,
  Headphones,
  School,
  History,
  LogOut,
  User,
  SwitchCamera,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

const LearnerLayout: React.FC<LearnerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = location.pathname;

  // Read learner info from localStorage
  const learnerInfo = useMemo(() => {
    try {
      const stored = localStorage.getItem('learner');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  const getInitials = () => {
    if (learnerInfo?.firstName && learnerInfo?.lastName) {
      return (learnerInfo.lastName.charAt(0) + learnerInfo.firstName.charAt(0)).toUpperCase();
    }
    return 'L';
  };

  // Desktop nav items (top bar center)
  const navItems = [
    { text: 'Cấp độ', icon: School, path: '/learn' },
    { text: 'Tài khoản', icon: User, path: '/learn/profile' },
    { text: 'Lịch sử', icon: History, path: '/learn/history' },
  ];

  const isNavActive = (path: string) => {
    if (path === '/learn') {
      // Active for /learn, /learn/level/*, /learn/topic/*
      return currentPath === '/learn' || currentPath.startsWith('/learn/level') || currentPath.startsWith('/learn/topic');
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const activeProfileId = getActiveProfileId();

  const handleLogout = () => {
    localStorage.removeItem('learner');
    localStorage.removeItem('activeProfileId');
    tokenStorage.removeLearnerToken();
    navigate('/login');
  };

  const handleSwitchProfile = () => {
    localStorage.removeItem('activeProfileId');
    navigate('/learn/profiles');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo Section */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/learn')}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl hidden sm:block text-primary">JPLearning</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <Button
                  key={item.text}
                  variant={active ? 'default' : 'ghost'}
                  className="gap-2"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.text}
                </Button>
              );
            })}
          </div>

          {/* Right Section: Profile & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop User Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                      <AvatarImage src={learnerInfo?.avatarUrl || ''} alt="User" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/learn/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Tài khoản</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/learn/history')} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>Lịch sử học</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSwitchProfile} className="cursor-pointer">
                    <SwitchCamera className="mr-2 h-4 w-4" />
                    <span>Đổi hồ sơ {activeProfileId ? `(#${activeProfileId})` : ''}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <Button
                  key={item.text}
                  variant={active ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.text}
                </Button>
              );
            })}
            <div className="h-px bg-border my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </Button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
};

export default LearnerLayout;
