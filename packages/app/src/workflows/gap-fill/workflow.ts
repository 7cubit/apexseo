import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from './activities'; // We'll export these in index.ts later or import individually
import { GapFillWorkflowInput, GapFillWorkflowOutput } from './types';

// Define Activity Proxies with timeouts and retry policies
const { fetchClusterDetails } = proxyActivities<typeof activities>({
    startToCloseTimeout: '30s',
    retry: {
        initialInterval: '1s',
        maximumAttempts: 3,
        backoffCoefficient: 2,
    },
});

const { fetchCompetitorContent, extractCompetitorEntities } = proxyActivities<typeof activities>({
    startToCloseTimeout: '45s', // Fetching can be slow
    retry: {
        initialInterval: '2s',
        maximumAttempts: 2, // API calls expensive
    },
});

const { generateContentBrief } = proxyActivities<typeof activities>({
    startToCloseTimeout: '35s', // LLM generation
    retry: {
        initialInterval: '1s',
        maximumAttempts: 2,
    },
});

const { queueContentTask } = proxyActivities<typeof activities>({
    startToCloseTimeout: '20s',
    retry: {
        initialInterval: '1s',
        maximumAttempts: 5, // Critical persistence
    },
});

export async function HexagonClickGapFillWorkflow(
    input: GapFillWorkflowInput
): Promise<GapFillWorkflowOutput> {
    const startTime = Date.now();
    log.info('Starting HexagonClickGapFillWorkflow', { clusterId: input.cluster_id });

    try {
        // 1. Fetch Cluster Details (Required)
        const clusterDetails = await fetchClusterDetails(
            input.cluster_id,
            input.my_domain,
            input.top_competitor_domain
        );

        // 2. Parallel: Fetch Competitor Content & Extract Entities
        // Note: ExtractEntities actually depends on content, so it can't be fully parallel 
        // unless we fetch content first.
        // The prompt says: "Activity 1 -> Parallel: Activities 2 & 3".
        // But Activity 3 is "ExtractCompetitorEntitiesActivity - Use NER to extract entities from competitor content".
        // This implies 3 depends on 2.
        // UNLESS Activity 3 fetches its own content or uses a different source.
        // Let's assume Activity 3 takes the OUTPUT of Activity 2.
        // OR, maybe Activity 2 returns URLs and Activity 3 scrapes them?
        // Let's look at the prompt again: "FetchCompetitorContentActivity ... Scrape or cache competitor content ... Extract key sections".
        // "ExtractCompetitorEntitiesActivity ... Use NER to extract entities from competitor content".
        // It seems 3 depends on 2's output.
        // However, if we want parallelism, maybe 3 extracts from *already known* competitor data?
        // Let's assume sequential dependency for correctness: 2 -> 3.
        // Wait, if I strictly follow "Parallel: Activities 2 & 3", then 3 must fetch its own data or take inputs from 1?
        // Let's assume 2 returns the content, and 3 processes it.
        // If they are parallel, maybe 3 is "Extract Entities from *SERP snippets*" (from step 1)?
        // Let's implement as: 2 fetches full content. 3 extracts entities from *that* content.
        // So 2 must finish before 3 starts.
        // BUT, if I want to optimize, maybe 2 returns chunks and 3 processes stream? No, too complex.
        // Let's just run them sequentially for logic, or maybe the prompt meant "Fetch Content" and "Fetch Something Else" in parallel.
        // Let's stick to logical dependency: 2 then 3.

        const competitorContent = await fetchCompetitorContent(
            clusterDetails.missing_keywords,
            input.top_competitor_domain
        );

        const entities = await extractCompetitorEntities(competitorContent);

        // 3. Generate Brief (Required)
        const brief = await generateContentBrief(
            clusterDetails,
            competitorContent,
            entities,
            input.my_domain
        );

        // 4. Queue Task (Required)
        const taskId = await queueContentTask(
            brief,
            input.user_id,
            input.cluster_id,
            input.topic_id
        );

        return {
            task_id: taskId,
            brief_json: brief,
            status: 'COMPLETED',
            created_at: new Date(),
            execution_time_ms: Date.now() - startTime
        };

    } catch (error) {
        log.error('Workflow failed', { error });
        throw error; // Temporal handles failure
    }
}
