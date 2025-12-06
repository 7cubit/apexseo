-- ==========================================
-- ApexSEO ClickHouse Schema (Production)
-- Target Version: ClickHouse 24.x
-- Optimized for: Real-time Hexbin Rendering (<500ms)
-- ==========================================

-- ------------------------------------------
-- 1. TABLE DEFINITIONS
-- ------------------------------------------

-- TABLE 1: cluster_metrics_snapshot
-- Purpose: Daily snapshot of cluster coverage metrics for historical trending.
CREATE TABLE IF NOT EXISTS cluster_metrics_snapshot (
    snapshot_date Date CODEC(Delta, ZSTD), -- Partition key, Delta compression for sequential dates
    cluster_id UUID,
    cluster_name String, -- Denormalized for fast UI access
    topic_id UUID,
    
    -- Cluster Totals
    total_keywords UInt16,
    total_volume UInt32,
    avg_difficulty Float32,
    
    -- Your Metrics
    your_coverage_count UInt16,
    your_coverage_percentage Float32,
    your_avg_position Float32,
    your_total_traffic_estimate UInt32,
    
    -- Competitor Metrics
    competitor_domain String, -- Low cardinality usually, but String is fine
    competitor_authority_score Float32,
    competitor_coverage_count UInt16,
    competitor_coverage_percentage Float32,
    competitor_avg_position Float32,
    competitor_total_traffic_estimate UInt32,
    
    last_updated DateTime
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(snapshot_date) -- Monthly partitions for manageable parts
ORDER BY (snapshot_date, cluster_id, competitor_domain) -- Primary sort key for fast retrieval
SETTINGS index_granularity = 8192;

-- TABLE 2: gap_opportunity_matrix
-- Purpose: Pre-calculated scores for instant "Traffic Light" UI rendering.
-- Uses ReplacingMergeTree to keep only the latest calculation per cluster.
CREATE TABLE IF NOT EXISTS gap_opportunity_matrix (
    cluster_id UUID,
    cluster_name String,
    topic_id UUID,
    
    -- Core Metrics
    your_coverage Float32,
    max_competitor_coverage Float32,
    avg_competitor_coverage Float32,
    search_volume UInt32,
    avg_difficulty Float32,
    
    -- Calculated Scores
    gap_score Float32, -- 0.0 to 1.0
    opportunity_level Enum8(
        'UNKNOWN' = 0, 
        'LOW' = 1, 
        'MEDIUM' = 2, 
        'HIGH' = 3, 
        'OWNED' = 4
    ),
    gap_keywords_count UInt16,
    
    calculated_at DateTime,
    expires_at DateTime
)
ENGINE = ReplacingMergeTree(calculated_at) -- Replaces older rows based on calculated_at
ORDER BY (cluster_id); -- Fast lookups by cluster ID

-- TABLE 3: keyword_metrics_raw
-- Purpose: Single source of truth for keyword data.
CREATE TABLE IF NOT EXISTS keyword_metrics_raw (
    keyword_id UUID,
    keyword_text String,
    cluster_id UUID,
    topic_id UUID,
    
    -- Metrics
    search_volume UInt32,
    keyword_difficulty UInt8,
    cpc Float32,
    serp_competitor_count UInt16,
    
    intent Enum8(
        'informational' = 1, 
        'commercial' = 2, 
        'transactional' = 3, 
        'navigational' = 4
    ),
    
    updated_at DateTime,
    data_source Enum8('DataForSEO' = 1, 'Internal' = 2, 'Manual' = 3),
    is_active UInt8 DEFAULT 1
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(toDate(updated_at))
ORDER BY (cluster_id, keyword_id); -- Optimized for fetching all keywords in a cluster

-- OPTIONAL: cluster_keyword_stats (Pre-aggregated)
-- Purpose: Ultra-fast hexbin rendering source.
CREATE TABLE IF NOT EXISTS cluster_keyword_stats (
    snapshot_date Date,
    cluster_id UUID,
    topic_id UUID,
    
    total_keywords UInt16,
    total_volume UInt32,
    avg_difficulty Float32,
    coverage_by_us UInt16,
    
    -- Nested structure for top competitors summary
    competitors_summary Array(Tuple(String, UInt16, Float32)), -- (domain, count, percentage)
    
    calculated_at DateTime
)
ENGINE = ReplacingMergeTree(calculated_at)
ORDER BY (snapshot_date, cluster_id);

-- ------------------------------------------
-- 2. SAMPLE DATA INSERTION
-- ------------------------------------------

-- Insert Keywords (Kyoto Topic)
INSERT INTO keyword_metrics_raw (keyword_id, keyword_text, cluster_id, topic_id, search_volume, keyword_difficulty, cpc, serp_competitor_count, intent, updated_at, data_source) VALUES
(generateUUIDv4(), 'JR Pass Kyoto price', 'd8f1a3b2-1111-4444-8888-123456789001', 'd8f1a3b2-0000-0000-0000-123456789000', 12400, 28, 2.50, 8, 'commercial', now(), 'DataForSEO'),
(generateUUIDv4(), 'Kyoto bus pass one day', 'd8f1a3b2-1111-4444-8888-123456789001', 'd8f1a3b2-0000-0000-0000-123456789000', 8900, 31, 1.80, 5, 'transactional', now(), 'DataForSEO'),
(generateUUIDv4(), 'Tokyo to Kyoto shinkansen cost', 'd8f1a3b2-1111-4444-8888-123456789001', 'd8f1a3b2-0000-0000-0000-123456789000', 22100, 35, 0.80, 12, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Kyoto subway map english', 'd8f1a3b2-1111-4444-8888-123456789001', 'd8f1a3b2-0000-0000-0000-123456789000', 15200, 29, 0.50, 6, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Kyoto taxi prices', 'd8f1a3b2-1111-4444-8888-123456789001', 'd8f1a3b2-0000-0000-0000-123456789000', 9800, 26, 2.10, 7, 'commercial', now(), 'DataForSEO'),
(generateUUIDv4(), 'Fushimi Inari shrine hike', 'd8f1a3b2-2222-4444-8888-123456789002', 'd8f1a3b2-0000-0000-0000-123456789000', 45600, 48, 0.75, 22, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Golden Pavilion opening hours', 'd8f1a3b2-2222-4444-8888-123456789002', 'd8f1a3b2-0000-0000-0000-123456789000', 67800, 52, 0.65, 35, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Kiyomizu-dera entrance fee', 'd8f1a3b2-2222-4444-8888-123456789002', 'd8f1a3b2-0000-0000-0000-123456789000', 38900, 51, 1.20, 28, 'transactional', now(), 'DataForSEO'),
(generateUUIDv4(), 'Arashiyama bamboo grove best time', 'd8f1a3b2-2222-4444-8888-123456789002', 'd8f1a3b2-0000-0000-0000-123456789000', 34900, 59, 0.70, 40, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Best kaiseki dining kyoto', 'd8f1a3b2-3333-4444-8888-123456789003', 'd8f1a3b2-0000-0000-0000-123456789000', 18700, 45, 3.50, 18, 'commercial', now(), 'DataForSEO'),
(generateUUIDv4(), 'Kyoto ramen street', 'd8f1a3b2-3333-4444-8888-123456789003', 'd8f1a3b2-0000-0000-0000-123456789000', 22100, 49, 0.60, 25, 'informational', now(), 'DataForSEO'),
(generateUUIDv4(), 'Nishiki market food tour', 'd8f1a3b2-3333-4444-8888-123456789003', 'd8f1a3b2-0000-0000-0000-123456789000', 15500, 50, 2.80, 14, 'commercial', now(), 'DataForSEO'),
(generateUUIDv4(), 'Best ryokan with onsen kyoto', 'd8f1a3b2-4444-4444-8888-123456789004', 'd8f1a3b2-0000-0000-0000-123456789000', 28900, 56, 4.20, 32, 'commercial', now(), 'DataForSEO'),
(generateUUIDv4(), 'Rent machiya house kyoto', 'd8f1a3b2-4444-4444-8888-123456789004', 'd8f1a3b2-0000-0000-0000-123456789000', 19300, 60, 3.90, 16, 'transactional', now(), 'DataForSEO');

-- Insert Gap Opportunity Matrix Data (Pre-calculated)
INSERT INTO gap_opportunity_matrix (cluster_id, cluster_name, topic_id, your_coverage, max_competitor_coverage, avg_competitor_coverage, search_volume, avg_difficulty, gap_score, opportunity_level, gap_keywords_count, calculated_at, expires_at) VALUES
('d8f1a3b2-1111-4444-8888-123456789001', 'Kyoto Transportation Guide', 'd8f1a3b2-0000-0000-0000-123456789000', 85.0, 90.0, 75.0, 68400, 32.5, 0.15, 'OWNED', 1, now(), now() + INTERVAL 1 DAY),
('d8f1a3b2-2222-4444-8888-123456789002', 'Temples and Shrines', 'd8f1a3b2-0000-0000-0000-123456789000', 25.0, 95.0, 80.0, 187300, 54.0, 0.88, 'HIGH', 3, now(), now() + INTERVAL 1 DAY),
('d8f1a3b2-3333-4444-8888-123456789003', 'Kyoto Food Guide', 'd8f1a3b2-0000-0000-0000-123456789000', 33.0, 70.0, 50.0, 56300, 48.0, 0.62, 'MEDIUM', 2, now(), now() + INTERVAL 1 DAY),
('d8f1a3b2-4444-4444-8888-123456789004', 'Where to Stay', 'd8f1a3b2-0000-0000-0000-123456789000', 0.0, 85.0, 60.0, 48200, 58.0, 0.79, 'HIGH', 2, now(), now() + INTERVAL 1 DAY);


-- Insert Cluster Metrics Snapshot (Historical)
INSERT INTO cluster_metrics_snapshot (snapshot_date, cluster_id, cluster_name, topic_id, total_keywords, total_volume, avg_difficulty, your_coverage_count, your_coverage_percentage, your_avg_position, your_total_traffic_estimate, competitor_domain, competitor_authority_score, competitor_coverage_count, competitor_coverage_percentage, competitor_avg_position, competitor_total_traffic_estimate, last_updated) VALUES
(today(), 'd8f1a3b2-1111-4444-8888-123456789001', 'Kyoto Transportation Guide', 'd8f1a3b2-0000-0000-0000-123456789000', 5, 68400, 32.5, 4, 80.0, 3.5, 12000, 'lonelyplanet.com', 85.0, 5, 100.0, 1.2, 25000, now()),
(today(), 'd8f1a3b2-1111-4444-8888-123456789001', 'Kyoto Transportation Guide', 'd8f1a3b2-0000-0000-0000-123456789000', 5, 68400, 32.5, 4, 80.0, 3.5, 12000, 'japan-guide.com', 78.0, 4, 80.0, 2.1, 18000, now()),
(today(), 'd8f1a3b2-2222-4444-8888-123456789002', 'Temples and Shrines', 'd8f1a3b2-0000-0000-0000-123456789000', 4, 187300, 54.0, 1, 25.0, 8.0, 1500, 'lonelyplanet.com', 85.0, 4, 100.0, 1.5, 80000, now()),
(today(), 'd8f1a3b2-2222-4444-8888-123456789002', 'Temples and Shrines', 'd8f1a3b2-0000-0000-0000-123456789000', 4, 187300, 54.0, 1, 25.0, 8.0, 1500, 'japan-guide.com', 78.0, 4, 100.0, 2.5, 65000, now());


-- ------------------------------------------
-- 3. AGGREGATION QUERIES
-- ------------------------------------------

-- Query A: Fetch hexbin data for a topic (all clusters + colors)
-- Used for: Main Dashboard Visualization
SELECT 
    cluster_id,
    cluster_name,
    search_volume,
    avg_difficulty,
    gap_score,
    opportunity_level,
    your_coverage,
    max_competitor_coverage
FROM gap_opportunity_matrix
WHERE topic_id = 'd8f1a3b2-0000-0000-0000-123456789000' -- Replace with actual Topic UUID
ORDER BY search_volume DESC;

-- Query B: Calculate gap_score for all clusters (On-the-fly calculation example)
-- Note: Usually we query the pre-calculated table, but this shows the logic.
SELECT
    cluster_id,
    cluster_name,
    (
        (max_competitor_coverage * 0.4) +
        (log10(search_volume + 1) / 5 * 0.4) + -- Normalized volume approx
        ((100 - avg_difficulty) / 100 * 0.2)   -- Inverse difficulty
    ) - (your_coverage * 0.8) AS calculated_gap_score
FROM gap_opportunity_matrix
WHERE topic_id = 'd8f1a3b2-0000-0000-0000-123456789000';

-- Query C: Compare YOUR coverage vs specific COMPETITOR coverage
-- Used for: "Competitor Face-off" chart
SELECT
    cluster_name,
    your_coverage_percentage,
    competitor_coverage_percentage,
    (competitor_coverage_percentage - your_coverage_percentage) as coverage_gap
FROM cluster_metrics_snapshot
WHERE snapshot_date = today()
  AND competitor_domain = 'japan-guide.com'
ORDER BY coverage_gap DESC;

-- Query D: Find top 10 HIGH opportunity clusters (RED hexagons)
-- Used for: "Quick Wins" sidebar
SELECT
    cluster_name,
    gap_score,
    search_volume,
    gap_keywords_count
FROM gap_opportunity_matrix
WHERE opportunity_level = 'HIGH'
ORDER BY gap_score DESC
LIMIT 10;

-- Query E: Generate coverage trend (week-over-week change)
-- Used for: "Progress Report" sparklines
SELECT
    snapshot_date,
    avg(your_coverage_percentage) as avg_daily_coverage,
    sum(your_total_traffic_estimate) as total_traffic_estimate
FROM cluster_metrics_snapshot
WHERE snapshot_date >= today() - 7
GROUP BY snapshot_date
ORDER BY snapshot_date ASC;

-- ------------------------------------------
-- 4. PERFORMANCE OPTIMIZATION TIPS
-- ------------------------------------------
-- 1. Partitioning: We use monthly partitions (toYYYYMM) to keep parts manageable but allow fast date-range drops.
-- 2. Ordering: The ORDER BY clause is critical. We order by (snapshot_date, cluster_id) to ensure data for the same day/cluster is physically adjacent on disk.
-- 3. Types: Used Float32 instead of Float64 to save 50% RAM/Disk for metrics. Used Enum8 for low-cardinality strings.
-- 4. Codecs: Used CODEC(Delta, ZSTD) for dates to maximize compression of sequential data.
-- 5. Engines: ReplacingMergeTree is used for the Matrix table to handle idempotent updates without duplicates.
