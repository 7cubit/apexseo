'use client';

import React, { Suspense } from 'react';
import { VolatilityChart } from '@/components/analytics/VolatilityChart';
import { CannibalizationMatrix } from '@/components/analytics/CannibalizationMatrix';
import { useSearchParams } from 'next/navigation';

import { VolatilityTrendChart } from '@/components/analytics/VolatilityTrendChart';
import { VolatilityAlerts } from '@/components/analytics/VolatilityAlerts';

function AnalyticsContent() {
    const searchParams = useSearchParams();
    const siteId = searchParams.get('siteId') || 'default-site'; // Fallback for demo

    return (
        <div className="grid gap-6">
            <VolatilityAlerts siteId={siteId} />

            <section>
                <h2 className="text-xl font-semibold mb-4">Keyword Volatility</h2>
                <div className="grid gap-6">
                    <VolatilityChart siteId={siteId} />
                    <VolatilityTrendChart siteId={siteId} />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Cannibalization Matrix</h2>
                <CannibalizationMatrix siteId={siteId} />
            </section>
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Advanced SEO Analytics</h1>
            <Suspense fallback={<div>Loading Analytics...</div>}>
                <AnalyticsContent />
            </Suspense>
        </div>
    );
}
