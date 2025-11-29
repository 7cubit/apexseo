"use client";

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CheckCircle2 } from 'lucide-react';

// Dynamically import charts with SSR disabled to prevent "r.nmd is not a function" error
const SiteOverviewCharts = dynamic(
    () => import('@/components/dashboard/SiteOverviewCharts'),
    {
        ssr: false,
        loading: () => (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#151923] border-gray-800/50 h-[250px] animate-pulse" />
                <Card className="bg-[#151923] border-gray-800/50 h-[250px] animate-pulse" />
            </div>
        )
    }
);

const pageAnalysisData = [
    { url: '/products/alpha-feature', similarity: 0.92, tspr: 0.85, pr: 72, clusterId: 101, risk: 88 },
    { url: '/blog/top-10-seo-tips', similarity: 0.78, tspr: 0.65, pr: 58, clusterId: 203, risk: 62 },
    { url: '/about-us/company-history', similarity: 0.65, tspr: 0.40, pr: 45, clusterId: 301, risk: 51 },
    { url: '/pricing', similarity: 0.89, tspr: 0.91, pr: 81, clusterId: 101, risk: 15 },
    { url: '/support/contact', similarity: 0.55, tspr: 0.32, pr: 33, clusterId: 404, risk: 8 },
];

const ProgressStep = ({ label, status }: any) => {
    const statusColor = status === 'completed' ? 'bg-green-500' : status === 'current' ? 'bg-blue-500' : 'bg-gray-700';

    return (
        <div className="flex-1 relative">
            <div className="flex flex-col items-center group">
                <div className={`w-3 h-3 rounded-full ${statusColor} mb-2 z-10 ring-4 ring-black`}></div>
                <span className={`text-xs font-medium ${status === 'pending' ? 'text-gray-600' : 'text-gray-300'}`}>{label}</span>
            </div>
            <div className={`absolute top-1.5 left-1/2 w-full h-0.5 -z-0 ${status === 'completed' ? 'bg-green-900' : 'bg-gray-800'}`}></div>
        </div>
    );
};

export default function SiteOverviewPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
                        <span className="mx-2">/</span>
                        <Link href="/projects/1" className="hover:text-white transition-colors">Project Alpha</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">example.com</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-bold text-white">Site Overview</h1>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">Re-analyze Site</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Export Report</Button>
                        </div>
                    </div>
                </div>

                {/* Status Banner */}
                <div className="mb-8 bg-green-900/10 border border-green-900/30 rounded-lg p-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Analysis Complete</h3>
                        <p className="text-xs text-gray-400">Workflow finished as of 12 Aug 2024, 11:34 AM</p>
                    </div>
                </div>

                {/* Workflow Progress */}
                <Card className="mb-8 bg-gray-900/30 border-dashed border-gray-800">
                    <div className="flex justify-between px-10 py-6 overflow-x-auto">
                        <ProgressStep label="Ingestion" status="completed" />
                        <ProgressStep label="Embedding" status="completed" />
                        <ProgressStep label="Clustering" status="completed" />
                        <ProgressStep label="PageRank" status="completed" />
                        <ProgressStep label="Truth Check" status="completed" />
                        <ProgressStep label="UX Sim" status="current" />
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard title="Total Pages" value="14,830" change="5.2" isPositive={true} />
                    <StatsCard title="Risk Score" value="42" change="1.5" isPositive={false} />
                    <StatsCard title="TSPR Average" value="0.68" change="0.1" isPositive={true} />
                </div>

                {/* Charts Row (Dynamically Loaded) */}
                <SiteOverviewCharts />

                {/* Page Analysis Table */}
                <Card className="bg-[#151923] border-gray-800/50">
                    <CardHeader className="border-b border-gray-800/50 px-6 py-4">
                        <CardTitle className="text-lg font-semibold text-white">Page Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-[#1A1F2B] border-b border-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">URL</th>
                                        <th className="px-6 py-4 font-medium text-right">Similarity</th>
                                        <th className="px-6 py-4 font-medium text-right">TSPR</th>
                                        <th className="px-6 py-4 font-medium text-right">PR</th>
                                        <th className="px-6 py-4 font-medium text-right">Cluster ID</th>
                                        <th className="px-6 py-4 font-medium text-right">Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {pageAnalysisData.map((page, index) => (
                                        <tr key={index} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{page.url}</td>
                                            <td className="px-6 py-4 text-gray-300 text-right">{page.similarity}</td>
                                            <td className="px-6 py-4 text-gray-300 text-right">{page.tspr}</td>
                                            <td className="px-6 py-4 text-gray-300 text-right">{page.pr}</td>
                                            <td className="px-6 py-4 text-gray-300 text-right">{page.clusterId}</td>
                                            <td className={`px-6 py-4 font-medium text-right ${page.risk > 80 ? 'text-red-500' :
                                                page.risk > 50 ? 'text-yellow-500' : 'text-green-500'
                                                }`}>
                                                {page.risk}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
