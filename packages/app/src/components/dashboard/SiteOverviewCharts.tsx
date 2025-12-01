"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    AreaChart, Area, ResponsiveContainer, Tooltip, Treemap
} from 'recharts';

// Mock data for charts
const topicalStrengthData = [
    { name: 'Day 1', value: 0.4 },
    { name: 'Day 5', value: 0.55 },
    { name: 'Day 10', value: 0.5 },
    { name: 'Day 15', value: 0.65 },
    { name: 'Day 20', value: 0.6 },
    { name: 'Day 25', value: 0.75 },
    { name: 'Day 30', value: 0.79 },
];

const clusterData = [
    { name: 'Main Product Pages', size: 400, fill: '#1d4ed8' }, // blue-700
    { name: 'Blog', size: 200, fill: '#1e40af' }, // blue-800
    { name: 'About Us', size: 150, fill: '#1e3a8a' }, // blue-900
    { name: 'Support & FAQ', size: 300, fill: '#172554' }, // blue-950
];

const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name } = props;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: props.fill,
                    stroke: '#0B0E14',
                    strokeWidth: 2,
                }}
            />
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    dominantBaseline="middle"
                >
                    {name}
                </text>
            )}
        </g>
    );
};

export default function SiteOverviewCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Topical Strength Chart */}
            <Card className="bg-[#151923] border-gray-800/50">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300">Topical Strength Over Time</h3>
                        <div className="text-3xl font-bold text-white mt-1">0.79</div>
                        <div className="text-xs text-green-400 mt-1">Last 30 Days +2.1%</div>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={topicalStrengthData}>
                                <defs>
                                    <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorStrength)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Cluster Treemap */}
            <Card className="bg-[#151923] border-gray-800/50">
                <CardContent className="p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-white">Topic Clusters (Treemap)</h3>
                        <p className="text-xs text-gray-400 mt-1">Size represents page count, color represents TSPR</p>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={clusterData}
                                dataKey="size"
                                stroke="#fff"
                                fill="#8884d8"
                                content={<CustomTreemapContent />}
                            />
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
