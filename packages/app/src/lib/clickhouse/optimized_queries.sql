-- ==========================================
-- ApexSEO ClickHouse Optimization
-- Target: Hexbin Visualization < 500ms
-- ==========================================

-- ------------------------------------------
-- 1. MATERIALIZED VIEW (Recommended)
-- ------------------------------------------
-- Rationale: Joining large tables at query time is slow. 
-- We pre-join the Gap Matrix (Scores) with the Snapshot (Metrics) 
-- and aggregate competitor data into a single row per cluster.

-- Target Table for MV
CREATE TABLE IF NOT EXISTS hexbin_fast_cache (
    snapshot_date Date,
    cluster_id UUID,
    topic_id UUID,
    
    -- Denormalized Display Data
    cluster_name String,
    
    -- Metrics for Coloring/Sizing
    search_volume UInt32,
    avg_difficulty Float32,
    gap_score Float32,
    opportunity_level Enum8('UNKNOWN'=0, 'LOW'=1, 'MEDIUM'=2, 'HIGH'=3, 'OWNED'=4),
    your_coverage Float32,
    
    -- Top 3 Competitors (Aggregated Array)
    -- Format: [(domain, coverage_%), ...]
    top_competitors Array(Tuple(String, Float32)),
    
    updated_at DateTime
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (snapshot_date, topic_id, cluster_id);

-- Materialized View Definition
-- Triggers on insert to cluster_metrics_snapshot
CREATE MATERIALIZED VIEW IF NOT EXISTS hexbin_mv TO hexbin_fast_cache AS
SELECT
    s.snapshot_date,
    s.cluster_id,
    s.topic_id,
    
    -- Take any(cluster_name) since it's the same for the group
    any(s.cluster_name) as cluster_name,
    
    -- Metrics from Snapshot (Your Data)
    max(s.total_volume) as search_volume,
    avg(s.avg_difficulty) as avg_difficulty,
    
    -- Join with Gap Matrix (Lookup latest score)
    -- Note: In MV, we might not be able to join efficiently if tables are on different shards.
    -- Better approach for MV: Aggregate from the snapshot alone if possible, 
    -- or use a dictionary for Gap Scores.
    -- However, for this specific "Join" requirement, a standard VIEW or optimized SELECT is often safer 
    -- than a complex MV with JOINs which can be flaky in distributed setups.
    
    -- ALTERNATIVE STRATEGY FOR MV:
    -- Just aggregate the Competitor Data (the expensive part) and join Gap Score at query time.
    
    -- Let's stick to the "Optimized Query" approach first as requested by the prompt's "OPTIMIZED QUERY" section,
    -- but providing the MV structure for the "Pre-compute" technique.
    
    -- ... (MV Logic would go here if fully implemented) ...
    
    0.0 as gap_score, -- Placeholder, would need join
    'UNKNOWN' as opportunity_level, -- Placeholder
    max(s.your_coverage_percentage) as your_coverage,
    
    -- Aggregate Top Competitors
    arraySlice(
        arraySort(
            x -> -x.2, -- Sort by coverage descending
            groupArray(tuple(s.competitor_domain, s.competitor_coverage_percentage))
        ),
        1, 3
    ) as top_competitors,
    
    now() as updated_at

FROM cluster_metrics_snapshot s
GROUP BY s.snapshot_date, s.cluster_id, s.topic_id;


-- ------------------------------------------
-- 2. OPTIMIZED QUERY (The Solution)
-- ------------------------------------------
-- This query fetches everything needed for the Hexbin in one go.
-- It assumes we are querying the raw tables (no MV) but optimized.

SELECT
    g.cluster_id,
    g.cluster_name,
    g.gap_score,
    g.opportunity_level,
    g.search_volume,
    g.avg_difficulty,
    g.your_coverage,
    
    -- Efficiently aggregate competitor data from the snapshot table
    -- We use a subquery to aggregate competitors first, then join.
    competitor_stats.top_competitors as top_competitors

FROM gap_opportunity_matrix g

-- Join with pre-aggregated competitor stats
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
    PREWHERE snapshot_date = today() -- Critical: Filter partitions early
    GROUP BY cluster_id
) AS competitor_stats ON g.cluster_id = competitor_stats.cluster_id

WHERE g.topic_id = {topic_id: UUID} -- Parameterized
  AND g.cluster_id IN (
      -- Optional: Filter to clusters actually in the snapshot if needed
      SELECT cluster_id FROM cluster_metrics_snapshot WHERE snapshot_date = today()
  )

ORDER BY g.search_volume DESC
LIMIT 1000;

-- ------------------------------------------
-- 3. EXPLANATION OF OPTIMIZATIONS
-- ------------------------------------------
-- 1. PREWHERE: Used in the subquery `PREWHERE snapshot_date = today()`. 
--    This tells ClickHouse to filter by the partition key *before* reading other columns, 
--    drastically reducing I/O.
--
-- 2. Aggregation: `groupArray` + `arraySort` + `arraySlice` is the standard, fast way 
--    to get "Top N" items per group in ClickHouse without window functions (which can be slower).
--
-- 3. Column Pruning: We only select `competitor_domain` and `competitor_coverage_percentage` 
--    in the subquery, avoiding reading heavy columns like `total_traffic_estimate`.
--
-- 4. Join Order: We start with `gap_opportunity_matrix` (smaller, 1 row per cluster) 
--    and join the aggregated stats. This is generally faster than starting with the large table.
