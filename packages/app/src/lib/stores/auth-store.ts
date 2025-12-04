import { create } from 'zustand';
import { api } from '../api';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: false,
    error: null,

    login: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            // Mock login for now, replace with actual API call
            // const response = await api.post('/auth/login', { email });
            // const { user, token } = response.data;

            // Simulating a successful login
            const token = 'mock-jwt-token';
            const user = { id: '1', email, role: 'user' };

            localStorage.setItem('token', token);
            set({ user, token, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Verify token with backend
            // const response = await api.get('/auth/me');
            // set({ user: response.data });

            // Mock verification
            set({ user: { id: '1', email: 'test@example.com', role: 'user' } });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    }
}));
