import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { driver, DATABASE } from '../lib/neo4j/driver';

async function main() {
    if (!driver) {
        console.log("No driver");
        return;
    }
    const session = driver.session({ database: DATABASE });
    try {
        console.log("Testing gds.pageRank.stream with anonymous projection...");
        const result = await session.run(`
            CALL gds.pageRank.stream({
                nodeProjection: 'Page',
                relationshipProjection: {
                    LINKS_TO: {
                        type: 'LINKS_TO',
                        properties: 'weight'
                    }
                },
                maxIterations: 20,
                dampingFactor: 0.85
            }) YIELD nodeId, score
            RETURN nodeId, score LIMIT 5
        `);
        console.log("Result count:", result.records.length);
        result.records.forEach(r => console.log(r.get('nodeId'), r.get('score')));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
