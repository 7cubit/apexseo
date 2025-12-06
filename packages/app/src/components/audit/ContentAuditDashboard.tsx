'use client';

import React, { useState, useEffect } from 'react';
import { ContentAuditService, AuditPage, AuditSummary } from '@/lib/services/ContentAuditService';
import { RefreshContentModal } from './RefreshContentModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Filter, MoreHorizontal, TrendingUp, TrendingDown, Minus, RefreshCw, Eye, Trash2, FileText } from 'lucide-react';

export function ContentAuditDashboard() {
    const [pages, setPages] = useState<AuditPage[]>([]);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [selectedPage, setSelectedPage] = useState<AuditPage | null>(null);
    const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);

    const service = new ContentAuditService();

    useEffect(() => {
        service.getAuditReport('project-1').then(data => {
            setPages(data.pages);
            setSummary(data.summary);
        });
    }, []);

    const handleRefresh = (page: AuditPage) => {
        setSelectedPage(page);
        setIsRefreshModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'attention': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'healthy': return 'bg-green-100 text-green-800 hover:bg-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Content Performance Audit
                        </h1>
                        <p className="text-sm text-gray-500">Analyze and optimize your published content</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select defaultValue="30d">
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Last 30 Days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                                <SelectItem value="365d">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>
                </header>

                {/* Content Table */}
                <div className="flex-1 overflow-auto p-6">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page Title</TableHead>
                                    <TableHead>Target Keyword</TableHead>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Traffic (30d)</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pages.map((page) => (
                                    <TableRow key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <TableCell className="font-medium">
                                            <a href={page.url} target="_blank" rel="noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                                                {page.title}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-gray-500">{page.targetKeyword}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold">#{page.currentRank}</span>
                                                {page.rankTrend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                                {page.rankTrend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                                {page.rankTrend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{page.trafficCurrent.toLocaleString()}</span>
                                                <span className={`text-xs ${page.trafficChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {page.trafficChange > 0 ? '+' : ''}{page.trafficChange}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`font-bold ${getScoreColor(page.contentScore)}`}>
                                                {page.contentScore}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {page.lastUpdated}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(page.status)}>
                                                {page.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open('/content/editor', '_blank')}>
                                                        <FileText className="mr-2 h-4 w-4" /> Open in Editor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRefresh(page)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Content
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> View Analytics
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>

            {/* Right Sidebar: Audit Insights */}
            <div className="w-[300px] border-l bg-white dark:bg-gray-900 p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-4">Audit Insights</h3>
                    {summary && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-sm text-gray-500">Total Pages</div>
                                <div className="text-2xl font-bold">{summary.totalPages}</div>
                            </div>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">Needs Update</div>
                                <div className="text-2xl font-bold text-yellow-600">{summary.pagesNeedingUpdate}</div>
                                <div className="text-xs text-yellow-700 mt-1">{(summary.pagesNeedingUpdate / summary.totalPages * 100).toFixed(0)}% of total</div>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="text-sm text-blue-800 dark:text-blue-200">Avg Content Score</div>
                                <div className="text-2xl font-bold text-blue-600">{summary.avgContentScore}</div>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                <div className="text-sm text-green-800 dark:text-green-200">Traffic Trend</div>
                                <div className="text-2xl font-bold text-green-600">+{summary.trafficTrend}%</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-3">Quick Actions</h4>
                    <Button className="w-full mb-3" variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" /> Bulk Refresh (5)
                    </Button>
                    <Button className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export Full Audit
                    </Button>
                </div>
            </div>

            {/* Modal */}
            <RefreshContentModal
                isOpen={isRefreshModalOpen}
                onClose={() => setIsRefreshModalOpen(false)}
                page={selectedPage}
            />
        </div>
    );
}
