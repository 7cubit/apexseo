import { TSPRService } from '../lib/services/TSPRService';
import { ClusteringService } from '../lib/services/ClusteringService';
import { HealthScoreService } from '../lib/health-score';
import { getDriver, closeDriver } from '../lib/neo4j';
import { initClickHouse } from '../lib/clickhouse';

async function main() {
    const siteId = 'test-site.com'; // Use a test site ID

    try {
        await initClickHouse();
        const driver = getDriver();
        if (!driver) {
            console.error("Neo4j driver not initialized");
            return;
        }

        console.log("--- Testing Logic Engine Components ---");

        // 1. TSPR
        console.log("\n[1] Running TSPR...");
        try {
            await TSPRService.runTSPR(siteId);
            console.log("TSPR completed successfully.");
        } catch (e) {
            console.error("TSPR failed (expected if GDS not installed):", e);
        }

        // 2. Clustering
        console.log("\n[2] Running Clustering...");
        try {
            await ClusteringService.runClustering(siteId, 2); // k=2 for test
            console.log("Clustering completed successfully.");
        } catch (e) {
            console.error("Clustering failed:", e);
        }

        // 3. Health Scores
        console.log("\n[3] Calculating Health Scores...");
        try {
            const scores = await HealthScoreService.calculateAndSave(siteId);
            console.log(`Calculated scores for ${scores.length} pages.`);
            if (scores.length > 0) {
                console.log("Sample Score:", scores[0]);
            }
        } catch (e) {
            console.error("Health Score calculation failed:", e);
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await closeDriver();
        process.exit(0);
    }
}

main();
