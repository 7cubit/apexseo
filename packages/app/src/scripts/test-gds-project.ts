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
        console.log("Testing gds.graph.project...");
        await session.run(`CALL gds.graph.drop('test-graph', false)`);
        const result = await session.run(
            `CALL gds.graph.project('test-graph', 'Page', 'LINKS_TO') YIELD graphName`
        );
        console.log("Graph projected:", result.records[0].get('graphName'));
        await session.run(`CALL gds.graph.drop('test-graph', false)`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
