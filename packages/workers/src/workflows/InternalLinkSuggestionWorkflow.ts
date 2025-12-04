import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities/graph/GenerateLinkSuggestionsActivity';



export async function InternalLinkSuggestionWorkflow(args: { projectId: string; siteId: string }): Promise<any> {
    const { projectId, siteId } = args;

    log.info('InternalLinkSuggestionWorkflow started', { projectId, siteId });

    // 1. Generate suggestions using Neo4j and save to ClickHouse
    const { generateLinkSuggestions } = proxyActivities<typeof activities>({
        startToCloseTimeout: '5 minutes', // Graph queries can be slow
    });
    const result = await generateLinkSuggestions(projectId, siteId);
    log.info('InternalLinkSuggestionWorkflow completed', { count: result.count });

    return result;
}
