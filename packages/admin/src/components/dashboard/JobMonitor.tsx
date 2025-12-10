"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, CheckCircle, XCircle } from "lucide-react";

// Mock data for now as we don't have a direct Temporal API proxy yet
// In real implementation, this would fetch from GET /admin/system/jobs
const mockJobs = [
    { id: '1', name: 'PostSignupDrip', status: 'RUNNING', startedAt: '2 mins ago' },
    { id: '2', name: 'ChurnPrevention', status: 'COMPLETED', startedAt: '1 hour ago' },
    { id: '3', name: 'DailyReport', status: 'FAILED', startedAt: '5 hours ago' },
    { id: '4', name: 'StripeSync', status: 'COMPLETED', startedAt: '1 day ago' },
];

export function JobMonitorWidget() {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RUNNING': return <PlayCircle className="h-4 w-4 text-blue-500" />;
            case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Background Jobs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockJobs.map(job => (
                        <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(job.status)}
                                <div>
                                    <div className="font-medium text-sm">{job.name}</div>
                                    <div className="text-xs text-muted-foreground">{job.startedAt}</div>
                                </div>
                            </div>
                            <Badge variant="outline">{job.status}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
