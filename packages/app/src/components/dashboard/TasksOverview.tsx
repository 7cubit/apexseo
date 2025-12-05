import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, CheckCircle2, Plus, Sparkles } from 'lucide-react';

import { useDashboardStore } from '@/lib/stores/dashboard-store';

export const TasksOverview: React.FC = () => {
    const { tasks } = useDashboardStore();

    return (
        <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">Tasks & Automation</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Content
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#1A1F2B] border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'running' ? 'bg-blue-500/20 text-blue-500' :
                                    task.status === 'queued' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-green-500/20 text-green-500'
                                    }`}>
                                    {task.status === 'running' ? <Play className="w-4 h-4" /> :
                                        task.status === 'queued' ? <Clock className="w-4 h-4" /> :
                                            <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">{task.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {task.status === 'running' ? `In Progress (${task.progress}%)` :
                                            task.status === 'queued' ? `Queued · ${task.nextRun}` :
                                                `Completed · ${task.lastRun}`}
                                    </div>
                                </div>
                            </div>
                            {task.status === 'running' && (
                                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">45</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Failed</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
