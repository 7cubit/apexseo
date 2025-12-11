
'use client';

import React, { useEffect, useState } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@apexseo/ui';

interface SankeyNode {
    name: string;
}

interface SankeyLink {
    source: number;
    target: number;
    value: number;
}

interface FinancialFlowData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

export function FinancialFlowChart() {
    const [data, setData] = useState<FinancialFlowData | null>(null);
    const [loading, setLoading] = useState(true);

    const MOCK_DATA: FinancialFlowData = {
        nodes: [
            // Sources (Layer 0)
            { name: 'AppSumo LTD' },        // 0
            { name: 'FB/Insta Ads (LTD)' }, // 1
            { name: 'Google Ads (LTD)' },   // 2
            { name: 'Monthly Subs' },       // 3

            // Deductions/Expenses (Layer 1)
            { name: 'Platform Commisions' },// 4 (AppSumo)
            { name: 'Ad Spend' },           // 5
            { name: 'Processing Fees' },    // 6 (Stripe)
            { name: 'Net Revenue' },        // 7

            // Operational Expenses (Layer 2)
            { name: 'Infrastructure' },     // 8
            { name: 'API Costs' },          // 9
            { name: 'Salaries/Ops' },       // 10

            // Result (Layer 3)
            { name: 'Net Profit' },         // 11
        ],
        links: [
            // AppSumo Flow: High volume, high commission
            { source: 0, target: 4, value: 35000 }, // 70% Commision
            { source: 0, target: 7, value: 15000 }, // 30% Net

            // FB/Insta Flow: Ad spend deduction
            { source: 1, target: 5, value: 8000 },  // Ad Spend
            { source: 1, target: 6, value: 600 },   // Stripe Fees
            { source: 1, target: 7, value: 11400 }, // Net

            // Google Ads Flow
            { source: 2, target: 5, value: 4000 },  // Ad Spend
            { source: 2, target: 6, value: 300 },   // Stripe Fees
            { source: 2, target: 7, value: 5700 },  // Net

            // Monthly Subs: Low cost, high margin
            { source: 3, target: 6, value: 400 },   // Stripe Fees
            { source: 3, target: 7, value: 9600 },  // Net

            // Net Revenue Flow -> Expenses & Profit
            { source: 7, target: 8, value: 2500 },  // Infrastructure
            { source: 7, target: 9, value: 4500 },  // API Costs (OpenAI, etc)
            { source: 7, target: 10, value: 15000 },// Salaries
            { source: 7, target: 11, value: 19700 },// Profit
        ]
    };

    useEffect(() => {
        // Use mock data locally for now to ensure chart renders
        setData(MOCK_DATA);
        setLoading(false);
    }, []);

    if (loading) return <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading financial data...</div>;
    if (!data) return <div className="h-[400px] flex items-center justify-center text-muted-foreground">Unable to load data.</div>;

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-7 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
            <CardHeader>
                <CardTitle>Financial Flow</CardTitle>
                <CardDescription>Visualizing revenue distribution across infrastructure, APIs, and net profit.</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] relative">
                <div className="absolute top-0 left-0 bg-white/80 p-2 text-xs z-50 pointer-events-none border border-red-500 text-red-600">
                    DEBUG: Nodes {data?.nodes.length}, Links {data?.links.length}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={data}
                        nodePadding={50}
                        margin={{ left: 20, right: 200, top: 20, bottom: 20 }}
                        link={{ stroke: '#77c878', strokeOpacity: 0.3 }}
                    >
                        <Tooltip />
                    </Sankey>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
