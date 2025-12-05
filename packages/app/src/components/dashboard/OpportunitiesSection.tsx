
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle, CheckCircle2, FileText, Sparkles, Link as LinkIcon } from 'lucide-react';
import { AISuggestionsStrip } from './AISuggestionsStrip';

export const OpportunitiesSection: React.FC = () => {
    const opportunities = [
        { page: '/blog/seo-tips-2024', metric: 'Low CTR (1.2%)', impact: 'High', impactScore: 92, type: 'content' },
        { page: '/services/web-design', metric: 'Missing Keywords', impact: 'Medium', impactScore: 65, type: 'content' },
        { page: '/pricing', metric: 'Orphaned Page', impact: 'High', impactScore: 88, type: 'technical' },
        { page: '/about-us', metric: 'Slow Load Time', impact: 'Low', impactScore: 34, type: 'technical' },
    ];

    const getPriorityColor = (score: number) => {
        if (score >= 80) return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (score >= 50) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    const getPriorityLabel = (score: number) => {
        if (score >= 80) return 'High';
        if (score >= 50) return 'Medium';
        return 'Low';
    };

    return (
        <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-gray-900 dark:text-white">Top Opportunities</CardTitle>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/20">
                        {opportunities.length} New
                    </span>
                </div>
                <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Suggestions
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Page</th>
                                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Issue</th>
                                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Priority</th>
                                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {opportunities.map((opp, index) => (
                                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="py-4 text-sm text-gray-900 dark:text-gray-300 font-medium">{opp.page}</td>
                                    <td className="py-4 text-sm text-gray-500 dark:text-gray-400">{opp.metric}</td>
                                    <td className="py-4">
                                        <span className={`inline - flex items - center px - 2 py - 1 rounded - md text - xs font - medium border ${getPriorityColor(opp.impactScore)} `}>
                                            {getPriorityLabel(opp.impactScore)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {opp.type === 'content' ? (
                                                <>
                                                    <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Optimize Content">
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 px-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10" title="AI Rewrite">
                                                        <Sparkles className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10" title="Fix Internal Links">
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                                    Fix Issue
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-purple-500" title="View AI Logs">
                                                    <FileText className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
                    <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                        View all opportunities
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
