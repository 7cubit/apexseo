'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VolatilityData {
    keyword: string;
    volatility_index: number;
    avg_daily_change: number;
    status: 'Stable' | 'Moderate' | 'High';
}

interface VolatilityReport {
    global_volatility: number;
    market_volatility: number;
    global_status: 'Calm' | 'Breezy' | 'Stormy';
    keywords: VolatilityData[];
}

export function VolatilityChart({ siteId }: { siteId: string }) {
    const [data, setData] = useState<VolatilityReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/analytics/volatility?siteId=${siteId}`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch volatility data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [siteId]);

    if (loading) return <div>Loading Volatility Data...</div>;
    if (!data) return <div>No data available</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Stormy': return 'destructive';
            case 'Breezy': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SERP Volatility Monitor (EVI)</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="outline">
                        Market EVI: {data.market_volatility}
                    </Badge>
                    <Badge variant={getStatusColor(data.global_status) as any}>
                        Your EVI: {data.global_volatility} ({data.global_status})
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.keywords}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="keyword" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="volatility_index" stroke="#8884d8" name="Volatility Index" />
                            <Line type="monotone" dataKey="avg_daily_change" stroke="#82ca9d" name="Avg Daily Change" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
