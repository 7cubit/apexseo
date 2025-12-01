"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react';

function AnalysisPageContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('idle');
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const steps = [
        { key: 'ingest', label: 'Crawl & Ingest' },
        { key: 'analyze', label: 'Embeddings & Clusters' },
        { key: 'pagerank', label: 'PageRank & TSPR' },
        { key: 'links', label: 'Link Recommendations' },
        { key: 'orphans', label: 'Orphan Detection' },
    ];

    const startAnalysis = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/analyze`, {
                method: 'POST',
                body: JSON.stringify({ url: `https://${projectId}` }), // Simplified
            });
            const data = await res.json();
            if (data.workflowId) {
                setWorkflowId(data.workflowId);
                setStatus('starting');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!workflowId || status === 'completed' || status === 'failed') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/analyze?workflowId=${workflowId}`);
                const data = await res.json();
                if (data.status) {
                    setStatus(data.status);
                    setSummary(data.summary || {});
                }
            } catch (e) {
                console.error(e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [workflowId, projectId, status]);

    const getStepStatus = (stepKey: string) => {
        if (!summary.steps) return 'pending';
        return summary.steps[stepKey] || 'pending';
    };

    const getProgress = () => {
        if (!summary.steps) return 0;
        const completed = Object.values(summary.steps).filter(s => s === 'completed').length;
        return (completed / steps.length) * 100;
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Site Analysis</h1>
                <Button onClick={startAnalysis} disabled={loading || (status !== 'idle' && status !== 'completed' && status !== 'failed')}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Start Analysis
                </Button>
            </div>

            {workflowId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Analysis Progress</span>
                            <Badge variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
                                {status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Progress value={getProgress()} className="h-2" />

                        <div className="grid gap-4">
                            {steps.map((step) => {
                                const stepStatus = getStepStatus(step.key);
                                return (
                                    <div key={step.key} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {stepStatus === 'completed' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : stepStatus === 'running' ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                                            )}
                                            <span className={stepStatus === 'pending' ? 'text-gray-400' : 'font-medium'}>
                                                {step.label}
                                            </span>
                                        </div>
                                        <Badge variant="outline">{stepStatus}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalysisPageContent />
        </Suspense>
    );
}
