import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useTheme } from '@/components/theme-provider';

const performanceData = [
    { date: 'Mon', traffic: 4000, position: 15.2, event: 'New post published' },
    { date: 'Tue', traffic: 3000, position: 15.0 },
    { date: 'Wed', traffic: 2000, position: 14.8 },
    { date: 'Thu', traffic: 2780, position: 14.5, event: 'Big internal link update' },
    { date: 'Fri', traffic: 1890, position: 14.2 },
    { date: 'Sat', traffic: 2390, position: 14.1 },
    { date: 'Sun', traffic: 3490, position: 14.0 },
];

const keywordData = [
    { name: 'Week 1', up: 40, down: 24, new: 24, lost: 5 },
    { name: 'Week 2', up: 30, down: 13, new: 22, lost: 3 },
    { name: 'Week 3', up: 20, down: 58, new: 22, lost: 1 },
    { name: 'Week 4', up: 27, down: 39, new: 20, lost: 2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-xl">
                <p className="font-medium text-gray-900 dark:text-gray-200 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
                {dataPoint.event && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">Event:</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{dataPoint.event}</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const PerformanceCharts: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Organic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2D3748" : "#E2E8F0"} vertical={false} />
                                <XAxis dataKey="date" stroke={isDark ? "#718096" : "#A0AEC0"} tick={{ fill: isDark ? "#A0AEC0" : "#718096" }} />
                                <YAxis yAxisId="left" stroke={isDark ? "#718096" : "#A0AEC0"} tick={{ fill: isDark ? "#A0AEC0" : "#718096" }} />
                                <YAxis yAxisId="right" orientation="right" stroke={isDark ? "#718096" : "#A0AEC0"} tick={{ fill: isDark ? "#A0AEC0" : "#718096" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="traffic" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: "#3B82F6" }} activeDot={{ r: 6 }} name="Traffic" />
                                <Line yAxisId="right" type="monotone" dataKey="position" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: "#10B981" }} name="Avg. Pos" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-none">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Keyword Movements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywordData} onClick={(data) => console.log('Chart clicked', data)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2D3748" : "#E2E8F0"} vertical={false} />
                                <XAxis dataKey="name" stroke={isDark ? "#718096" : "#A0AEC0"} tick={{ fill: isDark ? "#A0AEC0" : "#718096" }} />
                                <YAxis stroke={isDark ? "#718096" : "#A0AEC0"} tick={{ fill: isDark ? "#A0AEC0" : "#718096" }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF', borderColor: isDark ? '#2D3748' : '#E2E8F0', color: isDark ? '#F7FAFC' : '#1A202C' }}
                                    itemStyle={{ color: isDark ? '#F7FAFC' : '#1A202C' }}
                                />
                                <Legend />
                                <Bar dataKey="up" stackId="a" fill="#10B981" name="Improved" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="down" stackId="a" fill="#EF4444" name="Declined" />
                                <Bar dataKey="new" stackId="a" fill="#3B82F6" name="New" />
                                <Bar dataKey="lost" stackId="a" fill="#6B7280" name="Lost" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
