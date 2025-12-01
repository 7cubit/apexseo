import { useState } from 'react';
import { apiClient } from '../lib/api';

export function useWorkflow() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workflowId, setWorkflowId] = useState<string | null>(null);

    const triggerCrawl = async (siteId: string, startUrl: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient('/analysis/crawl', {
                method: 'POST',
                body: JSON.stringify({ siteId, startUrl, depth: 2, limit: 100 }),
            });
            setWorkflowId(data.workflowId);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const triggerAnalysis = async (projectId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient('/analysis/analyze', {
                method: 'POST',
                body: JSON.stringify({ projectId }),
            });
            setWorkflowId(data.workflowId);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { triggerCrawl, triggerAnalysis, workflowId, isLoading, error };
}
