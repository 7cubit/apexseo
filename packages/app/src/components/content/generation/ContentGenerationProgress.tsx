import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ContentGenerationProgressProps {
    progress: number;
    progressStep: string;
}

export function ContentGenerationProgress({ progress, progressStep }: ContentGenerationProgressProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-12 space-y-8 text-center bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse" />
                <div className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/50">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                </div>
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Crafting Your Masterpiece
                </h2>
                <p className="text-muted-foreground">{progressStep}</p>
            </div>

            <div className="w-full max-w-md space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Started</span>
                    <span>{progress}%</span>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 w-full max-w-lg mt-8">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`h-1 rounded-full transition-colors ${progress >= (s * 20) ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-800'
                        }`} />
                ))}
            </div>
        </div>
    );
}
