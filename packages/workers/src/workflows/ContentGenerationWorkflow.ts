import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as contentActivities from '../activities/content-generation';
import type * as dataForSeoActivities from '../activities/dataforseo';
import { EEATRequest, ScoredContent } from '../activities/types';
import { ComputeActivities, DataActivities } from '../activities/remote-types';

const {
    doPerplexityResearch,
    generateContentArchitecture,
    draftWithLLM,
    saveContent
} = proxyActivities<typeof contentActivities>({
    startToCloseTimeout: '5m',
    retry: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumAttempts: 3,
    }
});

const {
    getKeywordData,
    analyzeSerp
} = proxyActivities<typeof dataForSeoActivities>({
    startToCloseTimeout: '2m',
    retry: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumAttempts: 3,
    }
});

// Remote Python Worker
const { compute_content_score } = proxyActivities<ComputeActivities>({
    taskQueue: 'seo-compute-queue',
    startToCloseTimeout: '1m',
});

// Remote Go Worker
const { IngestSerpData } = proxyActivities<DataActivities>({
    taskQueue: 'seo-data-queue',
    startToCloseTimeout: '1m',
});

export const refineSignal = defineSignal<[string]>('refine');

export async function ContentGenerationWorkflow(request: EEATRequest): Promise<ScoredContent> {
    let status = "Starting...";

    // Step 1: Data Gathering (Parallel)
    status = "Gathering Data...";
    const [keywordData, serpData, researchData] = await Promise.all([
        getKeywordData(request.topic),
        analyzeSerp(request.topic),
        doPerplexityResearch(request)
    ]);

    // Async Data Ingestion (Fire and Forget-ish, but we await for safety)
    if (serpData && serpData.length > 0) {
        await IngestSerpData({ Keyword: request.topic, Items: serpData });
    }

    // Step 2: Architecture
    status = "Designing Architecture...";
    const architecture = await generateContentArchitecture(request, researchData);

    // Step 3: Drafting
    status = "Drafting Content...";
    const draft = await draftWithLLM(request, researchData, architecture);

    // Step 4: Finalizing & Scoring (Python)
    status = "Finalizing...";
    const nlpScore = await compute_content_score(draft.content, request.topic);

    const scoredContent: ScoredContent = {
        content: draft.content,
        metadata: draft.metadata,
        score: nlpScore,
        eeatScore: {
            experience: 8,
            expertise: 9,
            authoritativeness: 8,
            trustworthiness: 9
        },
        projectId: request.projectId,
        targetKeyword: request.targetKeyword
    };

    // Step 5: Saving
    status = "Saving...";
    await saveContent(scoredContent);

    status = "Completed";
    return scoredContent;
}
