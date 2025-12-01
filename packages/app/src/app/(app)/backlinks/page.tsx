"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, ExternalLink, AlertTriangle, Download } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BacklinksPage() {
    const projectId = 'example.com'; // TODO: Get from context
    const { data, error, isLoading } = useSWR(
        `/backlinks/${projectId}`,
        fetcher
    );

    const backlinks = data?.backlinks || [];
    const summary = data?.summary || {
        total: 0,
        referring_domains: 0,
        new_last_30: 0,
        lost_last_30: 0
    };

    // Mock growth data (in production, fetch from ClickHouse time-series)
    const growthData = [
        { date: '2024-01', backlinks: 1200 },
        { date: '2024-02', backlinks: 1350 },
        { date: '2024-03', backlinks: 1500 },
        { date: '2024-04', backlinks: 1680 },
        { date: '2024-05', backlinks: 1850 },
        { date: '2024-06', backlinks: 2100 },
    ];

    // Anchor text distribution
    const anchorData = [
        { name: 'Branded', value: 45, color: '#3b82f6' },
        { name: 'Exact Match', value: 25, color: '#22c55e' },
        { name: 'Partial Match', value: 20, color: '#f97316' },
        { name: 'Generic', value: 10, color: '#6b7280' },
    ];

    // Top referring domains (using our TSPR-like authority score)
    const topDomains = [
        { domain: 'example.com', authority: 85, backlinks: 45, dofollow: 40, nofollow: 5 },
        { domain: 'blog.example.org', authority: 72, backlinks: 32, dofollow: 28, nofollow: 4 },
        { domain: 'news.example.net', authority: 68, backlinks: 28, dofollow: 25, nofollow: 3 },
    ];

    if (isLoading) return <div className="p-8 text-center">Loading backlinks...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load backlinks</div>;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Backlinks</h1>
                    <p className="text-muted-foreground">Monitor your backlink profile and authority</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Backlinks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Referring Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.referring_domains.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">New (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">+{summary.new_last_30}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lost (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">-{summary.lost_last_30}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Backlink Growth</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="backlinks" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anchor Text Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Anchor Text Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={anchorData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {anchorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Referring Domains */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Referring Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topDomains.map((domain, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium">{domain.domain}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {domain.backlinks} backlinks • {domain.dofollow} dofollow
                                        </div>
                                    </div>
                                    <Badge variant={domain.authority > 70 ? 'default' : 'secondary'}>
                                        DA: {domain.authority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toxic Links Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Toxic Backlinks</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Links that may harm your SEO</p>
                    </div>
                    <Button variant="outline" size="sm">
                        Generate Disavow File
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Source URL</TableHead>
                                <TableHead>Spam Score</TableHead>
                                <TableHead>Anchor Text</TableHead>
                                <TableHead>First Seen</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No toxic backlinks detected. Your backlink profile looks healthy!
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
