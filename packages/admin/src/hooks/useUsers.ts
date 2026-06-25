import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '../lib/api';

export interface User {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    planId: string | null;
    plan?: {
        name: string;
        tier: string;
    };
    createdAt: string;
}

export interface UseUsersParams {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export function useUsers(params: UseUsersParams = {}) {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return { data: [], meta: { total: 0 } }; // Should be guarded by middleware/component

            const token = await getToken();
            const { data } = await api.get('/admin/users', {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        },
        enabled: isLoaded && isSignedIn,
    });
}
