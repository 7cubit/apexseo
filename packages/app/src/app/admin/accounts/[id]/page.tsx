'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';
import Link from 'next/link';

interface AccountDetail {
    id: string;
    name: string;
    created_at: string;
    users: { id: string; email: string; role: string }[];
    current_subscription?: {
        id: string;
        status: string;
        current_period_end: string;
        plan: { id: string; name: string; price: number; currency: string };
    };
    subscription_history: any[];
}

interface Plan {
    id: string;
    name: string;
    price: number;
}

export default function AdminAccountDetailPage({ params }: { params: { id: string } }) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showLTDModal, setShowLTDModal] = useState(false);
    const [creditForm, setCreditForm] = useState({ amount: 0, note: '' });
    const [ltdCode, setLtdCode] = useState('');

    useEffect(() => {
        fetchAccount();
        fetchPlans();
        fetchInvoices();
    }, [params.id]);

    const fetchInvoices = async () => {
        const res = await fetch(`/api/admin/billing/invoices?accountId=${params.id}`);
        const data = await res.json();
        if (data.invoices) setInvoices(data.invoices);
    };

    const handleAddCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/billing/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...creditForm, accountId: params.id, admin_id: admin?.id })
        });
        setShowCreditModal(false);
        setCreditForm({ amount: 0, note: '' });
        alert('Credit added successfully');
    };

    const handleRedeemLTD = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/billing/ltd/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: ltdCode, accountId: params.id, admin_id: admin?.id })
        });
        if (res.ok) {
            setShowLTDModal(false);
            setLtdCode('');
            fetchAccount();
            alert('Code redeemed successfully');
        } else {
            alert('Failed to redeem code');
        }
    };

    const handleRefund = async (invoiceId: string) => {
        if (!confirm('Are you sure you want to refund this invoice?')) return;
        await fetch(`/api/admin/billing/invoices/${invoiceId}/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_id: admin?.id })
        });
        fetchInvoices();
    };

    const [account, setAccount] = useState<AccountDetail | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Mock admin user for now since auth store might be missing
    const admin = useAdminAuthStore((state: any) => state.admin);

    const fetchAccount = async () => {
        try {
            const res = await fetch(`/api/admin/accounts/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setAccount(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        const res = await fetch('/api/admin/plans');
        if (res.ok) {
            const data = await res.json();
            setPlans(data.plans || []);
        }
    };

    const handleChangePlan = async (planId: string) => {
        if (!confirm('Change subscription plan?')) return;
        setIsActionLoading(true);
        try {
            await fetch(`/api/admin/accounts/${params.id}/subscription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, admin_id: admin?.id })
            });
            fetchAccount();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Cancel subscription immediately?')) return;
        setIsActionLoading(true);
        try {
            await fetch(`/api/admin/accounts/${params.id}/subscription`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: admin?.id })
            });
            fetchAccount();
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!account) return <div className="p-8 text-center">Account not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
                    <p className="text-gray-500">ID: {account.id}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCreditModal(true)}>Add Credit</Button>
                    <Button variant="outline" onClick={() => setShowLTDModal(true)}>Redeem Code</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                        {account.current_subscription ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div>
                                        <div className="font-bold text-blue-900">{account.current_subscription.plan.name}</div>
                                        <div className="text-sm text-blue-700">
                                            {account.current_subscription.plan.price} {account.current_subscription.plan.currency} / month
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-blue-900">
                                            Status: {account.current_subscription.status}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            Renews: {new Date(account.current_subscription.current_period_end).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        className="border rounded-md px-3 py-2 text-sm"
                                        onChange={(e) => handleChangePlan(e.target.value)}
                                        value=""
                                        disabled={isActionLoading}
                                    >
                                        <option value="" disabled>Change Plan...</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - {p.price}</option>
                                        ))}
                                    </select>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                        onClick={handleCancelSubscription}
                                        disabled={isActionLoading}
                                    >
                                        Cancel Immediately
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">No active subscription</p>
                                <select
                                    className="border rounded-md px-3 py-2 text-sm"
                                    onChange={(e) => handleChangePlan(e.target.value)}
                                    value=""
                                    disabled={isActionLoading}
                                >
                                    <option value="" disabled>Assign Plan...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.price}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-2 px-4 text-xs font-semibold text-gray-700">Date</th>
                                        <th className="py-2 px-4 text-xs font-semibold text-gray-700">Amount</th>
                                        <th className="py-2 px-4 text-xs font-semibold text-gray-700">Status</th>
                                        <th className="py-2 px-4 text-xs font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.length > 0 ? (
                                        invoices.map((inv) => (
                                            <tr key={inv.id}>
                                                <td className="py-2 px-4 text-sm text-gray-500">
                                                    {new Date(inv.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-2 px-4 text-sm font-medium">
                                                    ${inv.amount}
                                                </td>
                                                <td className="py-2 px-4 text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        inv.status === 'REFUNDED' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 text-sm">
                                                    {inv.status === 'PAID' && (
                                                        <button
                                                            onClick={() => handleRefund(inv.id)}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="py-4 text-center text-gray-500 text-sm">No invoices found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href={`/admin/accounts/${params.id}/api-keys`}>
                                <Button variant="outline" className="w-full justify-start">
                                    <span className="mr-2">🔑</span> Manage API Keys
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
                        <div className="space-y-3">
                            {account.users && account.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="truncate pr-2">
                                        <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                                        <div className="text-xs text-gray-500">{user.role}</div>
                                    </div>
                                    <Link href={`/admin/users/${user.id}`} className="text-xs text-blue-600 hover:underline">
                                        View
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {showCreditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Add Credit</h3>
                        <form onSubmit={handleAddCredit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-md p-2"
                                    value={creditForm.amount}
                                    onChange={(e) => setCreditForm({ ...creditForm, amount: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <textarea
                                    className="w-full border rounded-md p-2"
                                    value={creditForm.note}
                                    onChange={(e) => setCreditForm({ ...creditForm, note: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowCreditModal(false)}>Cancel</Button>
                                <Button type="submit">Add Credit</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {showLTDModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Redeem Code</h3>
                        <form onSubmit={handleRedeemLTD} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md p-2"
                                    placeholder="LTD-XXXX-XXXX"
                                    value={ltdCode}
                                    onChange={(e) => setLtdCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowLTDModal(false)}>Cancel</Button>
                                <Button type="submit">Redeem</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
