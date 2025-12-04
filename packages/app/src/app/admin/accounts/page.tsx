'use client';

import { useEffect, useState } from 'react';
import { Card, Input } from '@apexseo/ui';
import Link from 'next/link';

interface Account {
    id: string;
    name: string;
    created_at: string;
    subscription?: { status: string };
    plan?: { name: string };
}

export default function AdminAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, [searchTerm]);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/admin/accounts?${params.toString()}`);
            const data = await res.json();
            if (data.accounts) {
                setAccounts(data.accounts);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
            </div>

            <Card className="p-6">
                <div className="mb-6">
                    <Input
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Account Name</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Loading accounts...
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No accounts found.
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((account) => (
                                    <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{account.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {account.plan?.name || 'Free'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.subscription?.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {account.subscription?.status || 'No Sub'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(account.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/accounts/${account.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Manage
                                            </Link>
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
