import { NextResponse } from 'next/server';
import { SystemInsightsService } from '@apexseo/shared';

export async function GET() {
    try {
        const [neo4j, clickhouse, temporal] = await Promise.all([
            SystemInsightsService.getNeo4jStats(),
            SystemInsightsService.getClickHouseStats(),
            SystemInsightsService.getTemporalStats()
        ]);

        return NextResponse.json({
            neo4j,
            clickhouse,
            temporal,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching system insights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
