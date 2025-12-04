'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface SystemConfig {
    globalRateLimit: number;
}

export default function SystemLimitsPage() {
    const [config, setConfig] = useState<SystemConfig>({ globalRateLimit: 1000 });
    const [isLoading, setIsLoading] = useState(true);
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        const res = await fetch('/api/admin/settings/config');
        const data = await res.json();
        if (data.config) {
            setConfig(prev => ({ ...prev, ...data.config }));
        }
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/settings/config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config, admin_id: admin?.id })
        });
        alert('System limits updated');
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Limits</h1>
                <p className="text-gray-500">Configure global rate limits and default constraints.</p>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Global API Rate Limit (requests/min)</label>
                        <Input
                            type="number"
                            value={config.globalRateLimit}
                            onChange={(e) => setConfig({ ...config, globalRateLimit: parseInt(e.target.value) })}
                            className="max-w-xs"
                        />
                        <p className="text-xs text-gray-500 mt-1">Applies as a baseline for all unauthenticated or basic tier traffic.</p>
                    </div>

                    <Button type="submit">Save Configuration</Button>
                </form>
            </Card>
        </div>
    );
}
