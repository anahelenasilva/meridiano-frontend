'use client';

import React, { Component, createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthContextType {
    userId: string | null;
    setUserId: (userId: string) => void;
    clearUserId: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ID_KEY = 'meridiano_user_id';

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
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
                    <div className="max-w-md w-full bg-white rounded-lg border border-red-200 shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-gray-700 mb-4">
                            An error occurred in the authentication system. Please refresh the page to try again.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4">
                                <summary className="text-sm text-gray-600 cursor-pointer">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserIdState] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load user_id from localStorage on mount
    useEffect(() => {
        try {
            const storedUserId = localStorage.getItem(USER_ID_KEY);
            if (storedUserId) {
                setUserIdState(storedUserId);
            }
        } catch (error) {
            // Handle localStorage access errors (e.g., private browsing, security restrictions)
            console.error('Failed to access localStorage:', error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    const setUserId = (userId: string) => {
        setUserIdState(userId);
        try {
            localStorage.setItem(USER_ID_KEY, userId);
        } catch (error) {
            // Handle localStorage write errors (e.g., quota exceeded)
            console.error('Failed to save userId to localStorage:', error);
        }
    };

    const clearUserId = () => {
        setUserIdState(null);
        try {
            localStorage.removeItem(USER_ID_KEY);
        } catch (error) {
            // Handle localStorage access errors
            console.error('Failed to remove userId from localStorage:', error);
        }
    };

    // Don't render children until we've checked localStorage
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <AuthContext.Provider value={{ userId, setUserId, clearUserId }}>
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
