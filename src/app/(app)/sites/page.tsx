"use client";

import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Day 1', value: 30 },
    { name: 'Day 5', value: 45 },
    { name: 'Day 10', value: 35 },
    { name: 'Day 15', value: 55 },
    { name: 'Day 20', value: 48 },
    { name: 'Day 25', value: 70 },
    { name: 'Day 30', value: 65 },
    { name: 'Day 35', value: 85 },
    { name: 'Day 40', value: 75 },
];

import { StatsCard } from '@/components/dashboard/StatsCard';

const ProjectRow = ({ name, health, keywords, updated, status }: any) => (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
        <td className="px-6 py-4">
            <div className="font-medium text-white">{name}</div>
        </td>
        <td className="px-6 py-4 text-gray-300">{health}/100</td>
        <td className="px-6 py-4 text-gray-300">{keywords}</td>
        <td className="px-6 py-4 text-gray-400">{updated}</td>
        <td className="px-6 py-4">
            <Badge
                variant={
                    status === 'Completed' ? 'success' :
                        status === 'Analyzing' ? 'warning' :
                            status === 'Failed' ? 'danger' :
                                status === 'Loading' ? 'info' : 'default'
                }
                className="capitalize"
            >
                {status}
            </Badge>
        </td>
        <td className="px-6 py-4 text-right">
            <button className="text-gray-500 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
            </button>
        </td>
    </tr>
);

export default function ProjectsPage() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Sites</h1>
                    <p className="text-gray-400">An overview of all your SEO sites.</p>
                </div>
                <Link href="/sites/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Add New Site
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Active Projects" value="24" change="2" isPositive={true} />
                <StatsCard title="Keywords in Top 3" value="1,289" change="5.2" isPositive={true} />
                <StatsCard title="Overall Health Score" value="89/100" change="1.5" isPositive={false} />
                <StatsCard title="Tasks in Progress" value="3" change="10" isPositive={true} />
            </div>

            {/* Chart Section */}
            {/* <Card className="bg-[#151923] border-gray-800/50 mb-8">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Overall Keyword Visibility Trend</h3>
                            <p className="text-sm text-gray-400">Last 30 Days</p>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            76% <span className="text-sm font-medium text-green-400 ml-2">↑ +3.4%</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card> */}

            {/* Projects List */}
            <Card className="bg-[#151923] border-gray-800/50">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-gray-800/50">
                        <h3 className="text-lg font-semibold text-white">Project List</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-[#1A1F2B] border-b border-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Project Name</th>
                                    <th className="px-6 py-4 font-medium">Health Score</th>
                                    <th className="px-6 py-4 font-medium">Monitored Keywords</th>
                                    <th className="px-6 py-4 font-medium">Last Updated</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <ProjectRow
                                    name="E-commerce Platform Overhaul"
                                    health="92"
                                    keywords="5,430"
                                    updated="2 hours ago"
                                    status="Completed"
                                />
                                <ProjectRow
                                    name="SaaS Landing Page SEO"
                                    health="78"
                                    keywords="1,250"
                                    updated="1 day ago"
                                    status="Analyzing"
                                />
                                <ProjectRow
                                    name="Mobile App Store Optimization"
                                    health="N/A"
                                    keywords="800"
                                    updated="3 days ago"
                                    status="Failed"
                                />
                                <ProjectRow
                                    name="Blog Content Strategy"
                                    health="85"
                                    keywords="2,100"
                                    updated="5 days ago"
                                    status="Idle"
                                />
                                <ProjectRow
                                    name="Local SEO for Retail Stores"
                                    health="--/--"
                                    keywords="350"
                                    updated="1 minute ago"
                                    status="Loading"
                                />
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
