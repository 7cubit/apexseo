"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, MousePointer2, AlertCircle, Activity } from 'lucide-react';

async function fetchUxData(projectId: string) {
    const res = await fetch(`/api/ux/${projectId}`);
    return res.json();
}

function UxPageContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [metrics, setMetrics] = useState({ successRate: 0, avgClicks: 0, frictionScore: 0 });
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState<string | null>(null);

    const loadData = () => {
        if (!projectId) return;
        fetchUxData(projectId).then(data => {
            setMetrics(data.metrics || { successRate: 0, avgClicks: 0, frictionScore: 0 });
            setSessions(data.sessions || []);
            setLoading(false);
        }).catch(console.error);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

    const startSimulation = async (persona: string, goal: string) => {
        if (!projectId) return;
        setSimulating(persona);
        try {
            await fetch(`/api/ux/${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ persona, goal, startUrl: 'home' })
            });
            // Don't wait for completion, just trigger
        } catch (error) {
            console.error("Failed to start sim:", error);
        } finally {
            setTimeout(() => setSimulating(null), 1000); // Reset button state
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">UX Simulation</h1>
                    <p className="text-muted-foreground">AI Persona testing and user journey analysis.</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.successRate}%</div>
                        <p className="text-xs text-muted-foreground">Goal completion across all personas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Clicks to Goal</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.avgClicks}</div>
                        <p className="text-xs text-muted-foreground">Steps taken to reach success</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Friction Score</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.frictionScore}</div>
                        <p className="text-xs text-muted-foreground">Based on drop-offs and retries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Simulation Controls */}
            <div className="grid gap-8 md:grid-cols-3">
                <Card className="col-span-1 border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Buyer Persona</CardTitle>
                        <CardDescription>Goal: Find pricing and checkout.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            onClick={() => startSimulation('Buyer', 'Find pricing and buy')}
                            disabled={!!simulating}
                        >
                            {simulating === 'Buyer' ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Simulate Buyer</>}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-l-4 border-l-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Researcher Persona</CardTitle>
                        <CardDescription>Goal: Find documentation/specs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="secondary"
                            onClick={() => startSimulation('Researcher', 'Find technical documentation')}
                            disabled={!!simulating}
                        >
                            {simulating === 'Researcher' ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Simulate Researcher</>}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Bouncer Persona</CardTitle>
                        <CardDescription>Goal: Quick info check (high bounce risk).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => startSimulation('Bouncer', 'Find contact info quickly')}
                            disabled={!!simulating}
                        >
                            {simulating === 'Bouncer' ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Simulate Bouncer</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Real-time log of AI persona journeys.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.session_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {session.persona}
                                        <Badge variant="outline" className="text-xs">{session.goal}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Duration: {session.duration.toFixed(1)}s
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={session.status === 'completed' ? 'default' : (session.status === 'failed' ? 'destructive' : 'secondary')}>
                                        {session.status}
                                    </Badge>
                                    {session.success_score > 0.8 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                </div>
                            </div>
                        ))}
                        {sessions.length === 0 && <div className="text-muted-foreground text-center py-8">No sessions recorded yet. Start a simulation!</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { CheckCircle } from 'lucide-react';

export default function UxPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UxPageContent />
        </Suspense>
    );
}
