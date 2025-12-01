"use client";

import React from 'react';
import { GraphView } from '@/components/graph/GraphView';
import { ReviewTable } from '@/components/optimizer/ReviewTable';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, RefreshCw } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export default function GraphPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { projects } = useProject(); // Just to ensure we have context if needed

    // Fetch Graph Data
    const { data: graphData, error: graphError, isLoading: graphLoading } = useSWR(
        id ? `/projects/${id}/graph` : null,
        fetcher
    );

    // Fetch Suggestions
    const { data: suggestions, mutate: mutateSuggestions } = useSWR(
        id ? `/projects/${id}/suggestions` : null,
        fetcher
    );

    const handleRunOptimizer = async () => {
        // Trigger workflow via API (we need to create this endpoint or use existing analysis trigger)
        // For now, assume we have a trigger endpoint
        await fetch(`/api/analysis/${id}/optimizer`, { method: 'POST' });
        // Poll or wait
    };

    const handleAccept = async (suggestionId: string, anchor: string) => {
        await fetch(`/api/suggestions/${suggestionId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: id, anchorText: anchor })
        });
        mutateSuggestions();
    };

    const handleReject = async (suggestionId: string, reason: string) => {
        await fetch(`/api/suggestions/${suggestionId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: id, reason })
        });
        mutateSuggestions();
    };

    if (graphLoading) return <div className="p-8 text-center">Loading graph...</div>;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Site Graph & Link Optimizer</h1>
                    <p className="text-muted-foreground">Visualize your site structure and discover internal linking opportunities.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={handleRunOptimizer}>
                        <Play className="mr-2 h-4 w-4" /> Run Optimizer
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="graph" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="graph">Graph View</TabsTrigger>
                    <TabsTrigger value="suggestions">Link Opportunities ({suggestions?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interactive Site Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GraphView
                                initialNodes={graphData?.nodes || []}
                                initialEdges={graphData?.edges || []}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Internal Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReviewTable
                                suggestions={suggestions || []}
                                onAccept={handleAccept}
                                onReject={handleReject}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
