'use client';

import React, { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';

export default function DashboardTestPage() {
    const { fetchDashboardData, isLoading } = useDashboardStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#0B0E14] min-h-screen">
            <DashboardHeader
                projectName="ApexSEO Space"
                projectDomain="apexseo.com"
            />

            <KPIGrid />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <PerformanceCharts />
                    <AIRecommendations />
                    <OpportunitiesSection />
                </div>
                <div className="space-y-6">
                    <LiveActivityFeed />
                    <TasksOverview />
                </div>
            </div>
        </div>
    );
}
