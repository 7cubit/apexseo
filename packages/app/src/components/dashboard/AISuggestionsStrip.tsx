import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AISuggestionsStrip: React.FC = () => {
    return (
        <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Insight</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Your organic traffic spiked by 12% after the recent content update on "SEO Tools".</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="bg-white dark:bg-transparent border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20">
                    View Details
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
