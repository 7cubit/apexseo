'use client';

import { useEffect, useState } from 'react';
import { Card, Input, Button } from '@apexseo/ui';
import Link from 'next/link';

interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
    ip_address?: string;
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        adminId: '',
        action: '',
        entityType: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.adminId) params.append('adminId', filters.adminId);
            if (filters.action) params.append('action', filters.action);
            if (filters.entityType) params.append('entityType', filters.entityType);

            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

            <Card className="p-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                        <Input
                            placeholder="Filter by Admin ID"
                            value={filters.adminId}
                            onChange={(e) => handleFilterChange('adminId', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <Input
                            placeholder="e.g. USER_SUSPEND"
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                        <Input
                            placeholder="e.g. USER"
                            value={filters.entityType}
                            onChange={(e) => handleFilterChange('entityType', e.target.value)}
                        />
                    </div>
                    <Button type="submit">Filter Logs</Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Admin</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Entity</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">IP Address</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No logs found.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 font-mono text-xs">
                                            {log.admin_id}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {log.entity_type}: {log.entity_id}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/audit-logs/${log.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View
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
