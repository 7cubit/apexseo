"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ShieldAlert, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data fetcher for now, or we can implement an API route
// For MVP, let's create a simple API route to fetch claims
async function fetchClaims(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}/truth`);
    return res.json();
}

function TruthPageContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [claims, setClaims] = useState<any[]>([]);
    const [highRiskPages, setHighRiskPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;
        fetchClaims(projectId).then(data => {
            setClaims(data.claims || []);
            setHighRiskPages(data.highRiskPages || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [projectId]);

    const handleVerifyPage = async (pageId: string) => {
        setLoading(true);
        try {
            await fetch(`/api/verify/${encodeURIComponent(pageId)}`, { method: 'POST' });
            // Refresh data
            const data = await fetchClaims(projectId || '');
            setClaims(data.claims || []);
            setHighRiskPages(data.highRiskPages || []);
        } catch (error) {
            console.error("Verification failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGptFix = (claimId: string) => {
        alert("GPT Fix Simulated: Claim rephrased to match Knowledge Base.");
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Truth & Verification</h1>
                    <p className="text-muted-foreground">Automated claim extraction and risk assessment.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{claims.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Pages</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highRiskPages.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {claims.length > 0
                                ? (claims.reduce((acc, c) => acc + c.risk_score, 0) / claims.length).toFixed(2)
                                : '0.00'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>High Risk Pages</CardTitle>
                        <CardDescription>Pages with the highest concentration of risky claims.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {highRiskPages.map((page) => (
                                <div key={page.page_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div>
                                        <div className="font-medium truncate w-64">{page.page_id}</div>
                                        <div className="text-sm text-muted-foreground">{page.claim_count} claims</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={page.max_risk > 0.7 ? "destructive" : "secondary"}>
                                            Risk: {page.max_risk.toFixed(2)}
                                        </Badge>
                                        <Button size="sm" variant="outline" onClick={() => handleVerifyPage(page.page_id)}>
                                            Verify
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {highRiskPages.length === 0 && <div className="text-muted-foreground">No high risk pages found.</div>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Claims</CardTitle>
                        <CardDescription>Latest extracted claims and their verification status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {claims.slice(0, 10).map((claim) => (
                                <div key={claim.claim_id} className="space-y-2 border-b pb-4 last:border-0">
                                    <p className="text-sm italic">&quot;{claim.text}&quot;</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={claim.verification_status === 'debunked' ? "destructive" : "outline"}>
                                                {claim.verification_status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">Score: {claim.risk_score.toFixed(2)}</span>
                                        </div>
                                        {claim.risk_score > 0.5 && (
                                            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleGptFix(claim.claim_id)}>
                                                <Wand2 className="mr-1 h-3 w-3" /> GPT Fix
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {claims.length === 0 && <div className="text-muted-foreground">No claims found.</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function TruthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TruthPageContent />
        </Suspense>
    );
}
