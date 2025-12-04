// import { Client } from '@temporalio/client';

export const getTemporalClient = async () => {
    // In a real app, this would connect to Temporal Cloud or local server
    // For now, we'll mock the client or use a simplified connection
    // const client = new Client();
    // return client;
    return null;
};

export const listWorkflows = async () => {
    // Mock data for dashboard
    return [
        {
            workflowId: 'crawl-123',
            type: 'SiteCrawlWorkflow',
            status: 'COMPLETED',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            closeTime: new Date().toISOString(),
        },
        {
            workflowId: 'ingest-456',
            type: 'ProjectIngestionWorkflow',
            status: 'RUNNING',
            startTime: new Date(Date.now() - 1800000).toISOString(),
        },
        {
            workflowId: 'report-789',
            type: 'ReportGenerationWorkflow',
            status: 'FAILED',
            startTime: new Date(Date.now() - 900000).toISOString(),
        }
    ];
};
