'use client';

import { SEOMetrics } from '@/components/dashboard/SEOMetrics';

export default function AnalysisPage() {
    const mockMetrics = [
        { name: 'Performance', score: 85 },
        { name: 'Accessibility', score: 92 },
        { name: 'Best Practices', score: 96 },
        { name: 'SEO', score: 88 },
        { name: 'PWA', score: 70 },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analysis & Metrics</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SEOMetrics metrics={mockMetrics} />
            </div>
        </div>
    );
}
