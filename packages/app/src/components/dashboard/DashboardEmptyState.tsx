import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export const DashboardEmptyState: React.FC = () => {
    return (
        <div className="max-w-[1000px] mx-auto py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to ApexSEO</h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                Your project is set up, but we need some data to generate insights.
                Follow these steps to get your dashboard running.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#151923] border-gray-800/50 hover:border-blue-500/50 transition-colors group cursor-pointer">
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <Search className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Connect Search Console</h3>
                        <p className="text-sm text-gray-500 mb-6">Import your performance data to see traffic and keyword rankings.</p>
                        <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                            Connect
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-[#151923] border-gray-800/50 hover:border-green-500/50 transition-colors group cursor-pointer">
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                            <ShieldCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Run Site Audit</h3>
                        <p className="text-sm text-gray-500 mb-6">Crawl your site to find technical issues and optimization opportunities.</p>
                        <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                            Start Crawl
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-[#151923] border-gray-800/50 hover:border-purple-500/50 transition-colors group cursor-pointer">
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                            <FileText className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Generate Content Brief</h3>
                        <p className="text-sm text-gray-500 mb-6">Use AI to create a data-driven content strategy for your first topic.</p>
                        <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                            Create Brief
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
