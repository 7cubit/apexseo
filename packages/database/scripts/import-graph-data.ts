import { driver, DATABASE } from '../../shared/src/lib/neo4j/driver';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const BATCH_SIZE = 1000;

async function importData(filePath: string) {
    if (!driver) {
        throw new Error('Neo4j driver not initialized');
    }
    const session = driver.session({ database: DATABASE });
    const records: any[] = [];

    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }));

    console.log(`Starting import from ${filePath}...`);

    try {
        for await (const record of parser) {
            records.push(record);

            if (records.length >= BATCH_SIZE) {
                await processBatch(session, records);
                records.length = 0; // Clear array
            }
        }

        // Process remaining records
        if (records.length > 0) {
            await processBatch(session, records);
        }

        console.log('Import completed successfully.');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

async function processBatch(session: any, batch: any[]) {
    console.log(`Processing batch of ${batch.length} records...`);

    // Example: Import Pages
    // Assumes CSV has headers: page_id, url, title, site_id
    await session.run(`
        UNWIND $batch AS row
        MERGE (p:Page {page_id: row.page_id})
        SET p.url = row.url, p.title = row.title
        WITH p, row
        MATCH (s:Site {id: row.site_id})
        MERGE (p)-[:BELONGS_TO]->(s)
    `, { batch });
}

// Check if file path is provided
const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a CSV file path.');
    process.exit(1);
}

importData(filePath).catch(console.error);
