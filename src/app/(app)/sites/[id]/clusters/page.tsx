import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ClusterRow = ({ label, size, tspr, similarity, orphans }: any) => (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4">
            <Link href="/sites/1/clusters/1" className="text-white font-medium hover:text-blue-400">
                {label}
            </Link>
        </td>
        <td className="px-6 py-4 text-gray-400">{size}</td>
        <td className="px-6 py-4 text-gray-400">{tspr}</td>
        <td className="px-6 py-4 text-gray-400">{similarity}%</td>
        <td className="px-6 py-4">
            {orphans > 0 ? (
                <Badge variant="warning">{orphans} orphans</Badge>
            ) : (
                <span className="text-gray-600">-</span>
            )}
        </td>
        <td className="px-6 py-4 text-right">
            <Button variant="ghost" size="sm">View</Button>
        </td>
    </tr>
);

export default function ClusterExplorerPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link href="/sites/1" className="hover:text-white">shop.example.com</Link>
                    <span>/</span>
                    <span className="text-white">Clusters</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Cluster Explorer</h1>
                <p className="text-gray-400 mt-1">Analyze semantic groupings and topic authority</p>
            </div>

            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3">Cluster Label</th>
                                <th className="px-6 py-3">Pages</th>
                                <th className="px-6 py-3">Avg TSPR</th>
                                <th className="px-6 py-3">Cohesion</th>
                                <th className="px-6 py-3">Issues</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ClusterRow label="Men's Footwear" size={45} tspr="4.8" similarity={92} orphans={0} />
                            <ClusterRow label="Running Gear" size={28} tspr="3.5" similarity={88} orphans={2} />
                            <ClusterRow label="Winter Collection" size={12} tspr="1.2" similarity={75} orphans={5} />
                            <ClusterRow label="Customer Support" size={8} tspr="0.5" similarity={60} orphans={0} />
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
