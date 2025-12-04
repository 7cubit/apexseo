"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { usePageAudit } from '@/hooks/useInsights';
import { Skeleton } from '@/components/ui/skeleton';

export default function PageAuditPage() {
    const params = useParams();
    const projectId = params.id as string;
    const pageId = params.pageId as string;
    const { data: page, isLoading, error } = usePageAudit(projectId, pageId);

    if (error) {
        return (
            <div className="p-8 text-center text-red-400">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-xl font-bold">Failed to load audit</h2>
                <p>Please try again later.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-[1600px] mx-auto p-8">
                <Skeleton className="h-12 w-1/3 mb-8 bg-gray-800" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-64 w-full bg-gray-800" />
                    <Skeleton className="h-64 w-full bg-gray-800" />
                    <Skeleton className="h-64 w-full bg-gray-800" />
                </div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="p-8 text-center text-gray-400">
                <h2 className="text-xl font-bold">Page not found</h2>
            </div>
        );
    }

    const score = Math.round(page.content_score || 0);
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
    const scoreBorder = score >= 80 ? 'border-green-500' : score >= 50 ? 'border-yellow-500' : 'border-red-500';

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Link href={`/sites/${projectId}/pages`} className="hover:text-white transition-colors flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pages
                    </Link>
                </div>
                <div className="flex justify-between items-end">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-bold text-white mb-2">Page Audit</h1>
                        <p className="text-gray-400 truncate" title={page.url}>{page.url}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">Re-audit Page</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Card */}
                <Card className="bg-[#151923] border-gray-800/50 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white">Content Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <div className={`w-40 h-40 rounded-full border-8 ${scoreBorder} flex items-center justify-center mb-4`}>
                            <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
                        </div>
                        <p className="text-gray-400 text-center">
                            {score >= 80 ? 'Excellent! Your content is well-optimized.' :
                                score >= 50 ? 'Good, but could be improved.' :
                                    'Needs significant improvement.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Metrics Card */}
                <Card className="bg-[#151923] border-gray-800/50 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Word Count</div>
                            <div className="text-2xl font-bold text-white">{page.word_count?.toLocaleString() || 0}</div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Internal Links</div>
                            <div className="text-2xl font-bold text-white">{page.link_count_internal || 0}</div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">External Links</div>
                            <div className="text-2xl font-bold text-white">{page.link_count_external || 0}</div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Status</div>
                            <div className="text-2xl font-bold text-white">
                                <Badge variant={page.status === '200' ? 'default' : 'destructive'}>
                                    {page.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations (Mock for now, waiting for NLP data) */}
                <Card className="bg-[#151923] border-gray-800/50 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-white">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <h4 className="text-white font-medium mb-1">Add more internal links</h4>
                                    <p className="text-sm text-gray-400">This page is somewhat isolated. Consider linking to it from related cluster pages.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="text-white font-medium mb-1">Title tag length is optimal</h4>
                                    <p className="text-sm text-gray-400">Your title tag is concise and descriptive.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
