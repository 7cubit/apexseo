import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDashboardStore } from '@/lib/stores/dashboard-store';

export const AIRecommendations: React.FC = () => {
    const { aiRecommendations } = useDashboardStore();

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top AI Recommendations</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                    <Card key={rec.id} className="p-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-[#151923] border-purple-100 dark:border-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.impact === 'high'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {rec.impact.toUpperCase()} IMPACT
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    est. {rec.cost}
                                </span>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                    <Zap className="h-3 w-3 mr-1" /> {rec.action}
                                </Button>
                            </div>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{rec.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rec.description}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};
