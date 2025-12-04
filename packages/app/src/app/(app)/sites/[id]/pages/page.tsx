"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useProjectPages } from '@/hooks/useInsights';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectPagesPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading, error } = useProjectPages(projectId, page, limit);

    if (error) {
        return (
            <div className="p-8 text-center text-red-400">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-xl font-bold">Failed to load pages</h2>
                <p>Please try again later.</p>
            </div>
        );
    }

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/sites/${projectId}`} className="hover:text-white transition-colors">Project {projectId}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">Pages</span>
                </div>
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-white">Pages</h1>
                </div>
            </div>

            {/* Pages Table */}
            <Card className="bg-[#151923] border-gray-800/50">
                <CardHeader className="border-b border-gray-800/50 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white">All Pages</CardTitle>
                    <div className="text-sm text-gray-400">
                        Total: {data?.total.toLocaleString() || 0}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1A1F2B] border-b border-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">URL</th>
                                    <th className="px-6 py-4 font-medium text-right">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Word Count</th>
                                    <th className="px-6 py-4 font-medium text-right">Content Score</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-64 bg-gray-800" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto bg-gray-800" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-12 ml-auto bg-gray-800" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-12 ml-auto bg-gray-800" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto bg-gray-800" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    data?.pages.map((page) => (
                                        <tr key={page.page_id} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white truncate max-w-md" title={page.url}>
                                                {page.url}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant={page.status === '200' ? 'default' : 'destructive'} className={page.status === '200' ? 'bg-green-900 text-green-300 hover:bg-green-800' : ''}>
                                                    {page.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-right">{page.word_count?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${(page.content_score || 0) >= 80 ? 'text-green-400' :
                                                        (page.content_score || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {Math.round(page.content_score || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/sites/${projectId}/pages/${page.page_id}/audit`}>
                                                    <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Audit
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm text-gray-400">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className="border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
