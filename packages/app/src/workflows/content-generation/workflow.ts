import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { EEATRequest } from './types';

const {
    doPerplexityResearch,
    validateResearch,
    generateContentArchitecture,
    draftWithLLM,
    verifyAndCiteContent,
    semanticDensityCheck,
    optimizeInformationGain,
    optimizeSnippets,
    validateYMYLConsensus,
    optimizeEntitySalience,
    injectExperienceAndPolish,
    rescoreEEAT,
    saveContent
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '5m', // Adjust timeouts as needed
});

export async function contentGenerationWorkflow(request: EEATRequest): Promise<string> {
    // Activity 1: Research (Perplexity)
    const research = await doPerplexityResearch(request);

    // Activity 2: Validate
    if (!await validateResearch(research)) {
        throw new Error('Invalid research data');
    }

    // Activity 3: Architecture
    const architecture = await generateContentArchitecture(request, research);

    // Activity 4: Draft
    const draft = await draftWithLLM(request, research, architecture);

    // Parallel Activities (for speed)
    // Note: Some of these return boolean checks, others might modify content. 
    // The prompt implies verifyAndCiteContent returns content.
    // The others seem to be optimization checks or side-effects.
    // For this implementation, we assume verifyAndCiteContent is the one carrying the content forward.

    const [cited] = await Promise.all([
        verifyAndCiteContent(draft, research),
        semanticDensityCheck(draft, research),
        optimizeInformationGain(draft, research),
        optimizeSnippets(draft),
        validateYMYLConsensus(draft, research),
        optimizeEntitySalience(draft)
    ]);

    // Activity 5: Polish
    const final = await injectExperienceAndPolish(cited.content);

    // Activity 6: Score
    const score = await rescoreEEAT(final.content);

    // Save to Neo4j
    await saveContent({ ...final, score, eeatScore: { experience: 0, expertise: 0, authoritativeness: 0, trustworthiness: 0 } }); // Mock score object

    return final.content;
}
