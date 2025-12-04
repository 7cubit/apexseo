'use client';

import { useEffect, useState } from 'react';
import { Card } from '@apexseo/ui';
import {
    Activity,
    Database,
    Server,
    Clock,
    AlertTriangle,
    CheckCircle,
    HardDrive
} from 'lucide-react';

interface SystemStats {
    neo4j: {
        nodes: number;
        relationships: number;
        labels: string[];
        isolatedNodes: number;
    };
    clickhouse: {
        storageBytes: number;
        rowCount: number;
        slowQueries: number;
    };
    temporal: {
        runningWorkflows: number;
        failedWorkflows: number;
    };
    timestamp: string;
}

export default function AdminSystemPage() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/system/insights');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load system stats');
        } finally {
            setIsLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) return <div className="p-8 text-center">Loading system insights...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>

            {/* Service Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatusCard
                    title="API Status"
                    status="Operational"
                    icon={<Server className="w-5 h-5 text-green-600" />}
                />
                <StatusCard
                    title="Neo4j"
                    status={stats.neo4j.nodes > 0 ? "Operational" : "Unknown"}
                    icon={<Database className="w-5 h-5 text-blue-600" />}
                />
                <StatusCard
                    title="ClickHouse"
                    status={stats.clickhouse.rowCount >= 0 ? "Operational" : "Unknown"}
                    icon={<HardDrive className="w-5 h-5 text-yellow-600" />}
                />
                <StatusCard
                    title="Temporal"
                    status={stats.temporal.runningWorkflows >= 0 ? "Operational" : "Unknown"}
                    icon={<Clock className="w-5 h-5 text-purple-600" />}
                />
            </div>

            {/* Detailed Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Neo4j Panel */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold">Graph Database (Neo4j)</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem label="Total Nodes" value={stats.neo4j.nodes.toLocaleString()} />
                        <StatItem label="Relationships" value={stats.neo4j.relationships.toLocaleString()} />
                        <StatItem label="Isolated Nodes" value={stats.neo4j.isolatedNodes.toLocaleString()} color={stats.neo4j.isolatedNodes > 100 ? "text-yellow-600" : "text-gray-900"} />
                        <StatItem label="Node Labels" value={stats.neo4j.labels.length.toString()} />
                    </div>
                </Card>

                {/* ClickHouse Panel */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <HardDrive className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl font-semibold">Analytics (ClickHouse)</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem label="Total Storage" value={formatBytes(stats.clickhouse.storageBytes)} />
                        <StatItem label="Total Rows" value={stats.clickhouse.rowCount.toLocaleString()} />
                        <StatItem label="Slow Queries (24h)" value={stats.clickhouse.slowQueries.toString()} color={stats.clickhouse.slowQueries > 0 ? "text-red-600" : "text-gray-900"} />
                    </div>
                </Card>

                {/* Temporal Panel */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-6 h-6 text-purple-600" />
                        <h2 className="text-xl font-semibold">Workflow Engine (Temporal)</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem label="Running Workflows" value={stats.temporal.runningWorkflows.toString()} />
                        <StatItem label="Failed (24h)" value={stats.temporal.failedWorkflows.toString()} color={stats.temporal.failedWorkflows > 0 ? "text-red-600" : "text-green-600"} />
                    </div>
                </Card>

                {/* Alerts Panel */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-semibold">System Alerts</h2>
                    </div>
                    <div className="space-y-3">
                        {stats.temporal.failedWorkflows > 0 && (
                            <AlertItem message={`${stats.temporal.failedWorkflows} workflows failed in the last 24h`} type="error" />
                        )}
                        {stats.clickhouse.slowQueries > 5 && (
                            <AlertItem message={`High number of slow queries detected (${stats.clickhouse.slowQueries})`} type="warning" />
                        )}
                        {stats.neo4j.isolatedNodes > 1000 && (
                            <AlertItem message={`Large number of isolated nodes found (${stats.neo4j.isolatedNodes})`} type="warning" />
                        )}
                        {stats.temporal.failedWorkflows === 0 && stats.clickhouse.slowQueries <= 5 && stats.neo4j.isolatedNodes <= 1000 && (
                            <div className="text-green-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>All systems nominal.</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatusCard({ title, status, icon }: { title: string, status: string, icon: React.ReactNode }) {
    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <p className={`text-sm ${status === 'Operational' ? 'text-green-600' : 'text-gray-500'}`}>{status}</p>
                </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${status === 'Operational' ? 'bg-green-500' : 'bg-gray-300'}`} />
        </Card>
    );
}

function StatItem({ label, value, color = "text-gray-900" }: { label: string, value: string, color?: string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function AlertItem({ message, type }: { message: string, type: 'error' | 'warning' }) {
    return (
        <div className={`p-3 rounded-md flex items-center gap-2 text-sm font-medium ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
            <AlertTriangle className="w-4 h-4" />
            {message}
        </div>
    );
}
