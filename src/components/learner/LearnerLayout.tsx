import React, { useState, useMemo } from 'react';
import {
  Menu,
  X,
  Headphones,
  School,
  LogOut,
  User,
  SwitchCamera,
  Bell,
  BookOpen,
  History,
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

  const navItems = [
    { text: 'Lộ trình', icon: School, path: '/learn' },
    { text: 'Từ vựng', icon: BookOpen, path: '/learn/vocabulary' },
    { text: 'Lịch sử', icon: History, path: '/learn/history' },
    { text: 'Tài khoản', icon: User, path: '/learn/profile' },
  ];

  const isNavActive = (path: string) => {
    if (path === '/learn') {
      return currentPath === '/learn' || currentPath.startsWith('/learn/level') || currentPath.startsWith('/learn/topic') && currentPath.includes('/practice');
    }
    if (path === '/learn/vocabulary') {
      return currentPath === '/learn/vocabulary' || (currentPath.startsWith('/learn/topic') && !currentPath.includes('/practice'));
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#F3F1FF] to-[#EEF2FF]">
      {/* Sticky Top Navbar — ELSA gradient style */}
      <nav className="sticky top-0 z-50 w-full elsa-gradient-header shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo Section */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/learn')}
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-all duration-200 group-hover:scale-105">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block text-white tracking-tight">
              JPLearning
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <button
                  key={item.text}
                  className={`elsa-nav-item ${active ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.text}
                </button>
              );
            })}
          </div>

          {/* Right Section: Notification, Profile & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="hidden md:flex w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-white/80" />
            </button>

            {/* Desktop User Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={learnerInfo?.avatarUrl || ''} alt="User" />
                      <AvatarFallback className="bg-white/20 text-white font-bold text-sm">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-elsa-lg border-elsa-indigo-100" align="end" forceMount>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground">
                      {learnerInfo?.lastName} {learnerInfo?.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      @{learnerInfo?.username || 'learner'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/learn/profile')} className="cursor-pointer rounded-lg mx-1">
                    <User className="mr-2 h-4 w-4" />
                    <span>Tài khoản</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSwitchProfile} className="cursor-pointer rounded-lg mx-1">
                    <SwitchCamera className="mr-2 h-4 w-4" />
                    <span>Đổi hồ sơ {activeProfileId ? `(#${activeProfileId})` : ''}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer rounded-lg mx-1">
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
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/10 px-4 py-4 space-y-1 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <button
                  key={item.text}
                  className={`w-full flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.text}
                </button>
              );
            })}
            <div className="h-px bg-white/15 my-2" />
            <button
              className="w-full flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
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
