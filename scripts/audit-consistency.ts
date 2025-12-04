
import { createClient } from '@clickhouse/client';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function audit(projectName: string) {
    console.log(`🔍 Auditing Consistency for Project: "${projectName}"...\n`);

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
        // Count in ClickHouse
        const chResult = await chClient.query({
            query: `SELECT count(*) as count FROM projects WHERE name = '${projectName}'`,
            format: 'JSONEachRow',
        });
        const chRows = (await chResult.json()) as unknown as any[];
        const chCount = parseInt(chRows[0].count);

        // Count in Neo4j
        const session = neoDriver.session();
        const neoResult = await session.run(
            `MATCH (p:Project {name: $name}) RETURN count(p) as count`,
            { name: projectName }
        );
        const neoCount = neoResult.records[0].get('count').toNumber();
        await session.close();

        // Report
        console.log('---------------------------------------------------');
        console.log(`🏛️  CLICKHOUSE COUNT: ${chCount}`);
        console.log(`🕸️  NEO4J COUNT:      ${neoCount}`);
        console.log('---------------------------------------------------');

        if (chCount === neoCount && chCount > 0) {
            console.log('✅ CONSISTENCY VERIFIED');
        } else if (chCount === 0 && neoCount === 0) {
            console.log('⚠️  NO DATA FOUND (Consistent but empty)');
        } else {
            console.log('❌ INCONSISTENCY DETECTED');
            console.log('Split Brain Scenario Possible!');
        }

    } catch (error) {
        console.error('Audit Failed:', error);
    } finally {
        await chClient.close();
        await neoDriver.close();
    }
}

const projectName = process.argv[2] || 'DualWrite_Test';
audit(projectName);
