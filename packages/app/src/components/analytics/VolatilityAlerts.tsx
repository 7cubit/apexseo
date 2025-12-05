'use client';

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface VolatilityReport {
    alerts?: string[];
}

export function VolatilityAlerts({ siteId }: { siteId: string }) {
    const [alerts, setAlerts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/analytics/volatility?siteId=${siteId}`);
                const json = await res.json();
                if (json.alerts) {
                    setAlerts(json.alerts);
                }
            } catch (error) {
                console.error("Failed to fetch volatility alerts", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [siteId]);

    if (loading || alerts.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {alerts.map((alert, idx) => (
                <Alert key={idx} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Volatility Alert</AlertTitle>
                    <AlertDescription>
                        {alert}
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
}
