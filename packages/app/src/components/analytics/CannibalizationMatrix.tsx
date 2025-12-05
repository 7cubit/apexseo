'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CannibalizationIssue {
    keyword: string;
    competing_pages: number;
    urls: string[];
    avg_rank: number;
    score: number;
    priority: 'High' | 'Medium' | 'Low';
    recommendation: string;
}

export function CannibalizationMatrix({ siteId }: { siteId: string }) {
    const [issues, setIssues] = useState<CannibalizationIssue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/analytics/cannibalization?siteId=${siteId}`);
                const json = await res.json();
                setIssues(json);
            } catch (error) {
                console.error("Failed to fetch cannibalization data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [siteId]);

    if (loading) return <div>Loading Cannibalization Data...</div>;
    if (issues.length === 0) return <div>No cannibalization issues found.</div>;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'destructive';
            case 'Medium': return 'warning'; // Assuming warning variant exists
            default: return 'secondary';
        }
    };

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle>Cannibalization Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead>Competing Pages</TableHead>
                            <TableHead>Avg Rank</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Recommendation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.map((issue, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{issue.keyword}</TableCell>
                                <TableCell>{issue.competing_pages}</TableCell>
                                <TableCell>{issue.avg_rank}</TableCell>
                                <TableCell>{issue.score}</TableCell>
                                <TableCell>
                                    <Badge variant={getPriorityColor(issue.priority) as any}>
                                        {issue.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>{issue.recommendation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
