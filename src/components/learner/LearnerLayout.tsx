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
  Home,
  BookOpen,
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
    { text: 'TRANG CHỦ', icon: Home, path: '/' },
    { text: 'BÀI HỌC', icon: School, path: '/learn' },
    { text: 'TỪ VỰNG', icon: BookOpen, path: '/learn/vocabulary' },
    { text: 'THI THỬ', icon: History, path: '/learn/mock-test' },
  ];

  const isNavActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    if (path === '/learn') {
      return (
        currentPath === '/learn' ||
        currentPath.startsWith('/learn/level/') ||
        currentPath.startsWith('/learn/topic/')
      );
    }
    return currentPath.startsWith(path);
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
    <div className="min-h-screen bg-indigo-50/20 relative overflow-x-hidden">
      {/* Immersive Global Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft abstract shapes or nature background */}
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-100/40 via-purple-100/20 to-transparent" />
        <div
          className="absolute bottom-0 left-0 right-0 h-full opacity-[0.25] mix-blend-multiply bg-cover bg-center grayscale shadow-inner transition-opacity duration-1000"
        />
        {/* Decorative blobs for 'cuteness' and color variety */}
        <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] rounded-full bg-blue-400/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-pink-400/15 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[20%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-teal-400/10 blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute bottom-[-5%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-amber-300/10 blur-[90px] animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[40%] right-[20%] w-[20rem] h-[20rem] rounded-full bg-violet-400/10 blur-[80px] animate-pulse" style={{ animationDelay: '5s' }} />
      </div>

      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-sm">
        <div className="container mx-auto px-4 h-16 grid grid-cols-5 items-center">

          {/* Part 1: Logo */}
          <div className="flex justify-start">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/learn')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="font-black text-xl hidden lg:block text-slate-800 tracking-tighter uppercase">NIHONGO</span>
            </div>
          </div>

          {/* Part 2: Empty */}
          <div className="hidden md:block" />

          {/* Part 3: Navigation Links (Centered) */}
          <div className="flex justify-center">
            <div className="hidden md:flex items-center gap-10">
              {navItems.map((item) => {
                const active = isNavActive(item.path);
                return (
                  <button
                    key={item.text}
                    className={`text-xs font-black tracking-widest transition-colors hover:text-primary whitespace-nowrap ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 4: Empty */}
          <div className="hidden md:block" />

          {/* Part 5: Profile & Mobile Toggle */}
          <div className="flex items-center justify-end gap-4">
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
                <DropdownMenuContent className="w-60 bg-white/90 backdrop-blur-2xl border-white/20 shadow-2xl rounded-[1.5rem] p-1.5 mt-2 animate-in fade-in zoom-in-95 duration-200" align="end" forceMount>
                  <DropdownMenuItem
                    onClick={() => navigate('/learn/profile')}
                    className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-gray-700 focus:bg-primary/5 focus:text-primary transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate('/learn/history')}
                    className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-gray-700 focus:bg-primary/5 focus:text-primary transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <History className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span>Lịch sử học</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSwitchProfile}
                    className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-gray-700 focus:bg-primary/5 focus:text-primary transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                      <SwitchCamera className="h-4 w-4 text-pink-500" />
                    </div>
                    <span>Đổi hồ sơ {activeProfileId ? `(#${activeProfileId})` : ''}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5 bg-gray-100/50" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold text-red-500 focus:bg-red-50 focus:text-red-600 transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
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
      <main className="container mx-auto px-4 py-8 animate-in fade-in duration-500 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default LearnerLayout;
