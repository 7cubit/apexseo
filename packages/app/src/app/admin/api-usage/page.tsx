'use client';

import { useEffect, useState } from 'react';
import { Card } from '@apexseo/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageStat {
    date: string;
    count: number;
    errors: number;
}

interface EndpointStat {
    endpoint: string;
    count: number;
    avg_duration: number;
}

export default function AdminApiUsagePage() {
    const [stats, setStats] = useState<UsageStat[]>([]);
    const [topEndpoints, setTopEndpoints] = useState<EndpointStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/api-usage?days=30');
            const data = await res.json();
            if (data.stats) setStats(data.stats);
            if (data.topEndpoints) setTopEndpoints(data.topEndpoints);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">API Usage Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Requests (Last 30 Days)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} name="Requests" />
                                <Line type="monotone" dataKey="errors" stroke="#dc2626" strokeWidth={2} dot={false} name="Errors" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Endpoints */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints (7 Days)</h3>
                    <div className="space-y-4">
                        {topEndpoints.map((ep, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="truncate pr-2 flex-1">
                                    <div className="font-mono text-gray-700 truncate" title={ep.endpoint}>{ep.endpoint}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">{ep.count.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">{Math.round(ep.avg_duration)}ms</div>
                                </div>
                            </div>
                        ))}
                        {topEndpoints.length === 0 && (
                            <div className="text-gray-500 text-center py-4">No data available</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
