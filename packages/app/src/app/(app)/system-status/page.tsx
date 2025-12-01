"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher, apiClient } from '@/lib/api';
import { AgentStatusCard } from '@/components/system-status/AgentStatusCard';
import { toast } from 'sonner';

// TODO: Get project ID from context or route
const PROJECT_ID = 'test-project-1';

interface Schedule {
    project_id: string;
    agent_name: string;
    cron_expression: string;
    enabled: boolean;
    last_run?: string;
    next_run?: string;
}

export default function SystemStatusPage() {
    const { data, error, isLoading, mutate } = useSWR<{ schedules: Schedule[] }>(
        `/projects/${PROJECT_ID}/schedules`,
        fetcher
    );
    const [toggling, setToggling] = useState<Record<string, boolean>>({});

    const handleToggle = async (agentName: string, enabled: boolean) => {
        setToggling(prev => ({ ...prev, [agentName]: true }));
        try {
            await apiClient(`/projects/${PROJECT_ID}/schedules/${agentName}/toggle`, {
                method: 'POST',
                body: JSON.stringify({ enabled })
            });
            toast.success(`${agentName} ${enabled ? 'enabled' : 'disabled'}`);
            mutate();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to toggle ${agentName}`);
        } finally {
            setToggling(prev => ({ ...prev, [agentName]: false }));
        }
    };

    const handleRunNow = (agentName: string) => {
        toast.info(`Triggering ${agentName}... (Not implemented yet)`);
    };

    if (isLoading) return <div className="p-8 text-center">Loading system status...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load status. Ensure API is running.</div>;

    const schedules = data?.schedules || [];

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
                    <p className="text-muted-foreground">Monitor autonomous agents and background jobs</p>
                </div>
                <Button onClick={() => mutate()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            {schedules.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No agents found for this project.</p>
                    <p className="text-xs text-muted-foreground mt-2">Try running the sync-schedules script.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules.map((schedule) => (
                        <AgentStatusCard
                            key={schedule.agent_name}
                            agent={schedule}
                            onToggle={(enabled) => handleToggle(schedule.agent_name, enabled)}
                            onRunNow={() => handleRunNow(schedule.agent_name)}
                            isToggling={!!toggling[schedule.agent_name]}
                        />
                    ))}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm">System operational</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
