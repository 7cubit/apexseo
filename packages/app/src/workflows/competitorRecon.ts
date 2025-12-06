import { proxyActivities } from '@temporalio/workflow';
// We assume activities are exported from a central 'activities' file
// In a real setup, we'd import the type from the activities definition
import type * as activities from '../activities';

const {
    fetchSerpData,
    extractDomains,
    ingestCompetitorsToNeo4j,
    fetchCompetitorKeywords
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '5m',
    retry: {
        initialInterval: '10s',
        maximumAttempts: 3
    }
});

export async function competitorReconWorkflow(topic: string, projectId: string): Promise<void> {
    console.log(`Starting Competitor Recon for topic: ${topic} (Project: ${projectId})`);

    // Step 1: Fetch Top 20 SERP for Core Topic
    // This calls DataForSEO to get the organic results
    const serpResults = await fetchSerpData(topic);

    // Step 2: Extract Ranking Domains
    // Parses the SERP JSON to get a list of unique domains
    const domains = await extractDomains(serpResults);

    if (domains.length === 0) {
        console.warn("No competitors found in SERP results.");
        return;
    }

    // Step 3: Ingest Competitors (Graph)
    // Creates :Competitor nodes in Neo4j
    await ingestCompetitorsToNeo4j(domains, projectId);

    // Step 4: Fan-out - Fetch Keywords for each Competitor
    // We use Promise.all for parallel execution to speed up the process
    // Each activity call fetches top 100 keywords for that domain
    const keywordPromises = domains.map(domain =>
        fetchCompetitorKeywords(domain, topic)
    );

    await Promise.all(keywordPromises);

    console.log(`Competitor Recon completed for ${domains.length} domains.`);
}
