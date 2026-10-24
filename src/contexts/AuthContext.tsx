'use client';

import { Button } from '@/components/ui/button';
import { login, setAuthToken, clearAuthToken } from '@/services/api';
import { User } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import React, { Component, createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by AuthProvider ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
          <div className="max-w-md w-full bg-card text-card-foreground rounded-lg border border-destructive/40 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-destructive mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              An error occurred in the authentication system. Please refresh the page to try again.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-muted text-muted-foreground p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Session {
  user: User;
  accessToken: string;
}

// Reads the session login saved to localStorage. A token without a valid
// user is not a session, so partial or corrupted storage is cleared.
function readStoredSession(): Session | null {
  try {
    const accessToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('meridiano_user');
    if (accessToken && storedUser) {
      const user: unknown = JSON.parse(storedUser);
      if (typeof user === 'object' && user !== null && 'id' in user && user.id) {
        return { accessToken, user: user as User };
      }
    }
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error);
  }

  try {
    clearAuthToken();
    localStorage.removeItem('meridiano_user');
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(readStoredSession);
  const queryClient = useQueryClient();

  const loginFn = async (email: string, password: string) => {
    const response = await login(email, password);
    const { access_token, user: userData } = response;

    setSession({ user: userData, accessToken: access_token });

    try {
      setAuthToken(access_token);
      localStorage.setItem('meridiano_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  };

  const logout = () => {
    setSession(null);
    // Queries are keyed by resource, not by user, so a stale cache would show
    // the previous user's bookmarks to the next login in the same tab.
    queryClient.clear();

    try {
      clearAuthToken();
      localStorage.removeItem('meridiano_user');
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider
        value={{
          user: session?.user ?? null,
          accessToken: session?.accessToken ?? null,
          isAuthenticated: session !== null,
          login: loginFn,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// For components behind App's auth gate, where a user is always present.
// LoginPage is the only screen rendered without one; it uses useAuth.
export function useUser(): User {
  const { user } = useAuth();
  if (user === null) {
    throw new Error('useUser must be used behind the auth gate');
  }
  return user;
}
