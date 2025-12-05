import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="max-w-[1600px] mx-auto animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <div className="h-8 w-48 bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-800 rounded"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-gray-800 rounded"></div>
                    <div className="h-10 w-32 bg-gray-800 rounded"></div>
                </div>
            </div>

            {/* KPI Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-[#151923] border-gray-800/50">
                        <CardContent className="p-6">
                            <div className="h-4 w-24 bg-gray-800 rounded mb-4"></div>
                            <div className="flex justify-between items-end">
                                <div className="h-8 w-16 bg-gray-800 rounded"></div>
                                <div className="h-6 w-12 bg-gray-800 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#151923] border-gray-800/50 h-[350px]"></Card>
                <Card className="bg-[#151923] border-gray-800/50 h-[350px]"></Card>
            </div>

            {/* Bottom Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-[#151923] border-gray-800/50 h-[400px]"></Card>
                <Card className="bg-[#151923] border-gray-800/50 h-[400px]"></Card>
            </div>
        </div>
    );
};
