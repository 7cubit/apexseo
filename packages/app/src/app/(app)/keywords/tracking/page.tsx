"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrackedKeyword {
    keyword: string;
    rank_position: number;
    url: string;
    search_volume: number;
    change_from_yesterday: number;
    rank_date: string;
}

export default function KeywordTrackingPage() {
    const projectId = 'example.com'; // TODO: Get from context
    const { data, error, isLoading } = useSWR(
        `/keywords/tracking/${projectId}`,
        fetcher
    );

    const keywords: TrackedKeyword[] = data?.keywords || [];

    // Calculate visibility score
    const visibilityScore = keywords.reduce((sum, kw) => {
        const positionWeight = kw.rank_position > 0 ? (101 - kw.rank_position) / 100 : 0;
        return sum + (kw.search_volume * positionWeight);
    }, 0);

    // Position distribution
    const positionDist = {
        top3: keywords.filter(k => k.rank_position >= 1 && k.rank_position <= 3).length,
        top10: keywords.filter(k => k.rank_position >= 4 && k.rank_position <= 10).length,
        top20: keywords.filter(k => k.rank_position >= 11 && k.rank_position <= 20).length,
        top50: keywords.filter(k => k.rank_position >= 21 && k.rank_position <= 50).length,
        beyond: keywords.filter(k => k.rank_position > 50).length,
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getPositionBadge = (position: number) => {
        if (position === 0) return <Badge variant="outline">Not Ranking</Badge>;
        if (position <= 3) return <Badge className="bg-green-500">#{position}</Badge>;
        if (position <= 10) return <Badge className="bg-blue-500">#{position}</Badge>;
        if (position <= 20) return <Badge variant="default">#{position}</Badge>;
        return <Badge variant="secondary">#{position}</Badge>;
    };

    if (isLoading) return <div className="p-8 text-center">Loading keywords...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load keywords</div>;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Keyword Tracking</h1>
                <p className="text-muted-foreground">Monitor your keyword rankings and visibility</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Visibility Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(visibilityScore).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Top 3</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{positionDist.top3}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Top 10</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{positionDist.top10}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{keywords.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tracked Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Keyword</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Change</TableHead>
                                <TableHead>Search Volume</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Last Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keywords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No keywords tracked yet. Add keywords from the research tool.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                keywords.map((kw, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                                        <TableCell>{getPositionBadge(kw.rank_position)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {getChangeIcon(kw.change_from_yesterday)}
                                                <span className={
                                                    kw.change_from_yesterday > 0 ? 'text-green-500' :
                                                        kw.change_from_yesterday < 0 ? 'text-red-500' : 'text-gray-400'
                                                }>
                                                    {Math.abs(kw.change_from_yesterday)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{kw.search_volume.toLocaleString()}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            <a href={kw.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                                {kw.url}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(kw.rank_date).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
