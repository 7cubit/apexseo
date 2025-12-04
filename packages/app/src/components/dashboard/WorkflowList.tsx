import { Card, CardContent, CardHeader, CardTitle } from '@apexseo/ui';
import { Button } from '@apexseo/ui';
import { Play, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Workflow {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'terminated';
    startTime: string;
    endTime?: string;
}

interface WorkflowListProps {
    workflows: Workflow[];
    onTrigger: (workflowName: string) => void;
}

export function WorkflowList({ workflows, onTrigger }: WorkflowListProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <RotateCw className="h-4 w-4 animate-spin text-blue-500" />;
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Active Workflows</h3>
                <div className="space-x-2">
                    <Button size="sm" onClick={() => onTrigger('SiteAudit')}>
                        <Play className="mr-2 h-4 w-4" /> Trigger Audit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onTrigger('RankTracker')}>
                        <Play className="mr-2 h-4 w-4" /> Trigger Rank Tracker
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Executions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {workflows.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No recent workflows found.</div>
                        ) : (
                            workflows.map((workflow) => (
                                <div key={workflow.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-4">
                                        {getStatusIcon(workflow.status)}
                                        <div>
                                            <p className="text-sm font-medium">{workflow.name}</p>
                                            <p className="text-xs text-muted-foreground">Started: {workflow.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {workflow.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
