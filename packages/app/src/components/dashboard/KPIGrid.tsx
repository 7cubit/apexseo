import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, Activity, Target, Eye, FileText, ShieldCheck, Link as LinkIcon, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useDashboardStore } from '@/lib/stores/dashboard-store';

export const KPIGrid: React.FC = () => {
    const router = useRouter();
    const { kpis } = useDashboardStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {kpis.map((kpi, index) => (
                <Card
                    key={index}
                    className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 hover:border-blue-500/50 transition-all cursor-pointer group shadow-sm dark:shadow-none"
                    onClick={() => router.push(kpi.link)}
                >
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${kpi.bg}`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center text-xs font-medium ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {kpi.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : kpi.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                                {kpi.change}
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{kpi.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{kpi.label}</div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">{kpi.sub}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
