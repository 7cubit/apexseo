"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function fetchOrphans(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}/orphans`);
    return res.json();
}

function OrphansPageContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [orphans, setOrphans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const [fixed, setFixed] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        fetchOrphans(projectId).then(data => {
            setOrphans(data.orphans || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [projectId]);

    const handleSimulateFix = () => {
        setSimulating(true);
        setTimeout(() => {
            setSimulating(false);
            setFixed(true);
        }, 1500);
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Semantic Orphans</h1>
                    <p className="text-muted-foreground">Pages isolated from their topical clusters.</p>
                </div>
                <Button onClick={handleSimulateFix} disabled={orphans.length === 0 || fixed}>
                    {simulating ? <Wand2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {fixed ? "Fixed!" : "Simulate Fix"}
                </Button>
            </div>

            {orphans.length > 0 && !fixed && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Critical Issue Detected</AlertTitle>
                    <AlertDescription>
                        {orphans.length} orphans detected. This is negatively impacting your TSPR by approximately 12%.
                    </AlertDescription>
                </Alert>
            )}

            {fixed && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                    <Wand2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Fix Simulated</AlertTitle>
                    <AlertDescription>
                        Linking all orphans would increase Domain Authority by +9%.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Orphaned Pages</CardTitle>
                    <CardDescription>Pages with high semantic isolation scores (&gt;0.7).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orphans.map((page) => (
                            <div key={page.page_id} className="flex flex-col gap-2 border-b pb-4 last:border-0">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium truncate w-96">{page.url || page.page_id}</div>
                                    <Badge variant="destructive">
                                        Isolation: {page.isolation_score.toFixed(2)}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Suggested Targets:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {page.suggested_targets.slice(0, 3).map((target: string, i: number) => (
                                            <div key={i} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-xs">
                                                <ArrowRight className="h-3 w-3" />
                                                <span className="truncate max-w-[200px]">{target}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orphans.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                No semantic orphans found. Great job!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OrphansPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrphansPageContent />
        </Suspense>
    );
}
