"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Loader2, Trophy, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { TsprResult } from '@/lib/types';

export default function LeaderboardPage() {
    const searchParams = useSearchParams();
    const projectUrl = searchParams.get("project") || "example.com";
    const projectId = projectUrl.replace(/[^a-z0-9]/g, "-");

    const [data, setData] = useState<{
        pagesProcessed: number;
        avgPr: number;
        avgTspr: number;
        results: TsprResult[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/tspr`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/tspr`, { method: 'POST' });
            if (res.ok) {
                // The POST returns top5, but we want full results, so let's re-fetch
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to recalculate TSPR:", error);
        } finally {
            setIsRecalculating(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId, fetchData]);

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Authority Leaderboard</h1>
                        <p className="text-gray-400">Topic-Sensitive PageRank (TSPR) analysis for <span className="text-blue-400">{projectUrl}</span></p>
                    </div>
                    <Button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isRecalculating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Recalculate TSPR
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : data ? (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatsCard
                                title="Top TSPR Score"
                                value={data.results[0]?.tspr.toFixed(4) || "0.0000"}
                                change="0"
                                isPositive={true}
                                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                            />
                            <StatsCard
                                title="Avg TSPR"
                                value={data.avgTspr.toFixed(4)}
                                change="0"
                                isPositive={true}
                                icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                            />
                            <StatsCard
                                title="Pages Processed"
                                value={data.pagesProcessed.toLocaleString()}
                                change="0"
                                isPositive={true}
                                icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
                            />
                        </div>

                        {/* Leaderboard Table */}
                        <Card className="bg-[#151923] border-gray-800/50">
                            <CardHeader className="border-b border-gray-800/50 px-6 py-4">
                                <CardTitle className="text-lg font-semibold text-white">Page Authority Rankings</CardTitle>
                                <CardDescription className="text-gray-400">Pages ranked by their Topic-Sensitive PageRank score.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-[#1A1F2B] border-b border-gray-800/50">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Rank</th>
                                                <th className="px-6 py-4 font-medium">Page URL</th>
                                                <th className="px-6 py-4 font-medium text-right">TSPR</th>
                                                <th className="px-6 py-4 font-medium text-right">PR (Base)</th>
                                                <th className="px-6 py-4 font-medium text-right">Cluster</th>
                                                <th className="px-6 py-4 font-medium text-right">Inlinks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {data.results.map((page, index) => (
                                                <tr key={index} className="hover:bg-gray-800/20 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-500">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-medium text-white truncate max-w-[300px]" title={page.url}>
                                                        {page.url}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-blue-400">{page.tspr?.toFixed(6)}</td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{page.pr?.toFixed(6)}</td>
                                                    <td className="px-6 py-4 text-right text-gray-300">
                                                        {page.cluster !== undefined ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                                                                {page.cluster}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-300">{page.inlinks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-20">
                        No data available. Click &quot;Recalculate TSPR&quot; to start analysis.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
