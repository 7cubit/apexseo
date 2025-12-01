import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const WorkflowRow = ({ id, type, queue, step, status, duration }: any) => (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4 font-mono text-sm text-gray-400">{id}</td>
        <td className="px-6 py-4 text-white font-medium">{type}</td>
        <td className="px-6 py-4 text-gray-400 text-sm">{queue}</td>
        <td className="px-6 py-4 text-gray-400 text-sm">{step}</td>
        <td className="px-6 py-4">
            <Badge variant={status === 'Running' ? 'info' : status === 'Completed' ? 'success' : 'danger'}>
                {status}
            </Badge>
        </td>
        <td className="px-6 py-4 text-gray-400 text-sm">{duration}</td>
    </tr>
);

export default function WorkflowsPage() {
    return (

        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">System Workflows</h1>
                <p className="text-gray-400 mt-1">Monitor Temporal workflow execution status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-blue-900/10 border-blue-900/30">
                    <div className="text-blue-400 text-sm font-medium mb-1">Active Workflows</div>
                    <div className="text-3xl font-bold text-white">12</div>
                </Card>
                <Card>
                    <div className="text-gray-400 text-sm font-medium mb-1">Completed (24h)</div>
                    <div className="text-3xl font-bold text-white">1,450</div>
                </Card>
                <Card>
                    <div className="text-gray-400 text-sm font-medium mb-1">Failed (24h)</div>
                    <div className="text-3xl font-bold text-white">3</div>
                </Card>
                <Card>
                    <div className="text-gray-400 text-sm font-medium mb-1">Avg Duration</div>
                    <div className="text-3xl font-bold text-white">45s</div>
                </Card>
            </div>

            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3">Workflow ID</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Queue</th>
                                <th className="px-6 py-3">Current Step</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <WorkflowRow
                                id="wf_102938"
                                type="SiteAnalysisWorkflow"
                                queue="seo-orchestrator"
                                step="SimulatePersonaSession"
                                status="Running"
                                duration="2m 15s"
                            />
                            <WorkflowRow
                                id="wf_102939"
                                type="IngestSiteWorkflow"
                                queue="seo-heavy-jobs"
                                step="CrawlPage"
                                status="Running"
                                duration="45s"
                            />
                            <WorkflowRow
                                id="wf_102930"
                                type="ComputeTSPRWorkflow"
                                queue="seo-heavy-jobs"
                                step="Done"
                                status="Completed"
                                duration="5m 20s"
                            />
                            <WorkflowRow
                                id="wf_102921"
                                type="CheckTruthWorkflow"
                                queue="seo-heavy-jobs"
                                step="Failed to connect"
                                status="Failed"
                                duration="10s"
                            />
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

    );
}
