'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';
import { CheckCircle, XCircle } from 'lucide-react';

interface Integration {
    name: string;
    status: string;
    type: string;
}

interface SystemConfig {
    maintenanceMode: boolean;
    announcement?: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [config, setConfig] = useState<SystemConfig>({ maintenanceMode: false, announcement: '' });
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchIntegrations();
        fetchConfig();
    }, []);

    const fetchIntegrations = async () => {
        const res = await fetch('/api/admin/settings/integrations');
        const data = await res.json();
        setIntegrations(data.integrations);
    };

    const fetchConfig = async () => {
        const res = await fetch('/api/admin/settings/config');
        const data = await res.json();
        if (data.config) {
            setConfig(prev => ({ ...prev, ...data.config }));
        }
    };

    const handleSaveConfig = async () => {
        await fetch('/api/admin/settings/config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config, admin_id: admin?.id })
        });
        alert('Configuration updated');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Integrations & Maintenance</h1>
                <p className="text-gray-500">Monitor external services and manage system availability.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                    <Card key={integration.name} className="p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-500">{integration.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {integration.status === 'Connected' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                            <span className={`text-sm font-medium ${integration.status === 'Connected' ? 'text-green-700' : 'text-gray-500'}`}>
                                {integration.status}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-6 border-l-4 border-l-yellow-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h3>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-600">When enabled, the application will show a maintenance page to all non-admin users.</p>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={config.maintenanceMode}
                            onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                        />
                        <span className="ml-2 text-sm font-medium">{config.maintenanceMode ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Global Announcement Banner</label>
                    <Input
                        placeholder="e.g. Scheduled maintenance at 02:00 UTC"
                        value={config.announcement || ''}
                        onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                    />
                </div>

                <Button onClick={handleSaveConfig} variant="outline">Update System Status</Button>
            </Card>
        </div>
    );
}
