'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { toast } from '@/src/utils/toast';
import { Bookmark, ChevronDown, FileText, Home, LogOut, Newspaper, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const Navbar = () => {
  const pathname = usePathname();
  const { userId, setUserId, clearUserId } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        setIsEditingUserId(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetUserId = () => {
    if (tempUserId.trim()) {
      setUserId(tempUserId.trim());
      setIsEditingUserId(false);
      setTempUserId('');
      toast.success('User ID updated');
    }
  };

  const handleClearUserId = () => {
    clearUserId();
    setIsUserMenuOpen(false);
    toast.success('User ID cleared');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Meridiano</span>
            </Link>

            <div className="flex space-x-4">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Home className="h-4 w-4" />
                <span>Briefings</span>
              </Link>

              <Link
                href="/articles"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/articles')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Newspaper className="h-4 w-4" />
                <span>Articles</span>
              </Link>

              <Link
                href="/bookmarks"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/bookmarks')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>Bookmarks</span>
              </Link>

              <Link
                href="/youtube-transcriptions"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/youtube-transcription')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <svg role="img" className='h-4 w-4' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                <span>YouTube</span>
              </Link>

              <Link
                href="/admin/youtube-channels"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${userId
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              <User className="h-4 w-4" />
              <span className="max-w-[100px] truncate">
                {userId ? userId.substring(0, 8) + (userId.length > 8 ? '...' : '') : 'Set User ID'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                {userId ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Current User ID:</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{userId}</p>
                    </div>
                    <Link
                      href="/bookmarks"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>My Bookmarks</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsEditingUserId(true);
                        setTempUserId(userId);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Change User ID</span>
                    </button>
                    <button
                      onClick={handleClearUserId}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Clear User ID</span>
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-500 mb-2">Set your user ID to use bookmarks:</p>
                    <button
                      onClick={() => setIsEditingUserId(true)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Set User ID
                    </button>
                  </div>
                )}

                {isEditingUserId && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Enter User ID:</p>
                    <input
                      type="text"
                      value={tempUserId}
                      onChange={(e) => setTempUserId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSetUserId();
                        }
                      }}
                      placeholder="Enter user ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSetUserId}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUserId(false);
                          setTempUserId('');
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

