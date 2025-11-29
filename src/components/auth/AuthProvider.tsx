"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('apexseo_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser = {
            id: 'user_123',
            name: 'Dev User',
            email: 'dev@apexseo.space'
        };
        setUser(mockUser);
        localStorage.setItem('apexseo_user', JSON.stringify(mockUser));
        setLoading(false);
        router.push('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('apexseo_user');
        router.push('/');
    };

    useEffect(() => {
        if (!loading) {
            // Protect routes
            // const publicRoutes = ['/', '/login', '/public'];
            // const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith('/public/'));

            // if (!user && !isPublic) {
            //     router.push('/login');
            // }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
