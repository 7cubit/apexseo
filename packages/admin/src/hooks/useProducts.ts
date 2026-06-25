import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '../lib/api';

export interface Product {
    id: string;
    name: string;
    tier: string;
    price: number;
    interval: string;
    featureFlags: Record<string, boolean>;
    isActive: boolean;
    createdAt: string;
}

export function useProducts() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const token = await getToken();
            const { data } = await api.get('/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: isLoaded && isSignedIn,
    });
}

export function useUpdateProduct() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            const token = await getToken();
            return api.patch(`/admin/products/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
}
