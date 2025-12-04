'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, Button } from '@apexseo/ui';
import { useRouter } from 'next/navigation';

interface Account {
    id: string;
    name: string;
    created_at: string;
}

interface Subscription {
    id: string;
    status: string;
    current_period_end: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
}

export default function AccountDetailPage({ params }: { params: { id: string } }) {
    const [account, setAccount] = useState<Account | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await api.get(`/admin/accounts/${params.id}`);
                setAccount(res.data.account);
                setSubscription(res.data.subscription);
                setPlan(res.data.plan);
            } catch (error) {
                console.error('Failed to fetch account:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, [params.id]);

    const handleCancelSubscription = async () => {
        if (!subscription) return;
        if (!confirm('Are you sure you want to cancel this subscription?')) return;

        try {
            await api.post(`/admin/accounts/${params.id}/cancel`, {
                subscriptionId: subscription.id
            });
            // Refresh data
            const res = await api.get(`/admin/accounts/${params.id}`);
            setSubscription(res.data.subscription);
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!account) return <div className="p-8">Account not found</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Back
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">ID:</span> {account.id}
                        </div>
                        <div>
                            <span className="font-medium">Name:</span> {account.name}
                        </div>
                        <div>
                            <span className="font-medium">Created At:</span>{' '}
                            {new Date(account.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                    {subscription && plan ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-lg">{plan.name}</div>
                                    <div className="text-muted-foreground">
                                        {plan.currency.toUpperCase()} {plan.price} / month
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${subscription.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {subscription.status}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">Period Ends:</span>{' '}
                                {new Date(subscription.current_period_end).toLocaleDateString()}
                            </div>
                            {subscription.status === 'ACTIVE' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleCancelSubscription}
                                >
                                    Cancel Subscription
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="text-muted-foreground">No active subscription</div>
                    )}
                </Card>
            </div>
        </div>
    );
}
