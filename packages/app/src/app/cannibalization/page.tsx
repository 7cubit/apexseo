'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowRight, Merge, Link as LinkIcon, X } from 'lucide-react';
import { CannibalizationIssue } from '@/lib/cannibalization';

function CannibalizationContent() {
    const searchParams = useSearchParams();
    const project = searchParams.get('project');
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState<CannibalizationIssue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<CannibalizationIssue | null>(null);

    useEffect(() => {
        if (!project) return;

        const fetchReport = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/ api / projects / ${project}/cannibalization`);
                if (!res.ok) throw new Error('Failed to fetch report');
                const json = await res.json();
                setIssues(json.report || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [project]);

    if (!project) return <div className="p-8">Please provide a project ID in the URL.</div>;

    const highPriorityCount = issues.filter(i => i.priority === 'High').length;

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Hero */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h1 className="text-2xl font-bold tracking-tight">Cannibalization Report</h1>
                    <p className="text-muted-foreground mt-1">
                        Found <span className="font-bold text-foreground">{issues.length}</span> keywords with competing pages.
                    </p>
                    {highPriorityCount > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-md w-fit border border-orange-100">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">{highPriorityCount} High Priority Issues</span>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Keyword</th>
                                    <th className="px-6 py-3 font-medium">Pages</th>
                                    <th className="px-6 py-3 font-medium">Avg Rank</th>
                                    <th className="px-6 py-3 font-medium">Best Rank</th>
                                    <th className="px-6 py-3 font-medium">Score</th>
                                    <th className="px-6 py-3 font-medium">Recommendation</th>
                                    <th className="px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Loading report...
                                            </div>
                                        </td>
                                    </tr>
                                ) : issues.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No cannibalization issues found.</td>
                                    </tr>
                                ) : (
                                    issues.map((issue) => (
                                        <tr
                                            key={issue.keyword}
                                            className={`hover:bg-muted/50 transition-colors cursor-pointer ${selectedIssue?.keyword === issue.keyword ? 'bg-muted/50' : ''}`}
                                            onClick={() => setSelectedIssue(issue)}
                                        >
                                            <td className="px-6 py-4 font-medium">{issue.keyword}</td>
                                            <td className="px-6 py-4">{issue.competing_pages}</td>
                                            <td className="px-6 py-4">{issue.avg_rank}</td>
                                            <td className="px-6 py-4 text-green-600 font-semibold">{issue.best_rank}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${issue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                    issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {issue.score} ({issue.priority})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={issue.recommendation}>
                                                {issue.recommendation}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-1 hover:bg-background rounded border" title="Merge">
                                                        <Merge className="w-3 h-3" />
                                                    </button>
                                                    <button className="p-1 hover:bg-background rounded border" title="Redirect">
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                    <button className="p-1 hover:bg-background rounded border" title="Link">
                                                        <LinkIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            {selectedIssue && (
                <div className="w-[400px] border-l bg-card p-6 shadow-xl overflow-y-auto relative">
                    <button
                        onClick={() => setSelectedIssue(null)}
                        className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-xl font-bold mb-1">{selectedIssue.keyword}</h2>
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedIssue.priority === 'High' ? 'bg-red-100 text-red-700' :
                            selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            Score: {selectedIssue.score}
                        </span>
                        <span className="text-sm text-muted-foreground">{selectedIssue.competing_pages} competing pages</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Recommendation</h3>
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                                {selectedIssue.recommendation}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Competing Pages</h3>
                            <div className="space-y-3">
                                {selectedIssue.urls.map((url, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-background text-sm space-y-2">
                                        <div className="font-medium break-all">{url}</div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Current Rank: ?</span> {/* We need to fetch this or pass it */}
                                            <span>Traffic: --</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Impact Estimate</h3>
                            <div className="p-4 border rounded-lg bg-muted/20 text-sm">
                                <p>Fixing this could improve CTR by <strong>~15%</strong>.</p>
                                <p className="text-muted-foreground mt-1 text-xs">Based on consolidating authority to the best ranking page.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CannibalizationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CannibalizationContent />
        </Suspense>
    );
}
