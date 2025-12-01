'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';

interface RankData {
    site_id: string;
    keyword: string;
    rank_position: number;
    url: string;
    rank_date: string;
    search_volume: number;
    cpc: number;
    rank_volatility: number;
    change_from_yesterday: number;
}

interface KeywordMetric {
    keyword: string;
    currentRank: number;
    previousRank: number | null;
    change: number;
    url: string;
    history: { date: string; rank: number }[];
}

function RankTrackerContent() {
    const searchParams = useSearchParams();
    const project = searchParams.get('project');
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RankData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!project) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${project}/rank-history?days=${days}`);
                if (!res.ok) throw new Error('Failed to fetch data');
                const json = await res.json();
                setData(json.history || []);
            } catch (err) {
                setError('Failed to load rank history');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [project, days]);

    const processedData = useMemo(() => {
        if (!data.length) return { chartData: [], metrics: [], volatilityCount: 0 };

        // Group by keyword
        const keywordMap = new Map<string, KeywordMetric>();

        // Sort data by rank_date asc
        const sortedData = [...data].sort((a, b) => new Date(a.rank_date).getTime() - new Date(b.rank_date).getTime());

        // Prepare chart data: array of objects with date and rank for each keyword
        // { date: '2023-10-01', 'keyword1': 10, 'keyword2': 5 }
        const dateMap = new Map<string, any>();

        sortedData.forEach(item => {
            const date = new Date(item.rank_date).toLocaleDateString();

            if (!dateMap.has(date)) {
                dateMap.set(date, { date });
            }
            const dateEntry = dateMap.get(date);
            dateEntry[item.keyword] = item.rank_position;

            // Update metrics
            if (!keywordMap.has(item.keyword)) {
                keywordMap.set(item.keyword, {
                    keyword: item.keyword,
                    currentRank: item.rank_position,
                    previousRank: null,
                    change: 0,
                    url: item.url,
                    history: []
                });
            }

            const metric = keywordMap.get(item.keyword)!;
            metric.history.push({ date, rank: item.rank_position });

            // Update current rank (assuming sorted by time, last one is current)
            // The last item for a keyword is the current one.
            metric.currentRank = item.rank_position;
            metric.change = item.change_from_yesterday; // Use pre-calculated change
        });

        const chartData = Array.from(dateMap.values());

        // Finalize metrics
        const metrics: KeywordMetric[] = [];
        let volatilityCount = 0;

        keywordMap.forEach((metric) => {
            // We are already setting currentRank and change in the loop above using the last item's data
            // But let's verify if we need to do anything else.
            // The change_from_yesterday field in DB is what we use.

            if (Math.abs(metric.change) > 5) {
                volatilityCount++;
            }
            metrics.push(metric);
        });

        return { chartData, metrics, volatilityCount };
    }, [data]);

    if (!project) return <div className="p-8">Please provide a project ID in the URL.</div>;

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rank Tracking</h1>
                    <p className="text-muted-foreground mt-1">Project: <span className="font-semibold text-foreground">{project}</span></p>
                </div>
                <div className="flex gap-2">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${days === d
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Last {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Keywords Tracked</h3>
                    <div className="text-2xl font-bold mt-2">{processedData.metrics.length}</div>
                </div>
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">High Volatility</h3>
                    <div className="text-2xl font-bold mt-2 text-orange-500">{processedData.volatilityCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Keywords moved &gt;5 positions</p>
                </div>
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Average Rank</h3>
                    <div className="text-2xl font-bold mt-2">
                        {processedData.metrics.length
                            ? (processedData.metrics.reduce((acc, m) => acc + m.currentRank, 0) / processedData.metrics.length).toFixed(1)
                            : '-'}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Rank History</h3>
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : processedData.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available for this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                reversed
                                domain={[1, 100]}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Rank', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            />
                            <Legend />
                            {processedData.metrics.map((metric, index) => (
                                <Line
                                    key={metric.keyword}
                                    type="monotone"
                                    dataKey={metric.keyword}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Keyword Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Keyword</th>
                                <th className="px-6 py-3 font-medium">Current Rank</th>
                                <th className="px-6 py-3 font-medium">Change</th>
                                <th className="px-6 py-3 font-medium">URL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                                </tr>
                            ) : processedData.metrics.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No keywords found.</td>
                                </tr>
                            ) : (
                                processedData.metrics.map((metric) => (
                                    <tr key={metric.keyword} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{metric.keyword}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${metric.currentRank <= 3 ? 'text-green-500' : ''}`}>
                                                    {metric.currentRank > 0 ? metric.currentRank : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1 font-medium ${metric.change > 0 ? 'text-green-500' :
                                                metric.change < 0 ? 'text-red-500' :
                                                    'text-muted-foreground'
                                                }`}>
                                                {metric.change > 0 ? <ArrowUp className="w-4 h-4" /> :
                                                    metric.change < 0 ? <ArrowDown className="w-4 h-4" /> :
                                                        <Minus className="w-4 h-4" />}
                                                {Math.abs(metric.change)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]" title={metric.url}>
                                            {metric.url}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function RankTrackerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RankTrackerContent />
        </Suspense>
    );
}
