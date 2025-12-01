import { client, getDriver } from '../index';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetGraph() {
    console.log('Resetting Graph and ClickHouse data...');

    // 1. Clear Neo4j
    const driver = getDriver();
    if (driver) {
        const session = driver.session();
        try {
            await session.run('MATCH (n) DETACH DELETE n');
            console.log('✅ Neo4j graph cleared.');
        } catch (e) {
            console.error('Failed to clear Neo4j:', e);
        } finally {
            await session.close();
            await driver.close();
        }
    } else {
        console.error('Neo4j driver not initialized.');
    }

    // 2. Clear ClickHouse
    if (client) {
        const tables = [
            'pages',
            'clusters',
            'claims',
            'raw_crawl_log',
            'backlinks',
            'page_health_scores',
            'ux_sessions',
            'ux_events',
            'rank_history'
        ];

        for (const table of tables) {
            try {
                // Check if table exists first to avoid error? Or just TRUNCATE IF EXISTS (not standard SQL but CH might support)
                // Better to just try truncate and ignore error if table doesn't exist
                await client.command({
                    query: `TRUNCATE TABLE IF EXISTS ${table}`
                });
                console.log(`✅ Table ${table} truncated.`);
            } catch (e) {
                console.warn(`Failed to truncate ${table} (might not exist):`, e);
            }
        }
    } else {
        console.error('ClickHouse client not initialized.');
    }

    console.log('Reset complete.');
}

resetGraph();
