import { driver, DATABASE } from '../../shared/src/lib/neo4j/driver';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '../../.env' });

async function initNeo4jSchema() {
    console.log('🚀 Initializing Neo4j Schema...');

    if (!driver) {
        console.error('❌ Neo4j driver not initialized');
        process.exit(1);
    }

    const session = driver.session({ database: DATABASE });
    const schemaPath = path.resolve(__dirname, '../neo4j/schema.cypher');

    if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Schema file not found at ${schemaPath}`);
        process.exit(1);
    }

    const schemaCypher = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon, filter empty lines and comments
    const queries = schemaCypher
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('//'));

    try {
        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await session.run(query);
        }

        console.log('✅ Neo4j Schema applied successfully.');
    } catch (error) {
        console.error('❌ Failed to apply Neo4j schema:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

initNeo4jSchema();
