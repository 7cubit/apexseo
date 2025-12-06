'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CannibalizationService, VolatilityData } from '../../lib/services/CannibalizationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, RefreshCw } from 'lucide-react';

interface VolatilityTrackerProps {
    keyword: string;
}

export function VolatilityTracker({ keyword }: VolatilityTrackerProps) {
    const [data, setData] = useState<VolatilityData | null>(null);
    const service = new CannibalizationService();

    useEffect(() => {
        if (keyword) {
            service.getVolatilityData(keyword).then(setData);
        }
    }, [keyword]);

    if (!data) return <div className="p-4 text-center text-gray-500">Select a keyword to view volatility</div>;

    return (
        <Card className="h-full border-l rounded-none shadow-none">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Rank Volatility</CardTitle>
                        <CardDescription>Last 30 Days for "{keyword}"</CardDescription>
                    </div>
                    <Badge variant={data.score > 50 ? 'destructive' : 'secondary'}>
                        Score: {data.score}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Alert Box */}
                {data.trend === 'dropping' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-start gap-3">
                        <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-red-900 dark:text-red-200">Ranking Drop Detected</h4>
                            <p className="text-xs text-red-700 dark:text-red-300">Your rank dropped 5 positions in the last 7 days.</p>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(val) => val.slice(5)} // MM-DD
                                interval={6}
                            />
                            <YAxis
                                reversed
                                domain={[1, 'auto']}
                                tick={{ fontSize: 10 }}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                labelStyle={{ color: '#666' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rank"
                                stroke={data.trend === 'dropping' ? '#ef4444' : '#22c55e'}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Actions */}
                <Button className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Content
                </Button>
            </CardContent>
        </Card>
    );
}
