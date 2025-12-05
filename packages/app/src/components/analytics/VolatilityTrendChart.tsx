'use client';

import React, { useEffect, useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
    rank_date: string;
    daily_volatility: number;
    ai_overview_count: number;
    ads_count: number;
    snippet_count: number;
}

export function VolatilityTrendChart({ siteId }: { siteId: string }) {
    const [data, setData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/analytics/volatility?siteId=${siteId}`);
                const json = await res.json();
                // The API returns { serp_features: [...] }
                if (json.serp_features) {
                    setData(json.serp_features);
                }
            } catch (error) {
                console.error("Failed to fetch volatility trend data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [siteId]);

    if (loading) return <div>Loading Trend Data...</div>;
    if (!data || data.length === 0) return <div>No trend data available</div>;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Volatility Trend vs SERP Features</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rank_date" />
                            <YAxis yAxisId="left" label={{ value: 'Volatility', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Feature Count', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="daily_volatility" stroke="#8884d8" name="Daily Volatility" />
                            <Bar yAxisId="right" dataKey="ai_overview_count" fill="#82ca9d" name="AI Overviews" />
                            <Bar yAxisId="right" dataKey="ads_count" fill="#ffc658" name="Ads" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
