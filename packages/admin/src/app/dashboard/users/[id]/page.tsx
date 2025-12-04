'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, Button } from '@apexseo/ui';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    is_suspended: boolean;
    created_at: string;
    last_login_at?: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/admin/users/${params.id}`);
            setUser(res.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [params.id]);

    const handleSuspendToggle = async () => {
        if (!user) return;
        try {
            const action = user.is_suspended ? 'unsuspend' : 'suspend';
            await apiClient.post(`/admin/users/${user.id}/${action}`);
            fetchUser(); // Refresh data
        } catch (error) {
            console.error('Failed to toggle suspend status:', error);
        }
    };

    const handleImpersonate = async () => {
        if (!user) return;
        try {
            const res = await apiClient.post(`/admin/users/${user.id}/impersonate`);
            alert(`Impersonation Token: ${res.data.token}`);
            // In a real app, we would redirect to the main app with this token
        } catch (error) {
            console.error('Failed to impersonate:', error);
            alert('Failed to impersonate user');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">User not found</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                <Button variant="outline" onClick={() => router.push('/users')}>
                    Back to Users
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Profile</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="font-medium text-muted-foreground">ID</div>
                        <div>{user.id}</div>

                        <div className="font-medium text-muted-foreground">Email</div>
                        <div>{user.email}</div>

                        <div className="font-medium text-muted-foreground">Name</div>
                        <div>{user.name || '-'}</div>

                        <div className="font-medium text-muted-foreground">Status</div>
                        <div>
                            {user.is_suspended ? (
                                <span className="text-destructive font-bold">Suspended</span>
                            ) : (
                                <span className="text-green-600 font-bold">Active</span>
                            )}
                        </div>

                        <div className="font-medium text-muted-foreground">Created At</div>
                        <div>{new Date(user.created_at).toLocaleString()}</div>

                        <div className="font-medium text-muted-foreground">Last Login</div>
                        <div>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Actions</h2>
                    <div className="flex flex-col gap-4">
                        <Button
                            variant={user.is_suspended ? "default" : "destructive"}
                            onClick={handleSuspendToggle}
                        >
                            {user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleImpersonate}
                            disabled={user.is_suspended}
                        >
                            Impersonate User
                        </Button>

                        <Button variant="outline" disabled>
                            Reset Password (Coming Soon)
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
