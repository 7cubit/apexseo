"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useProject } from '@/hooks/useProject';

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

export default function DashboardPage() {
    const { projects, isLoading, error } = useProject();

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
                    <p className="text-gray-400">An overview of all your SEO projects.</p>
                </div>
                <Link href="/sites/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Add New Project
                    </Button>
                </Link>
            </div>

            {/* Stats Grid - Placeholder for now until we have aggregated stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Active Projects" value={projects?.length?.toString() || "0"} change="0" isPositive={true} />
                <StatsCard title="Keywords in Top 3" value="0" change="0" isPositive={true} />
                <StatsCard title="Overall Health Score" value="0/100" change="0" isPositive={false} />
                <StatsCard title="Tasks in Progress" value="0" change="0" isPositive={true} />
            </div>

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
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading projects...</td></tr>
                                ) : projects?.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No projects found. Create one to get started.</td></tr>
                                ) : (
                                    projects?.map((project: any) => (
                                        <ProjectRow
                                            key={project.id}
                                            name={project.name}
                                            health={project.health || "N/A"}
                                            keywords={project.keywords || "0"}
                                            updated={project.updated || "Just now"}
                                            status={project.status || "Active"}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
