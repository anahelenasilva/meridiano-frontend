'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    userId: string | null;
    setUserId: (userId: string) => void;
    clearUserId: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ID_KEY = 'meridiano_user_id';

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
        return null;
    }

    return (
        <AuthContext.Provider value={{ userId, setUserId, clearUserId }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
