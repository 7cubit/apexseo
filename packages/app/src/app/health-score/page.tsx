'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface HealthScoreData {
    overallHealth: number;
    components: {
        tspr: number;
        content: number;
        ux: number;
        truth: number;
        backlinks: number;
        links: number;
    };
    scores: any[];
    history: any[];
}

function HealthScoreContent() {
    const searchParams = useSearchParams();
    const project = searchParams.get('project');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<HealthScoreData | null>(null);

    useEffect(() => {
        if (!project) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${project}/health-score`);
                if (!res.ok) throw new Error('Failed to fetch data');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [project]);

    if (!project) return <div className="p-8">Please provide a project ID in the URL.</div>;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return <div className="p-8">No data available.</div>;

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getHealthLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const componentData = [
        { name: 'TSPR', value: data.components.tspr, fill: '#3b82f6' },
        { name: 'Content', value: data.components.content, fill: '#8b5cf6' },
        { name: 'UX', value: data.components.ux, fill: '#10b981' },
        { name: 'Truth', value: data.components.truth, fill: '#f59e0b' },
        { name: 'Backlinks', value: data.components.backlinks, fill: '#ef4444' },
        { name: 'Links', value: data.components.links, fill: '#6366f1' },
    ];

    const atRiskPages = data.scores.filter((s: any) => s.health_score < 50).sort((a: any, b: any) => a.health_score - b.health_score).slice(0, 5);
    const topPages = [...data.scores].sort((a: any, b: any) => b.health_score - a.health_score).slice(0, 20);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gauge */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                        <h2 className="text-lg font-semibold text-muted-foreground mb-4">Overall Health Score</h2>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="currentColor" strokeWidth="10"
                                    strokeDasharray={`${data.overallHealth * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                    className={getHealthColor(data.overallHealth)}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className={`text-4xl font-bold ${getHealthColor(data.overallHealth)}`}>{data.overallHealth}</span>
                                <span className="text-sm font-medium text-muted-foreground">{getHealthLabel(data.overallHealth)}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <TrendingUp className="w-4 h-4" /> +5 points vs last week
                        </div>
                    </div>

                    {/* Component Breakdown */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm lg:col-span-2">
                        <h2 className="text-lg font-semibold text-muted-foreground mb-4">Component Breakdown</h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={componentData} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {componentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pages at Risk */}
                {atRiskPages.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-red-800">Pages at Risk ({atRiskPages.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-red-700 uppercase bg-red-100/50">
                                    <tr>
                                        <th className="px-4 py-2">Page URL</th>
                                        <th className="px-4 py-2">Health</th>
                                        <th className="px-4 py-2">Issue</th>
                                        <th className="px-4 py-2">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-200">
                                    {atRiskPages.map((page: any) => (
                                        <tr key={page.page_id} className="hover:bg-red-100/30">
                                            <td className="px-4 py-3 font-medium truncate max-w-[300px]">{page.url}</td>
                                            <td className="px-4 py-3 font-bold text-red-600">{page.health_score}</td>
                                            <td className="px-4 py-3 text-red-700">
                                                {page.content_component < 40 ? 'Weak Content' :
                                                    page.ux_component < 40 ? 'UX Issues' :
                                                        page.backlink_component < 30 ? 'Low Authority' : 'Multiple Issues'}
                                            </td>
                                            <td className="px-4 py-3">{page.recommendation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top Pages Table */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-muted-foreground mb-4">Top Pages by Health Score</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-2">Page URL</th>
                                    <th className="px-4 py-2">Health</th>
                                    <th className="px-4 py-2">TSPR</th>
                                    <th className="px-4 py-2">Content</th>
                                    <th className="px-4 py-2">UX</th>
                                    <th className="px-4 py-2">Truth</th>
                                    <th className="px-4 py-2">Backlinks</th>
                                    <th className="px-4 py-2">Recommendation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {topPages.map((page: any) => (
                                    <tr key={page.page_id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium truncate max-w-[200px]" title={page.url}>{page.url}</td>
                                        <td className={`px-4 py-3 font-bold ${getHealthColor(page.health_score)}`}>{page.health_score}</td>
                                        <td className="px-4 py-3">{Math.round(page.tspr_component)}</td>
                                        <td className="px-4 py-3">{Math.round(page.content_component)}</td>
                                        <td className="px-4 py-3">{Math.round(page.ux_component)}</td>
                                        <td className="px-4 py-3">{Math.round(page.truth_component)}</td>
                                        <td className="px-4 py-3">{Math.round(page.backlink_component)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{page.recommendation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 30-Day Trend */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-muted-foreground mb-4">30-Day Health Trend</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.history}>
                                <XAxis dataKey="score_date" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="avg_health_score" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HealthScorePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HealthScoreContent />
        </Suspense>
    );
}
