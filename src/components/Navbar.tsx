'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { toast } from '@/src/utils/toast';
import { Bookmark, ChevronDown, FileText, Home, LogOut, Menu, Newspaper, Settings, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MESSAGES } from '../constants/messages';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: '/', label: 'Bookmarks', icon: Bookmark },
    { href: '/articles', label: 'Articles', icon: Newspaper },
    { href: '/youtube-transcriptions', label: 'YouTube', icon: null },
    { href: '/briefings', label: 'Briefings', icon: FileText },
    { href: '/admin/youtube-channels', label: 'Admin', icon: Settings },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    toast.success(MESSAGES.SUCCESS.LOGGED_OUT);
    router.push('/login');
  };

  const NavLink = ({ href, label, icon: Icon, isMobile = false }: { href: string; label: string; icon: typeof Home | null; isMobile?: boolean }) => {
    const active = isActive(href);
    const baseClasses = isMobile
      ? `flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${active
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`
      : `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`;

    if (href === '/youtube-transcriptions') {
      return (
        <Link href={href} className={baseClasses}>
          <svg role="img" className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>YouTube</title>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span>{label}</span>
        </Link>
      );
    }

    return (
      <Link href={href} className={baseClasses}>
        {Icon && <Icon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Meridiano</span>
            </Link>

            <div className="hidden lg:flex space-x-4">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated && user && (
              <>
                <div className="hidden lg:block relative" ref={menuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[150px] truncate">
                      {user.username || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/bookmarks"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>My Bookmarks</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" ref={mobileMenuRef}>
          <div className="container mx-auto px-4 py-4 space-y-2">
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} isMobile={true} />
            ))}

            {isAuthenticated && user && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-3 mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/bookmarks"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Bookmark className="h-5 w-5" />
                    <span>My Bookmarks</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
