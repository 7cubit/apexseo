'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, Button, Input } from '@apexseo/ui';
import { useRouter } from 'next/navigation';

interface Subscription {
    id: string;
    stripe_subscription_id: string;
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
    current_period_end: string;
    trial_ends_at?: string;
    plan: string;
    user: {
        name?: string;
        email: string;
    };
    created_at: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const router = useRouter();

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/subscriptions', {
                params: { page, limit: 10, status: statusFilter || undefined }
            });
            setSubscriptions(res.data.data);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [page, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500 hover:bg-green-600';
            case 'trialing': return 'bg-blue-500 hover:bg-blue-600';
            case 'past_due': return 'bg-orange-500 hover:bg-orange-600';
            case 'canceled': return 'bg-gray-500 hover:bg-gray-600';
            case 'incomplete': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            </div>

            <Card className="p-4">
                <div className="mb-4 flex gap-4">
                    <div className="w-[200px]">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="trialing">Trialing</option>
                            <option value="active">Active</option>
                            <option value="past_due">Past Due</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trial Ends</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Period End</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{sub.user.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{sub.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-medium">{sub.plan || 'Unknown'}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-white ${getStatusColor(sub.status)}`}>
                                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(sub.current_period_end).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
