import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Now import the client and repositories
const { client } = require('../lib/clickhouse');
const { ClickHousePageRepository } = require('../lib/clickhouse/repositories/ClickHousePageRepository');
const { ClickHouseEmbeddingStore } = require('../lib/clickhouse/repositories/ClickHouseEmbeddingStore');
const { ClickHouseClusterStore } = require('../lib/clickhouse/repositories/ClickHouseClusterStore');
const { ClickHouseLinkSuggestionStore } = require('../lib/clickhouse/repositories/ClickHouseLinkSuggestionStore');
const { ClickHouseClaimStore } = require('../lib/clickhouse/repositories/ClickHouseClaimStore');
const { ClickHouseUxSessionStore } = require('../lib/clickhouse/repositories/ClickHouseUxSessionStore');

async function verify() {
    console.log("Verifying ClickHouse Advanced Integration...");

    const siteId = 'test-site-001';
    const pageId = 'page-001';
    const clusterId = 'cluster-001';
    const sessionId = 'session-001';

    // Initialize ClickHouse client for direct queries
    if (!client) {
        console.error("ClickHouse client not initialized. Check environment variables.");
        return;
    }

    try {
        // 0. Check Tables
        console.log("Checking tables...");
        const tablesResult = await client.query({
            query: `SELECT name FROM system.tables WHERE database = currentDatabase()`,
            format: 'JSONEachRow'
        });
        const tables = await tablesResult.json();
        // @ts-ignore
        console.log("Tables:", tables.map((t: { name: string }) => t.name));
        console.log(`- Found ${tables.length} tables.`);

        // 1. Page Repository
        console.log("Testing PageRepository...");
        await ClickHousePageRepository.createSite({
            site_id: siteId,
            project_id: 'proj-001',
            url: 'https://example.com'
        });
        await ClickHousePageRepository.createPage({
            site_id: siteId,
            page_id: pageId,
            url: 'https://example.com/page1',
            title: 'Test Page',
            text: 'This is a test page content.'
        });

        // Wait for data to be available
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pages = await ClickHousePageRepository.getPagesBySite(siteId);
        console.log(`- Pages found: ${pages.length}`);

        // 2. Embedding Store
        console.log("Testing EmbeddingStore...");
        await ClickHouseEmbeddingStore.saveEmbedding(siteId, pageId, [0.1, 0.2, 0.3], clusterId);
        const embedding = await ClickHouseEmbeddingStore.getEmbedding(siteId, pageId);
        console.log(`- Embedding retrieved: ${embedding ? 'Yes' : 'No'}`);

        // 3. Cluster Store
        console.log("Testing ClusterStore...");
        await ClickHouseClusterStore.saveCluster({
            site_id: siteId,
            cluster_id: clusterId,
            label: 'Test Cluster',
            size: 10
        });
        const clusters = await ClickHouseClusterStore.getClustersBySite(siteId);
        console.log(`- Clusters found: ${clusters.length}`);

        // 4. Link Suggestion Store
        console.log("Testing LinkSuggestionStore...");
        await ClickHouseLinkSuggestionStore.saveSuggestion({
            site_id: siteId,
            from_page_id: pageId,
            to_page_id: 'page-002',
            similarity: 0.9,
            target_tspr: 0.8,
            score: 0.72
        });
        const suggestions = await ClickHouseLinkSuggestionStore.getSuggestions(siteId, pageId);
        console.log(`- Suggestions found: ${suggestions.length}`);

        // 5. Claim Store
        console.log("Testing ClaimStore...");
        await ClickHouseClaimStore.saveClaim({
            site_id: siteId,
            claim_id: 'claim-001',
            page_id: pageId,
            text: 'ClickHouse is fast.',
            risk_score: 0.1
        });
        const claims = await ClickHouseClaimStore.getClaimsByPage(siteId, pageId);
        console.log(`- Claims found: ${claims.length}`);

        // 6. UX Session Store
        console.log("Testing UxSessionStore...");
        await ClickHouseUxSessionStore.saveSession({
            site_id: siteId,
            session_id: sessionId,
            goal: 'Test Goal',
            steps: 5
        });
        await ClickHouseUxSessionStore.saveEvent({
            site_id: siteId,
            session_id: sessionId,
            step: 1,
            action: 'click',
            url: 'https://example.com/page1'
        });
        const events = await ClickHouseUxSessionStore.getSessionEvents(siteId, sessionId);
        console.log(`- Events found: ${events.length}`);

        console.log("Verification Complete!");

    } catch (error) {
        console.error("Verification Failed:", error);
    }
}

verify().catch(console.error);
