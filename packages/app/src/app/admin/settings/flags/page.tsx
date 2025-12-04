'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface FeatureFlag {
    key: string;
    description: string;
    defaultValue: boolean;
    isEnabled: boolean;
}

interface Override {
    entityId: string;
    entityType: string;
    flagKey: string;
    enabled: boolean;
}

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [overrides, setOverrides] = useState<Override[]>([]);
    const [newFlag, setNewFlag] = useState({ key: '', description: '', defaultValue: false });
    const [newOverride, setNewOverride] = useState({ entityId: '', entityType: 'Plan', flagKey: '', enabled: true });
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/admin/settings/flags');
        const data = await res.json();
        setFlags(data.flags);
        setOverrides(data.overrides);
    };

    const handleCreateFlag = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/settings/flags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newFlag, admin_id: admin?.id })
        });
        setNewFlag({ key: '', description: '', defaultValue: false });
        fetchData();
    };

    const handleCreateOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/settings/flags/override', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newOverride, admin_id: admin?.id })
        });
        setNewOverride({ ...newOverride, entityId: '' });
        fetchData();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
                <p className="text-gray-500">Manage global feature flags and overrides.</p>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Flag</h3>
                <form onSubmit={handleCreateFlag} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                        <Input
                            placeholder="feature_beta_v2"
                            value={newFlag.key}
                            onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Input
                            placeholder="Enables V2 dashboard"
                            value={newFlag.description}
                            onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={newFlag.defaultValue}
                            onChange={(e) => setNewFlag({ ...newFlag, defaultValue: e.target.checked })}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Enabled by Default</span>
                    </div>
                    <Button type="submit">Create Flag</Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Key</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Default</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {flags.map((flag) => (
                            <tr key={flag.key}>
                                <td className="py-3 px-4 font-mono text-sm">{flag.key}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{flag.description}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${flag.defaultValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {flag.defaultValue ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Add Override</h3>
                <form onSubmit={handleCreateOverride} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full border rounded-md p-2 text-sm"
                            value={newOverride.entityType}
                            onChange={(e) => setNewOverride({ ...newOverride, entityType: e.target.value })}
                        >
                            <option value="Plan">Plan</option>
                            <option value="Account">Account</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
                        <Input
                            placeholder="Plan ID or Account ID"
                            value={newOverride.entityId}
                            onChange={(e) => setNewOverride({ ...newOverride, entityId: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flag Key</label>
                        <select
                            className="w-full border rounded-md p-2 text-sm"
                            value={newOverride.flagKey}
                            onChange={(e) => setNewOverride({ ...newOverride, flagKey: e.target.value })}
                            required
                        >
                            <option value="">Select Flag</option>
                            {flags.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            className="w-full border rounded-md p-2 text-sm"
                            value={newOverride.enabled.toString()}
                            onChange={(e) => setNewOverride({ ...newOverride, enabled: e.target.value === 'true' })}
                        >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                    <Button type="submit">Set Override</Button>
                </form>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Overrides</h4>
                    <div className="space-y-2">
                        {overrides.map((o, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded text-sm">
                                <div>
                                    <span className="font-semibold">{o.entityType}</span> {o.entityId}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-gray-600">{o.flagKey}</span>
                                    <span className={`font-medium ${o.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                        {o.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {overrides.length === 0 && <p className="text-gray-500 text-sm">No overrides active.</p>}
                    </div>
                </div>
            </Card>
        </div>
    );
}
