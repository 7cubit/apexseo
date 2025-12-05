"use client";

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { AISuggestionsStrip } from '@/components/dashboard/AISuggestionsStrip';
import { AskApexButton } from '@/components/dashboard/AskApexButton';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { LinkGraph } from '@/components/dashboard/LinkGraph';
import { Button } from '@/components/ui/button';

export default function SiteOverviewPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isEmpty) {
        return (
            <div className="max-w-[1600px] mx-auto">
                <DashboardHeader projectName="Project Alpha" projectDomain="example.com" />
                <DashboardEmptyState />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <DashboardHeader projectName="Project Alpha" projectDomain="example.com" />

            <KPIGrid />

            <PerformanceCharts />

            {/* Tasks & Automation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <OpportunitiesSection />
                </div>
                <div className="lg:col-span-1">
                    <TasksOverview />
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
