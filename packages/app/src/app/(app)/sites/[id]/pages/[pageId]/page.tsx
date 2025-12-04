import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PageDetailPage() {
    return (

        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link href="/sites/1" className="hover:text-white">shop.example.com</Link>
                    <span>/</span>
                    <span className="text-white">Page Details</span>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-white truncate max-w-3xl">Running Shoes for Men - Pro Series</h1>
                        <a href="#" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1">
                            https://shop.example.com/products/pro-runner-shoe
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline">Re-crawl Page</Button>
                        <Button>View on Site</Button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <div className="text-sm text-gray-400 mb-1">PageRank</div>
                    <div className="text-2xl font-bold text-white">4.8</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-400 mb-1">TSPR (Running)</div>
                    <div className="text-2xl font-bold text-white">8.2</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-400 mb-1">Cluster</div>
                    <div className="text-lg font-medium text-white truncate">Running Gear</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-400 mb-1">Word Count</div>
                    <div className="text-2xl font-bold text-white">1,250</div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 mb-6">
                <nav className="flex gap-6">
                    <button className="pb-4 border-b-2 border-blue-500 text-blue-400 font-medium text-sm">Overview</button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium text-sm transition-colors">Links</button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium text-sm transition-colors">Truth & Risk</button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium text-sm transition-colors">UX Insights</button>
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incoming Links (Backlinks)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                                    <span className="text-white text-sm">/blog/top-10-running-shoes</span>
                                    <Badge variant="success">High Value</Badge>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                                    <span className="text-white text-sm">/collections/mens-footwear</span>
                                    <Badge variant="default">Navigation</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white text-sm">/home</span>
                                    <Badge variant="default">Navigation</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Suggested Internal Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                                    <div>
                                        <div className="text-sm font-medium text-blue-400">Link from: /guide/marathon-training</div>
                                        <div className="text-xs text-gray-400 mt-1">Relevance: 92% • Boosts TSPR</div>
                                    </div>
                                    <Button size="sm" variant="outline">Apply</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Health Check</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Status Code</span>
                                <Badge variant="success">200 OK</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Load Time</span>
                                <span className="text-sm text-white">0.8s</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Indexable</span>
                                <Badge variant="success">Yes</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Orphaned</span>
                                <Badge variant="success">No</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl font-bold text-white">12<span className="text-sm text-gray-500 font-normal">/100</span></div>
                                <Badge variant="success">Low Risk</Badge>
                            </div>
                            <p className="text-xs text-gray-400">
                                No significant false claims detected. Product specs match manufacturer data.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

    );
}
