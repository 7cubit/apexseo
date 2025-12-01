import { getDriver } from '../lib/neo4j';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupSchema() {
    const driver = getDriver();
    if (!driver) {
        console.error('Neo4j driver not initialized. Check environment variables.');
        process.exit(1);
    }
    const session = driver.session();
    try {
        console.log('Applying Neo4j schema constraints...');

        // Page URL uniqueness
        await session.run(`
            CREATE CONSTRAINT page_url_unique IF NOT EXISTS
            FOR (p:Page) REQUIRE p.url IS UNIQUE
        `);
        console.log('✓ Constraint: Page.url unique');

        // Domain name uniqueness
        await session.run(`
            CREATE CONSTRAINT domain_name_unique IF NOT EXISTS
            FOR (d:Domain) REQUIRE d.name IS UNIQUE
        `);
        console.log('✓ Constraint: Domain.name unique');

        // Keyword text uniqueness
        await session.run(`
            CREATE CONSTRAINT keyword_text_unique IF NOT EXISTS
            FOR (k:Keyword) REQUIRE k.text IS UNIQUE
        `);
        console.log('✓ Constraint: Keyword.text unique');

        // Indexes
        await session.run(`
            CREATE INDEX page_id_index IF NOT EXISTS
            FOR (p:Page) ON (p.page_id)
        `);
        console.log('✓ Index: Page.page_id');

        await session.run(`
            CREATE INDEX link_last_seen_index IF NOT EXISTS
            FOR ()-[r:LINKS_TO]-() ON (r.last_seen)
        `);
        console.log('✓ Index: LINKS_TO.last_seen');

        console.log('Schema setup completed successfully.');
    } catch (error) {
        console.error('Error setting up schema:', error);
        process.exit(1);
    } finally {
        await session.close();
        await driver.close();
    }
}

setupSchema();
