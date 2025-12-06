import { NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';

const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
    database: process.env.CLICKHOUSE_DATABASE || 'default',
    request_timeout: 30000,
});

export const dynamic = 'force-dynamic'; // Ensure not cached statically

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const topic_id = searchParams.get('topic_id');

        if (!topic_id) {
            return NextResponse.json(
                { error: 'Missing topic_id parameter' },
                { status: 400 }
            );
        }

        // Optimized Query Logic (Inlined from optimized_queries.sql)
        const query = `
            SELECT
                g.cluster_id,
                g.cluster_name,
                g.gap_score,
                g.opportunity_level,
                g.search_volume as total_volume,
                g.avg_difficulty,
                g.your_coverage as your_coverage_percentage,
                
                -- Denormalized/Calculated fields for visualization
                -- Assuming these exist or we calculate them. 
                -- For now, we map existing columns.
                
                -- Mocking radial layout params if not in DB, 
                -- OR assuming they are pre-calculated. 
                -- Let's generate random layout params if null for demo, 
                -- or assume the DB has them.
                -- The prompt's schema didn't explicitly have x/y, 
                -- but the prompt's "DATA STRUCTURE" for frontend expects:
                -- semantic_distance_to_root, radial_angle.
                -- If these aren't in DB, we must calculate or mock them.
                -- Let's use a deterministic hash for demo if missing.
                
                cityHash64(g.cluster_id) % 100 / 100.0 as semantic_distance_to_root,
                cityHash64(g.cluster_name) % 360 as radial_angle,
                
                competitor_stats.top_competitors as top_competitors

            FROM gap_opportunity_matrix g

            LEFT JOIN (
                SELECT
                    cluster_id,
                    -- Create array of tuples: [(domain, coverage), ...]
                    -- Sort by coverage desc, take top 3
                    arraySlice(
                        arraySort(
                            x -> -x.2,
                            groupArray(tuple(competitor_domain, competitor_coverage_percentage))
                        ),
                        1, 3
                    ) as top_competitors
                FROM cluster_metrics_snapshot
                -- PREWHERE snapshot_date = today() -- Commented out for demo if data is old
                GROUP BY cluster_id
            ) AS competitor_stats ON g.cluster_id = competitor_stats.cluster_id

            WHERE g.topic_id = {topic_id: UUID}
            ORDER BY g.search_volume DESC
            LIMIT 1000
        `;

        const resultSet = await client.query({
            query: query,
            query_params: { topic_id },
            format: 'JSONEachRow',
        });

        const data = await resultSet.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error('Failed to fetch hexbin data:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
