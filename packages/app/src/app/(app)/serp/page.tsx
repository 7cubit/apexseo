'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Activity } from 'lucide-react';

export default function SerpAnalysisPage() {
    const [keyword, setKeyword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<any>(null);

    const handleSearch = async () => {
        if (!keyword) return;
        setLoading(true);
        try {
            const res = await fetch('/api/research/serp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            });
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">SERP Analysis</h1>
                <p className="text-gray-500 dark:text-gray-400">Analyze Google Search Results Pages in real-time.</p>
            </div>

            <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle>Live SERP Check</CardTitle>
                    <CardDescription>Get top 100 results for any keyword.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter keyword (e.g. 'best seo tools')"
                                className="bg-gray-50 dark:bg-[#0B0E14]"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            <Search className="w-4 h-4 mr-2" />
                            {loading ? 'Analyzing...' : 'Analyze SERP'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {results && (
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle>Results for "{keyword}"</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {results.tasks?.[0]?.result?.[0]?.items?.map((item: any, i: number) => (
                                    <div key={i} className="p-4 border rounded-lg border-gray-200 dark:border-gray-800">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-blue-600">#{item.rank_group}</span>
                                            <span className="text-xs text-gray-500">{item.type}</span>
                                        </div>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:underline text-gray-900 dark:text-white block mt-1">
                                            {item.title}
                                        </a>
                                        <div className="text-sm text-green-600 truncate">{item.url}</div>
                                        <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Organic Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Deep dive into organic rankings, snippets, and SERP features.</p>
                        </CardContent>
                    </Card>
                    {/* Add more cards for Maps, News, etc. */}
                </div>
            )}
        </div>
    );
}
