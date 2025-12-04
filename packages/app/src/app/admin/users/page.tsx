'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    name?: string;
    created_at: string;
    is_suspended: boolean;
    accounts: { account: string; plan: string }[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, statusFilter]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <Button>Invite User</Button>
            </div>

            <Card className="p-6">
                <div className="mb-6 flex gap-4">
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Account / Plan</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.accounts && user.accounts.length > 0 ? (
                                                user.accounts.map((acc, idx) => (
                                                    <div key={idx} className="text-sm text-gray-700">
                                                        <span className="font-medium">{acc.account}</span>
                                                        <span className="text-gray-400 mx-1">•</span>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{acc.plan || 'Free'}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400">No linked account</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!user.is_suspended
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {!user.is_suspended ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View Details
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
