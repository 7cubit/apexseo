import { NextResponse } from 'next/server';
import { getDriver, client } from '@apexseo/shared';

export async function GET() {
    const health = {
        neo4j: 'UNKNOWN',
        clickhouse: 'UNKNOWN',
        api: 'OPERATIONAL',
        timestamp: new Date().toISOString()
    };

    // Check Neo4j
    try {
        const driver = getDriver();
        if (driver) {
            await driver.verifyConnectivity();
            health.neo4j = 'OPERATIONAL';
        } else {
            health.neo4j = 'DISCONNECTED';
        }
    } catch (error) {
        console.error('Neo4j health check failed:', error);
        health.neo4j = 'DOWN';
    }

    // Check ClickHouse
    try {
        if (client) {
            await client.ping();
            health.clickhouse = 'OPERATIONAL';
        } else {
            health.clickhouse = 'DISCONNECTED';
        }
    } catch (error) {
        console.error('ClickHouse health check failed:', error);
        health.clickhouse = 'DOWN';
    }

    return NextResponse.json(health);
}
