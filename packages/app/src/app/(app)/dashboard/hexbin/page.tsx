'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { HexbinTopicalMap, ClusterHexbinData } from '@/components/visualization/HexbinTopicalMap';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
    // State
    const [topicId] = useState('d8f1a3b2-0000-0000-0000-123456789000'); // Default or from URL/Context
    const [myDomain] = useState('my-travel-site.com'); // Should come from User Context

    // Data Fetching
    const { data, error, isLoading } = useSWR<ClusterHexbinData[]>(
        `/api/analytics/hexbin-data?topic_id=${topicId}`,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: false
        }
    );

    // Interaction Handler
    const handleHexagonClick = async (clusterId: string) => {
        const cluster = data?.find(c => c.cluster_id === clusterId);
        if (!cluster) return;

        // Only trigger for High Opportunity (Red) or Medium
        if (cluster.opportunity_level === 'OWNED') {
            toast.info(`You already own the "${cluster.cluster_name}" cluster!`, {
                description: "Good job! Focus on maintenance."
            });
            return;
        }

        const toastId = toast.loading(`Initializing Brief Generation for "${cluster.cluster_name}"...`);

        try {
            // Determine top competitor for this cluster
            // The API returns top_competitors as array of tuples/objects. 
            // We need to parse it if it comes as raw tuples or handle the shape.
            // In the API route, we returned `top_competitors`.
            // Let's assume the first one is the top competitor.
            // Note: The type definition in HexbinTopicalMap might need to be flexible if `top_competitors` isn't in `ClusterHexbinData`.
            // But we can cast or extend.

            const topCompetitor = (cluster as any).top_competitors?.[0]?.[0] || 'competitor.com';

            const response = await fetch('/api/workflows/trigger-gap-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cluster_id: clusterId,
                    topic_id: topicId,
                    my_domain: myDomain,
                    top_competitor: topCompetitor,
                    user_id: 'user-123' // Replace with real auth
                })
            });

            if (!response.ok) throw new Error('Failed to start workflow');

            const result = await response.json();

            toast.success(`Workflow Started!`, {
                id: toastId,
                description: `Task ID: ${result.taskId}. We are generating your content brief.`
            });

        } catch (err) {
            console.error(err);
            toast.error("Failed to trigger workflow", {
                id: toastId,
                description: "Please try again later."
            });
        }
    };

    return (
        <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Topical Map: Kyoto Travel</h1>
                    <p className="text-sm text-gray-500">Visualizing coverage gaps and opportunities</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-xs text-gray-400">
                        Topic ID: {topicId.substring(0, 8)}...
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 relative">
                <HexbinTopicalMap
                    clustersData={data || []}
                    loading={isLoading}
                    error={error ? "Failed to load map data" : null}
                    onHexagonClick={handleHexagonClick}
                    width={1200} // Responsive wrapper would be better, but fixed for now
                    height={800}
                />
            </div>
        </main>
    );
}
