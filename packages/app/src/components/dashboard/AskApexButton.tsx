import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AskApexButton: React.FC = () => {
    return (
        <div className="fixed bottom-8 right-8 z-50 group">
            <div className="absolute bottom-full right-0 mb-4 w-64 bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Ask Apex AI</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need help analyzing this data? I can explain trends or suggest next steps.
                </p>
            </div>
            <Button className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
                <MessageSquare className="w-6 h-6 text-white" />
            </Button>
        </div>
    );
};
