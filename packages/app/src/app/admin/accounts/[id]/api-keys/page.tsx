'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    status: string;
    created_at: string;
    last_used_at?: string;
}

export default function AdminAccountApiKeysPage({ params }: { params: { id: string } }) {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchKeys();
    }, [params.id]);

    const fetchKeys = async () => {
        try {
            const res = await fetch(`/api/admin/accounts/${params.id}/api-keys`);
            const data = await res.json();
            if (data.keys) setKeys(data.keys);
        } catch (error) {
            console.error('Failed to fetch keys:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/accounts/${params.id}/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName, admin_id: admin?.id })
            });
            const data = await res.json();
            if (data.apiKey) {
                setKeys([data.apiKey, ...keys]);
                setCreatedSecret(data.secretKey);
                setNewKeyName('');
            }
        } catch (error) {
            console.error('Failed to create key:', error);
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/accounts/${params.id}/api-keys?keyId=${keyId}&admin_id=${admin?.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'REVOKED' } : k));
            }
        } catch (error) {
            console.error('Failed to revoke key:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>

            {/* Create Key Form */}
            <Card className="p-6">
                <form onSubmit={handleCreateKey} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Key Name</label>
                        <Input
                            placeholder="e.g. Production App"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit">Create API Key</Button>
                </form>

                {createdSecret && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium mb-2">API Key Created Successfully!</p>
                        <p className="text-sm text-green-700 mb-2">Please copy this key now. You won't be able to see it again.</p>
                        <div className="flex items-center gap-2">
                            <code className="bg-white px-3 py-2 rounded border border-green-200 font-mono text-sm flex-1 select-all">
                                {createdSecret}
                            </code>
                            <Button size="sm" variant="outline" onClick={() => {
                                navigator.clipboard.writeText(createdSecret);
                                alert('Copied to clipboard!');
                            }}>Copy</Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-green-600 hover:text-green-800"
                            onClick={() => setCreatedSecret(null)}
                        >
                            Done
                        </Button>
                    </div>
                )}
            </Card>

            {/* Keys List */}
            <div className="space-y-4">
                {keys.map((key) => (
                    <Card key={key.id} className="p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h4 className="font-medium text-gray-900">{key.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${key.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {key.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 font-mono">
                                {key.key_prefix}****************
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Created: {new Date(key.created_at).toLocaleDateString()}
                                {key.last_used_at && ` • Last used: ${new Date(key.last_used_at).toLocaleDateString()}`}
                            </div>
                        </div>
                        {key.status === 'ACTIVE' && (
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRevokeKey(key.id)}
                            >
                                Revoke
                            </Button>
                        )}
                    </Card>
                ))}
                {keys.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">No API keys found.</div>
                )}
            </div>
        </div>
    );
}
