'use client';

import { useEffect, useState } from 'react';
import { Card } from '@apexseo/ui';

interface AuditLogDetail {
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
    ip_address?: string;
    details?: string;
}

export default function AuditLogDetailPage({ params }: { params: { id: string } }) {
    const [log, setLog] = useState<AuditLogDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLog();
    }, [params.id]);

    const fetchLog = async () => {
        try {
            const res = await fetch(`/api/admin/audit-logs/${params.id}`);
            const data = await res.json();
            if (data.log) {
                setLog(data.log);
            }
        } catch (error) {
            console.error('Failed to fetch log details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
    if (!log) return <div className="p-8 text-center">Log not found</div>;

    let parsedDetails = null;
    try {
        if (log.details) parsedDetails = JSON.parse(log.details);
    } catch (e) {
        parsedDetails = log.details;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Audit Log Details</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Metadata</h2>
                    <DetailRow label="Log ID" value={log.id} />
                    <DetailRow label="Timestamp" value={new Date(log.created_at).toLocaleString()} />
                    <DetailRow label="Action" value={log.action} />
                    <DetailRow label="Admin ID" value={log.admin_id} />
                    <DetailRow label="IP Address" value={log.ip_address || 'N/A'} />
                </Card>

                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Target Entity</h2>
                    <DetailRow label="Type" value={log.entity_type} />
                    <DetailRow label="ID" value={log.entity_id} />
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Change Details</h2>
                <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{JSON.stringify(parsedDetails, null, 2)}</pre>
                </div>
            </Card>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
