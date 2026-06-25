import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

// We need to run this with ts-node
import { TopicalMapService } from '../packages/app/src/lib/TopicalMapService';
import { CannibalizationService } from '../packages/app/src/lib/services/CannibalizationService';
import { driver } from '../packages/app/src/lib/neo4j/driver';

async function verify() {
    console.log("🔍 Verifying Service Integration...");

    try {
        // 1. Verify TopicalMapService (Neo4j)
        console.log("\n--- Checking TopicalMapService (Neo4j) ---");
        const topicalService = new TopicalMapService();
        const map = await topicalService.getTopicMap('project-1');

        if (map && map.clusters.length > 0) {
            console.log(`✅ Success: Fetched Topic Map with ${map.clusters.length} clusters.`);
            console.log(`   Sample Cluster: ${map.clusters[0].name}`);
        } else {
            console.error("❌ Failed: Topic Map is null or empty. Did you seed Neo4j?");
        }

        // 2. Verify CannibalizationService (ClickHouse)
        console.log("\n--- Checking CannibalizationService (ClickHouse) ---");
        const cannibalService = new CannibalizationService();
        const issues = await cannibalService.getCannibalizationReport('project-1');

        if (issues && issues.length > 0) {
            console.log(`✅ Success: Fetched ${issues.length} cannibalization issues.`);
            console.log(`   Sample Issue: ${issues[0].keyword} (${issues[0].pageCount} pages)`);

            // Check Volatility for first issue
            const keyword = issues[0].keyword;
            console.log(`   Checking volatility for '${keyword}'...`);
            const volatility = await cannibalService.getVolatilityData(keyword, 'project-1');

            if (volatility && volatility.history.length > 0) {
                console.log(`✅ Success: Fetched volatility history (${volatility.history.length} points).`);
                console.log(`   Trend: ${volatility.trend}, Score: ${volatility.score}`);
            } else {
                console.warn("⚠️ Warning: Volatility data is empty.");
            }

        } else {
            console.warn("⚠️ Warning: No cannibalization issues found. This might be normal if randomness didn't create conflicts, but check debug logs.");
        }

    } catch (e) {
        console.error("❌ Verification failed with error:", e);
    } finally {
        if (driver) await driver.close();
        process.exit(0);
    }
}

verify();
