'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { AISuggestionsStrip } from '@/components/dashboard/AISuggestionsStrip';
import { AskApexButton } from '@/components/dashboard/AskApexButton';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { LinkGraph } from '@/components/dashboard/LinkGraph';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] transition-colors duration-300">
            <DashboardHeader
                projectName="ApexSEO Space"
                projectDomain="apexseo.com"
            />

            <KPIGrid />

            <PerformanceCharts />

            {/* Tasks & Live Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <OpportunitiesSection />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="flex-1">
                        <TasksOverview />
                    </div>
                    <div className="flex-1">
                        <LiveActivityFeed />
                    </div>
                </div>
            </div>

            {/* Graph Authority - Link Architecture */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link Architecture & Authority</h2>
                    <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        View Full Graph
                    </Button>
                </div>
                <LinkGraph />
            </div>

            {/* AI Suggestions */}
            <AISuggestionsStrip />

            <AskApexButton />
        </div>
    );
}
