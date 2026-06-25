'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const RevenueWidget = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['billingStats'],
        queryFn: async () => {
            const res = await api.get('/admin/billing/stats');
            return res.data as { mrr: string; activeSubscribers: number; churnRate: string };
        }
    });

    if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded"></div>;
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-gray-500 text-sm font-medium">Monthly Recurring Revenue</h4>
                <div className="text-2xl font-bold mt-2">${stats.mrr}</div>
                <div className="text-xs text-green-600 mt-1">+0% vs last month</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-gray-500 text-sm font-medium">Active Subscribers</h4>
                <div className="text-2xl font-bold mt-2">{stats.activeSubscribers}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="text-gray-500 text-sm font-medium">Churn Rate</h4>
                <div className="text-2xl font-bold mt-2">{stats.churnRate}%</div>
            </div>

            {/* 
            <div className="col-span-3 bg-white p-6 rounded-lg shadow-sm border h-64">
                <h4 className="text-gray-500 text-sm font-medium mb-4">Revenue Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
            </div> 
            */}
        </div>
    );
};
