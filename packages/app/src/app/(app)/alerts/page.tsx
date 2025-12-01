"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';

interface Alert {
    site_id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: string;
    status: 'new' | 'acknowledged' | 'resolved';
    created_at: string;
}

export default function AlertsPage() {
    const [siteId, setSiteId] = React.useState('example.com'); // TODO: Get from context/props
    const { data, error, isLoading } = useSWR(
        siteId ? `/agents/alerts?siteId=${siteId}` : null,
        fetcher
    );

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
            default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, any> = {
            critical: 'destructive',
            high: 'destructive',
            medium: 'default',
            low: 'secondary'
        };
        return <Badge variant={variants[severity] || 'secondary'}>{severity}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            new: 'default',
            acknowledged: 'secondary',
            resolved: 'outline'
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    if (isLoading) return <div className="p-8 text-center">Loading alerts...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load alerts</div>;

    const alerts: Alert[] = data?.alerts || [];

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
                <p className="text-muted-foreground">Monitor system alerts and notifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No alerts found. Your site is healthy!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="flex items-center gap-2">
                                            {getSeverityIcon(alert.severity)}
                                            <span className="font-medium">{alert.type}</span>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                        <TableCell>{getStatusBadge(alert.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(alert.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {alert.status === 'new' && (
                                                <Button size="sm" variant="outline">
                                                    Acknowledge
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
