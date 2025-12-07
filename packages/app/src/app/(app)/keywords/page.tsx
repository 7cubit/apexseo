"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, TrendingUp, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Keyword {
    keyword: string;
    search_volume: number;
    keyword_difficulty?: number;
    cpc?: number;
    serp_features?: string[];
    trend?: number[];
}

export default function KeywordsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Try tracking the real API first (will likely 404/500 without backend)
            const res = await fetch(`/api/keywords/research?query=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error('Backend unavailable');
            const data = await res.json();
            setKeywords(data.keywords || []);
        } catch (error) {
            console.warn("Backend failed, using mock data");
            // Mock Data Fallback
            toast.info("Backend unavailable. Showing demo data.");

            // Generate some deterministic mock data based on the query
            const mockKeywords: Keyword[] = [
                {
                    keyword: searchQuery,
                    search_volume: Math.floor(Math.random() * 50000) + 1000,
                    keyword_difficulty: Math.floor(Math.random() * 100),
                    cpc: Number((Math.random() * 5 + 0.5).toFixed(2)),
                    serp_features: ['Ads', 'Featured Snippet'],
                    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100))
                },
                {
                    keyword: `best ${searchQuery}`,
                    search_volume: Math.floor(Math.random() * 10000) + 500,
                    keyword_difficulty: Math.floor(Math.random() * 80) + 20,
                    cpc: Number((Math.random() * 10 + 2).toFixed(2)),
                    serp_features: ['Reviews', 'Shopping'],
                    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100))
                },
                {
                    keyword: `${searchQuery} for beginners`,
                    search_volume: Math.floor(Math.random() * 5000) + 200,
                    keyword_difficulty: Math.floor(Math.random() * 40),
                    cpc: Number((Math.random() * 2 + 0.1).toFixed(2)),
                    serp_features: ['People Also Ask', 'Video'],
                    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100))
                },
                {
                    keyword: `${searchQuery} guide 2024`,
                    search_volume: Math.floor(Math.random() * 2000) + 100,
                    keyword_difficulty: Math.floor(Math.random() * 60),
                    cpc: Number((Math.random() * 4 + 1).toFixed(2)),
                    serp_features: ['Featured Snippet'],
                    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100))
                },
                {
                    keyword: `cheap ${searchQuery} tools`,
                    search_volume: Math.floor(Math.random() * 1500) + 50,
                    keyword_difficulty: Math.floor(Math.random() * 30),
                    cpc: Number((Math.random() * 8 + 3).toFixed(2)),
                    serp_features: ['Ads'],
                    trend: Array(12).fill(0).map(() => Math.floor(Math.random() * 100))
                }
            ];

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setKeywords(mockKeywords);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToTracking = async (keyword: string) => {
        try {
            await fetch('/api/keywords/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: 'example.com', keyword })
            });
            toast.success(`Added "${keyword}" to tracking`);
        } catch (error) {
            toast.error('Failed to add keyword');
        }
    };

    const exportToCsv = () => {
        const csv = [
            ['Keyword', 'Search Volume', 'Difficulty', 'CPC', 'SERP Features'].join(','),
            ...keywords.map(k => [
                k.keyword,
                k.search_volume,
                k.keyword_difficulty || 0,
                k.cpc || 0,
                (k.serp_features || []).join(';')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keywords-${searchQuery}-${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Keyword Research</h1>
                <p className="text-muted-foreground">Discover high-value keywords for your content strategy</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter seed keyword (e.g., 'seo tools')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            <Search className="mr-2 h-4 w-4" />
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {keywords.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Keyword Suggestions ({keywords.length})</CardTitle>
                        <Button variant="outline" size="sm" onClick={exportToCsv}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead>Search Volume</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>CPC</TableHead>
                                    <TableHead>SERP Features</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {keywords.map((kw, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                {kw.search_volume.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                (kw.keyword_difficulty || 0) > 70 ? 'destructive' :
                                                    (kw.keyword_difficulty || 0) > 40 ? 'default' : 'secondary'
                                            }>
                                                {kw.keyword_difficulty || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${(kw.cpc || 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {(kw.serp_features || []).slice(0, 3).map((feature, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAddToTracking(kw.keyword)}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Track
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
