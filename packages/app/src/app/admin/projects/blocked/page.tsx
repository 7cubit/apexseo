'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface BlockedDomain {
    id: string;
    domain: string;
    reason: string;
    created_at: string;
}

export default function AdminBlockedDomainsPage() {
    const [domains, setDomains] = useState<BlockedDomain[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [newReason, setNewReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/admin/projects/blocked');
            const data = await res.json();
            if (data.domains) setDomains(data.domains);
        } catch (error) {
            console.error('Failed to fetch blocked domains:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/projects/blocked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain, reason: newReason, admin_id: admin?.id })
            });
            if (res.ok) {
                setNewDomain('');
                setNewReason('');
                fetchDomains();
            }
        } catch (error) {
            console.error('Failed to block domain:', error);
        }
    };

    const handleUnblock = async (id: string) => {
        if (!confirm('Unblock this domain?')) return;
        try {
            const res = await fetch(`/api/admin/projects/blocked?id=${id}&admin_id=${admin?.id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchDomains();
        } catch (error) {
            console.error('Failed to unblock domain:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Blocked Domains</h1>

            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Block New Domain</h3>
                <form onSubmit={handleBlock} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                        <Input
                            placeholder="example.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <Input
                            placeholder="Spam / Abuse / Request"
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">Block Domain</Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Domain</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Blocked On</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td></tr>
                            ) : domains.length === 0 ? (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No blocked domains.</td></tr>
                            ) : (
                                domains.map((domain) => (
                                    <tr key={domain.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{domain.domain}</td>
                                        <td className="py-3 px-4 text-gray-600">{domain.reason}</td>
                                        <td className="py-3 px-4 text-gray-500">{new Date(domain.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnblock(domain.id)}
                                            >
                                                Unblock
                                            </Button>
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
