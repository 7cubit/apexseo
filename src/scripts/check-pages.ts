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
        const result = await session.run(
            `MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: 'junket-japan'}) RETURN count(p) as count`
        );
        console.log("Page count:", result.records[0].get('count').toNumber());
    } catch (e) {
        console.error(e);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
