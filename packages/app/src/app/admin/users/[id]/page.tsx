'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@apexseo/ui';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface UserDetail {
    id: string;
    email: string;
    name?: string;
    created_at: string;
    is_suspended: boolean;
    linked_accounts: {
        account: { id: string; name: string };
        role: string;
        joined_at: string;
        plan?: { name: string };
        subscription?: { status: string };
    }[];
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { admin } = useAdminAuthStore();
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, [params.id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${params.id}`);
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!confirm(user?.is_suspended ? 'Re-activate this user?' : 'Suspend this user?')) return;

        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_suspended: !user?.is_suspended,
                    reason: 'Admin action',
                    admin_id: admin?.id
                }),
            });

            if (res.ok) {
                fetchUser(); // Refresh
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleImpersonate = async () => {
        if (!confirm('Impersonate this user?')) return;

        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${params.id}/impersonate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: 'Support investigation',
                    admin_id: admin?.id
                }),
            });

            const data = await res.json();
            if (data.token) {
                // In a real app, we would redirect to the main app with this token
                alert(`Impersonation Token Generated: ${data.token}`);
            }
        } catch (error) {
            console.error('Failed to impersonate:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.name || 'No Name'}</h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>
                <div className="space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleSuspend}
                        disabled={isActionLoading}
                        className={user.is_suspended ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                    >
                        {user.is_suspended ? 'Re-activate User' : 'Suspend User'}
                    </Button>
                    <Button onClick={handleImpersonate} disabled={isActionLoading}>
                        Impersonate
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-500">User ID</div>
                        <div className="font-mono text-gray-900">{user.id}</div>

                        <div className="text-gray-500">Joined</div>
                        <div className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</div>

                        <div className="text-gray-500">Status</div>
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!user.is_suspended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {!user.is_suspended ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Linked Accounts</h3>
                    {user.linked_accounts && user.linked_accounts.length > 0 ? (
                        <div className="space-y-4">
                            {user.linked_accounts.map((link, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">{link.account.name}</div>
                                        <div className="text-xs text-gray-500">Role: {link.role}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-blue-600">{link.plan?.name || 'Free'}</div>
                                        <div className="text-xs text-gray-500">{link.subscription?.status || 'No Sub'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">No linked accounts found.</div>
                    )}
                </Card>
            </div>
        </div>
    );
}
