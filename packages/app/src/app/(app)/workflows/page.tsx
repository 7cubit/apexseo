'use client';

import { useEffect, useState } from 'react';
import { WorkflowList } from '@/components/dashboard/WorkflowList';
import { listWorkflows } from '@/lib/temporal-client';

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const data = await listWorkflows();
                setWorkflows(data);
            } catch (error) {
                console.error('Failed to fetch workflows', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkflows();
    }, []);

    const handleTriggerWorkflow = async (workflowType: string) => {
        console.log(`Triggering ${workflowType}...`);
        // In a real app, this would call an API route to start the workflow
    };

    if (loading) {
        return <div className="p-8">Loading workflows...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                <p className="text-muted-foreground mt-2">
                    Monitor and manage your background processing pipelines.
                </p>
            </div>

            <WorkflowList
                workflows={workflows}
                onTrigger={handleTriggerWorkflow}
            />
        </div>
    );
}
