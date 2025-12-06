import { createClient } from '@clickhouse/client';

const client = createClient({
    url: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
    database: process.env.CLICKHOUSE_DB || 'default',
});

export async function initClickHouseTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS keyword_metrics (
            keyword_id UUID,
            volume UInt32,
            difficulty UInt8,
            cpc Float32,
            updated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY keyword_id`,

        `CREATE TABLE IF NOT EXISTS competitor_coverage_snapshot (
            cluster_id UUID,
            competitor_domain String,
            coverage_percentage Float32,
            avg_rank Float32,
            snapshot_date Date DEFAULT today()
        ) ENGINE = MergeTree()
        ORDER BY (cluster_id, competitor_domain, snapshot_date)`,

        `CREATE TABLE IF NOT EXISTS gap_opportunity_score (
            cluster_id UUID,
            gap_score Float32,
            our_coverage Float32,
            competitor_max_coverage Float32,
            calculated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(calculated_at)
        ORDER BY cluster_id`
    ];

    try {
        console.log("Initializing ClickHouse Tables...");
        for (const query of tables) {
            await client.command({ query });
            console.log(`Executed Table Creation`);
        }
        console.log("ClickHouse Tables Initialized Successfully.");
    } catch (error) {
        console.error("Failed to initialize ClickHouse tables:", error);
    } finally {
        await client.close();
    }
}
