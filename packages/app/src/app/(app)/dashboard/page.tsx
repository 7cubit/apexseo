'use client';

import { useEffect } from 'react';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { RecentAnalysis } from '@/components/dashboard/RecentAnalysis';
import { useProjectStore } from '@/lib/stores/project-store';
import { useAnalysisStore } from '@/lib/stores/analysis-store';

export default function DashboardPage() {
    const { projects, fetchProjects } = useProjectStore();
    const { results, fetchAnalysis } = useAnalysisStore();

    useEffect(() => {
        fetchProjects();
        // In a real app, we'd fetch recent analysis for all projects or the user
        // For now, we'll use mock data or empty state if no projects
    }, [fetchProjects]);

    // Mock data for display until we have real data flowing
    const mockStats = {
        totalProjects: projects.length || 3,
        avgHealthScore: 78,
        criticalIssues: 12,
        crawledPages: 1450
    };

    const mockAnalysis = [
        { id: '1', project: 'apexseo.com', score: 85, date: '2 hours ago', status: 'completed' },
        { id: '2', project: 'example.com', score: 62, date: '5 hours ago', status: 'completed' },
        { id: '3', project: 'test-site.org', score: 92, date: '1 day ago', status: 'completed' },
        { id: '4', project: 'client-site.net', score: 45, date: '2 days ago', status: 'failed' },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="space-y-4">
                <OverviewStats {...mockStats} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <RecentAnalysis analyses={mockAnalysis} />
                    {/* We can add another chart or widget here */}
                </div>
            </div>
        </div>
    );
}
