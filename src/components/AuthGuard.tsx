import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (!isAuthenticated && !isPublicPath) {
      navigate(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    // If authenticated and trying to access login page, redirect to home
    if (isAuthenticated && pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, pathname, navigate, isPublicPath]);

  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
