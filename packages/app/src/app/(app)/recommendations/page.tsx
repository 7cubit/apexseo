"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Loader2, Link as LinkIcon, Zap, Copy, CheckCircle } from 'lucide-react';

interface LinkSuggestion {
    site_id: string;
    from_page_id: string;
    to_page_id: string;
    similarity: number;
    target_tspr: number;
    score: number;
    reason?: string;
}

export default function RecommendationsPage() {
    const searchParams = useSearchParams();
    const projectUrl = searchParams.get("project") || "example.com";
    const projectId = projectUrl.replace(/[^a-z0-9]/g, "-");

    const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchSuggestions = React.useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        if (forceRefresh) setIsGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/links?refresh=${forceRefresh}`);
            if (res.ok) {
                const json = await res.json();
                setSuggestions(json.suggestions || []);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchSuggestions();
        }
    }, [projectId, fetchSuggestions]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getPriority = (score: number) => {
        if (score > 0.7) return { label: 'High', color: 'text-red-400 bg-red-400/10' };
        if (score > 0.4) return { label: 'Medium', color: 'text-yellow-400 bg-yellow-400/10' };
        return { label: 'Low', color: 'text-gray-400 bg-gray-400/10' };
    };

    return (

        <div className="max-w-[1600px] mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Link Recommendations</h1>
                    <p className="text-gray-400">AI-driven internal linking opportunities for <span className="text-blue-400">{projectUrl}</span></p>
                </div>
                <Button
                    onClick={() => fetchSuggestions(true)}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    Generate New Links
                </Button>
            </div>

            {isLoading && !isGenerating ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : suggestions.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatsCard
                            title="Potential Impact"
                            value="+14%"
                            suffix="Avg TSPR"
                            isPositive={true}
                            subtext="If top 20 links are implemented"
                            icon={<Zap className="w-4 h-4 text-yellow-500" />}
                        />
                        <StatsCard
                            title="Opportunities"
                            value={suggestions.length}
                            subtext="High quality semantic matches"
                            icon={<LinkIcon className="w-4 h-4 text-blue-500" />}
                        />
                    </div>

                    <Card className="bg-[#151923] border-gray-800/50">
                        <CardHeader className="border-b border-gray-800/50 px-6 py-4">
                            <CardTitle className="text-lg font-semibold text-white">Recommended Internal Links</CardTitle>
                            <CardDescription className="text-gray-400">Prioritized by semantic relevance and target page authority.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-[#1A1F2B] border-b border-gray-800/50">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Priority</th>
                                            <th className="px-6 py-4 font-medium">Source Page</th>
                                            <th className="px-6 py-4 font-medium">Target Page</th>
                                            <th className="px-6 py-4 font-medium text-right">Similarity</th>
                                            <th className="px-6 py-4 font-medium text-right">Target TSPR</th>
                                            <th className="px-6 py-4 font-medium text-right">Score</th>
                                            <th className="px-6 py-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {suggestions.map((link, index) => {
                                            const priority = getPriority(link.score);
                                            const linkId = `${link.from_page_id}-${link.to_page_id}`;
                                            return (
                                                <tr key={index} className="hover:bg-gray-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                                                            {priority.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-300 truncate max-w-[250px]" title={link.from_page_id}>
                                                        {link.from_page_id}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-blue-400 truncate max-w-[250px]" title={link.to_page_id}>
                                                        {link.to_page_id}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{(link.similarity * 100).toFixed(1)}%</td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{link.target_tspr.toFixed(4)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-white">{link.score.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(`<a href="${link.to_page_id}">Link Keyword</a>`, linkId)}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            {copiedId === linkId ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="text-center text-gray-500 py-20">
                    No recommendations found. Try generating new links.
                </div>
            )}
        </div>

    );
}
