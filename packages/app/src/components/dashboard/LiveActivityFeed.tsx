import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Globe, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'crawl' | 'rank' | 'alert' | 'success';
    message: string;
    time: string;
}

const initialActivities: ActivityItem[] = [
    { id: '1', type: 'crawl', message: 'Crawling page 45/100: /blog/seo-tips', time: 'Just now' },
    { id: '2', type: 'rank', message: 'Keyword "best seo tools" moved up 3 positions', time: '2 mins ago' },
    { id: '3', type: 'alert', message: 'High latency detected on /pricing', time: '15 mins ago' },
    { id: '4', type: 'success', message: 'Weekly audit completed successfully', time: '1 hour ago' },
];

export const LiveActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            const newActivity: ActivityItem = {
                id: Date.now().toString(),
                type: Math.random() > 0.7 ? 'crawl' : Math.random() > 0.5 ? 'rank' : 'success',
                message: `Processing new data point: ${Math.floor(Math.random() * 1000)}`,
                time: 'Just now'
            };
            setActivities(prev => [newActivity, ...prev].slice(0, 5));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'crawl': return <Globe className="w-4 h-4 text-blue-500" />;
            case 'rank': return <Search className="w-4 h-4 text-green-500" />;
            case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Live System Pulse
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
                            <div className="mt-0.5 bg-gray-50 dark:bg-[#1A1F2B] p-1.5 rounded-md border border-gray-100 dark:border-gray-800">
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-900 dark:text-gray-200 font-medium leading-none mb-1">{item.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
