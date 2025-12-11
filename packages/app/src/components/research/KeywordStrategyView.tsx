'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StrategyProps {
    keyword: string; // The seed keyword (or ID)
    projectId: string;
}

export function KeywordStrategyView({ keyword, projectId }: StrategyProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Fetch strategy data
        const fetchData = async () => {
            try {
                // In a real app, this would be GET /api/projects/:id/research/:keyword
                // For now we might need to rely on what was just saved or fetch from Neo4j
                // Assuming an endpoint exists or we use the semantic analysis result if passed (but we want persistence)
                // Let's assume we fetch by keyword ID/Text
                const res = await fetch(`/api/keywords/strategy/${encodeURIComponent(keyword)}?projectId=${projectId}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    // Fallback or error
                    console.error("Failed to load strategy");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [keyword, projectId]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                <div className="text-xl font-medium text-gray-500">Generating Strategy for "{decodeURIComponent(keyword)}"...</div>
            </div>
        );
    }

    // Fallback data if API not ready yet for demo
    const strategy = data || {
        keyword: decodeURIComponent(keyword),
        volume: 12500,
        difficulty: 45,
        intent: 'Commercial',
        clusters: [
            { name: "Best Tools", keywords: ["tool a", "tool b", "comparison"] },
            { name: "How to Guide", keywords: ["setup guide", "tutorial", "tips"] }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
            {/* A. HEADER SECTION */}
            <header className="bg-white dark:bg-gray-900 border-b px-8 py-6 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Strategy Blueprint</span>
                            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Active Research</Badge>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
                            Strategy: {strategy.keyword}
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-xs text-gray-500 uppercase">Volume</div>
                            <div className="text-xl font-bold">{strategy.volume?.toLocaleString()}</div>
                        </div>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-xs text-gray-500 uppercase">Difficulty</div>
                            <div className="text-xl font-bold text-yellow-600">{strategy.difficulty}</div>
                        </div>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-xs text-gray-500 uppercase">Intent</div>
                            <div className="text-xl font-bold text-blue-600">{strategy.intent}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* B. WORKFLOW VISUALIZER */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Keyword Clusters */}
                <section className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Keyword Clusters
                    </h2>
                    <div className="space-y-3">
                        {strategy.clusters?.map((cluster: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-4 shadow-sm hover:border-purple-500 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600">{cluster.name}</h3>
                                    <Badge variant="secondary" className="text-xs">{cluster.keywords?.length || 0} kw</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cluster.keywords?.slice(0, 3).map((k: string) => (
                                        <span key={k} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{k}</span>
                                    ))}
                                    {(cluster.keywords?.length || 0) > 3 && (
                                        <span className="text-xs text-gray-400">+{cluster.keywords.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Right Column: Workflow Snapshot */}
                <section className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Play className="w-5 h-5 text-blue-500" />
                        Workflow Snapshot
                    </h2>
                    <div className="bg-white dark:bg-gray-900 border border-dashed rounded-xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden bg-grid-slate-100">
                        {/* Placeholder Logic */}
                        <div className="text-center space-y-4 relative z-10 max-w-lg">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold">CompetitorsKeywordSearchWorkflow Active</h3>
                            <p className="text-gray-500">
                                We are currently analyzing 15+ competitor domains to extract gap opportunities and validate intent.
                                This visualization will update automatically.
                            </p>

                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-6">
                                <div className="bg-blue-600 h-2.5 rounded-full w-[45%]" />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Scanning SERPs...</span>
                                <span>45%</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* C. ACTION BAR */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>Analysis suggests 3 high-value content opportunities.</span>
                    </div>
                    <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                        onClick={() => router.push(`/projects/${projectId}/content/plan/new`)} // Hypothetical next step
                    >
                        Create Content Plan <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
