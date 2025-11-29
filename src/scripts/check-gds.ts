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
            `SHOW PROCEDURES YIELD name WHERE name STARTS WITH 'gds' RETURN name`
        );
        if (result.records.length === 0) {
            console.log("No GDS procedures found.");
        } else {
            console.log("GDS Procedures found:");
            result.records.forEach(r => console.log(r.get('name')));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
