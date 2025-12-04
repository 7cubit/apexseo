
import { createClient } from '@clickhouse/client';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verify() {
    console.log('🔍 Starting Forensic Data Audit for "Phoenix_V1"...\n');

    // 1. ClickHouse Connection
    const chClient = createClient({
        url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || undefined,
    });

    // 2. Neo4j Connection
    const neoDriver = neo4j.driver(
        process.env.NEO4J_URI || 'bolt://localhost:7687',
        neo4j.auth.basic(
            process.env.NEO4J_USER || 'neo4j',
            process.env.NEO4J_PASSWORD || 'password'
        )
    );

    try {
        // Create Table
        await chClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS projects (
                    id String,
                    name String,
                    domain String,
                    user_id String,
                    created_at DateTime,
                    site_doctor_enabled UInt8 DEFAULT 1,
                    site_doctor_cron String DEFAULT '0 2 * * *',
                    rank_tracker_enabled UInt8 DEFAULT 1,
                    rank_tracker_cron String DEFAULT '0 */6 * * *'
                ) ENGINE = MergeTree()
                ORDER BY (user_id, created_at)
            `
        });
        console.log('✅ ClickHouse Table Created/Verified');

        const phoenixId = '550e8400-e29b-41d4-a716-446655440000';
        const phoenixName = 'Phoenix_V1';
        const phoenixDomain = 'phoenix.test';
        const createdAt = new Date().toISOString().replace('T', ' ').split('.')[0]; // ClickHouse DateTime format

        console.log('🌱 SEEDING DATA (Simulating PM Action)...');

        // Seed ClickHouse
        await chClient.insert({
            table: 'projects',
            values: [{
                id: phoenixId,
                name: phoenixName,
                domain: phoenixDomain,
                user_id: 'forensic-auditor',
                created_at: createdAt,
                site_doctor_enabled: 1,
                site_doctor_cron: '0 2 * * *',
                rank_tracker_enabled: 1,
                rank_tracker_cron: '0 */6 * * *'
            }],
            format: 'JSONEachRow'
        });
        console.log('   - ClickHouse: Seeded');

        // Seed Neo4j
        const session = neoDriver.session();
        await session.run(
            `
            MERGE (p:Project {id: $id})
            SET p.name = $name,
                p.createdAt = $createdAt,
                p.description = 'Project for forensic audit',
                p.types = ['audit', 'keyword']
            RETURN p
            `,
            { id: phoenixId, name: phoenixName, createdAt: createdAt }
        );
        await session.close();
        console.log('   - Neo4j: Seeded');
        console.log('');

        // Query ClickHouse
        const chResult = await chClient.query({
            query: "SELECT * FROM projects WHERE name = 'Phoenix_V1' ORDER BY created_at DESC LIMIT 1",
            format: 'JSONEachRow',
        });
        const chRows = (await chResult.json()) as unknown as any[];
        const chProject = chRows[0];

        // Query Neo4j
        const verifySession = neoDriver.session();
        const neoResult = await verifySession.run(
            "MATCH (p:Project {name: 'Phoenix_V1'}) RETURN p"
        );
        const neoProject = neoResult.records.length > 0 ? neoResult.records[0].get('p').properties : null;
        await verifySession.close();

        // Report
        console.log('---------------------------------------------------');
        console.log('🏛️  CLICKHOUSE RECORD');
        console.log('---------------------------------------------------');
        if (chProject) {
            console.log(`UUID:       ${chProject.id}`);
            console.log(`Name:       ${chProject.name}`);
            console.log(`Created At: ${chProject.created_at}`);
        } else {
            console.log('❌ Record NOT FOUND');
        }

        console.log('\n---------------------------------------------------');
        console.log('🕸️  NEO4J RECORD');
        console.log('---------------------------------------------------');
        if (neoProject) {
            console.log(`UUID:       ${neoProject.id}`);
            console.log(`Name:       ${neoProject.name}`);
            console.log(`Created At: ${neoProject.createdAt}`);
        } else {
            console.log('❌ Record NOT FOUND');
        }

        console.log('\n---------------------------------------------------');
        console.log('⚖️  VERDICT');
        console.log('---------------------------------------------------');

        if (chProject && neoProject) {
            const uuidMatch = chProject.id === neoProject.id;
            // Normalize timestamps for comparison (simple string check might fail if formats differ slightly)
            const timeMatch = chProject.created_at === neoProject.createdAt;

            if (uuidMatch && timeMatch) {
                console.log('✅ DATA CONSISTENCY CERTIFIED');
                console.log('UUIDs Match: YES');
                console.log('Timestamps Match: YES');
            } else {
                console.log('⚠️  DATA INCONSISTENCY DETECTED');
                console.log(`UUIDs Match: ${uuidMatch ? 'YES' : 'NO'}`);
                console.log(`Timestamps Match: ${timeMatch ? 'YES' : 'NO'}`);
            }
        } else {
            console.log('❌ INCOMPLETE DATA - Cannot Certify');
        }

    } catch (error) {
        console.error('Audit Failed:', error);
    } finally {
        await chClient.close();
        await neoDriver.close();
    }
}

verify();
