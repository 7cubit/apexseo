'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, Smartphone } from 'lucide-react';

export default function SiteAuditPage() {
    const [url, setUrl] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<any>(null);

    const handleAudit = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const res = await fetch('/api/audit/onpage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Site Audit</h1>
                <p className="text-gray-500 dark:text-gray-400">Comprehensive technical SEO and performance auditing.</p>
            </div>

            <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle>Run New Audit</CardTitle>
                    <CardDescription>Analyze a specific URL or an entire domain.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter URL (e.g. 'https://example.com')"
                                className="bg-gray-50 dark:bg-[#0B0E14]"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleAudit}
                            disabled={loading}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            {loading ? 'Auditing...' : 'Start Audit'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle>Audit Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Lighthouse Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Core Web Vitals, Performance, Accessibility, and Best Practices scores.</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-purple-500" />
                            Mobile Usability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Check for mobile-friendliness and responsive design issues.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
