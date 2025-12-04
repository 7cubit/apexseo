'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface ProjectDetail {
    id: string;
    name: string;
    domain: string;
    crawlStatus?: string;
}

interface Metrics {
    pages: number;
    errors: number;
    avg_time: number;
}

interface CrawlLog {
    url: string;
    status: string;
    timestamp: string;
}

export default function AdminProjectDetailPage({ params }: { params: { id: string } }) {
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [logs, setLogs] = useState<CrawlLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/admin/projects/${params.id}`);
            const data = await res.json();
            if (data.project) {
                setProject(data.project);
                setMetrics(data.metrics);
                setLogs(data.crawlLogs);
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (action: string, extraBody: any = {}) => {
        if (!confirm(`Are you sure you want to ${action.toLowerCase().replace('_', ' ')}?`)) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/projects/${params.id}/crawl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, admin_id: admin?.id, ...extraBody })
            });
            if (res.ok) fetchProject();
        } catch (error) {
            console.error(`Failed to ${action}:`, error);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!project) return <div className="p-8 text-center">Project not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-500">{project.domain}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleAction('FORCE_CRAWL', { url: `https://${project.domain}` })}
                        disabled={isActionLoading}
                    >
                        Force Crawl
                    </Button>
                    {project.crawlStatus === 'PAUSED' ? (
                        <Button
                            onClick={() => handleAction('RESUME')}
                            disabled={isActionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Resume
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => handleAction('PAUSE')}
                            disabled={isActionLoading}
                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                            Pause
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Pages Processed</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.pages.toLocaleString() || 0}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Errors</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{metrics?.errors.toLocaleString() || 0}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{project.crawlStatus || 'IDLE'}</p>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Crawl Activity</h3>
                <div className="space-y-4">
                    {logs.length > 0 ? (
                        logs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div className="truncate pr-4 flex-1">
                                    <div className="text-sm font-medium text-gray-900 truncate">{log.url}</div>
                                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${log.status === '200' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {log.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-4">No recent activity found.</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
