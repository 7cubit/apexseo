"use client";

import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AgentStatusPage() {
    const { data: status } = useSWR('/api/agents/status', fetcher);
    const { data: activity } = useSWR('/api/agents/activity', fetcher);

    if (!status) return <div>Loading status...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Status</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <StatusCard
                    title="Site Doctor"
                    status={status.siteDoctor.status}
                    lastRun={status.siteDoctor.lastRun}
                    nextRun={status.siteDoctor.nextRun}
                />
                <StatusCard
                    title="Rank Tracker"
                    status={status.rankTracker.status}
                    lastRun={status.rankTracker.lastRun}
                    nextRun={status.rankTracker.nextRun}
                />
                <StatusCard
                    title="Cannibalization Detector"
                    status={status.cannibalizationDetector.status}
                    lastRun={status.cannibalizationDetector.lastRun}
                    message={status.cannibalizationDetector.message}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activity?.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.job}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.duration}</TableCell>
                                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StatusCard({ title, status, lastRun, nextRun, message }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {status === 'healthy' || status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold capitalize">{status}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    Last run: {new Date(lastRun).toLocaleString()}
                </p>
                {nextRun && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Next: {new Date(nextRun).toLocaleString()}
                    </p>
                )}
                {message && (
                    <p className="text-xs text-yellow-600 mt-2">{message}</p>
                )}
            </CardContent>
        </Card>
    );
}
