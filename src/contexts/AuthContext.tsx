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
        const storedUserId = localStorage.getItem(USER_ID_KEY);
        if (storedUserId) {
            setTimeout(() => {
                setUserIdState(storedUserId);
            }, 0);
        }

        setTimeout(() => {
            setIsInitialized(true);
        }, 0);
    }, []);

    const setUserId = (userId: string) => {
        setUserIdState(userId);
        localStorage.setItem(USER_ID_KEY, userId);
    };

    const clearUserId = () => {
        setUserIdState(null);
        localStorage.removeItem(USER_ID_KEY);
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
