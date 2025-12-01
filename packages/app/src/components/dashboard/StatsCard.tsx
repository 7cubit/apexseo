import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string | number;
    isPositive?: boolean;
    suffix?: string;
    subtext?: string;
    icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive, suffix = '', subtext, icon }) => (
    <Card className="bg-[#151923] border-gray-800/50">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                {icon && <div className="p-2 bg-gray-800/50 rounded-lg">{icon}</div>}
            </div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            {change !== undefined && (
                <div className={`text-xs font-medium flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '↑' : '↓'} {change}%
                    {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
                </div>
            )}
            {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
        </CardContent>
    </Card>
);
