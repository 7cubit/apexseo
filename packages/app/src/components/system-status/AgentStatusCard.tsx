import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AgentStatusCardProps {
    agent: {
        agent_name: string;
        enabled: boolean;
        last_run?: string;
        next_run?: string;
    };
    onToggle: (enabled: boolean) => void;
    onRunNow: () => void;
    isToggling: boolean;
}

export function AgentStatusCard({ agent, onToggle, onRunNow, isToggling }: AgentStatusCardProps) {
    const getStatusIcon = (enabled: boolean) => {
        if (enabled) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        return <Pause className="h-4 w-4 text-yellow-500" />;
    };

    const getStatusBadge = (enabled: boolean) => {
        return <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Active' : 'Paused'}</Badge>;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{agent.agent_name}</CardTitle>
                {getStatusIcon(agent.enabled)}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {getStatusBadge(agent.enabled)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Run</span>
                        <span className="font-mono text-xs">
                            {formatDate(agent.last_run)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next Run</span>
                        <span className="font-mono text-xs">
                            {formatDate(agent.next_run)}
                        </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={onRunNow}
                            disabled={true} // Run Now not implemented yet
                        >
                            <Play className="h-3 w-3 mr-1" /> Run Now
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => onToggle(!agent.enabled)}
                            disabled={isToggling}
                        >
                            {agent.enabled ? (
                                <>
                                    <Pause className="h-3 w-3 mr-1" /> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="h-3 w-3 mr-1" /> Resume
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
