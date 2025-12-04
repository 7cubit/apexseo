import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
    id: string;
    email: string;
    role: string;
}

interface AdminAuthState {
    admin: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, token: string, admin: AdminUser) => void;
    logout: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            admin: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            login: (email, token, admin) =>
                set({
                    admin,
                    token,
                    isAuthenticated: true,
                    error: null,
                }),
            logout: () =>
                set({
                    admin: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);
