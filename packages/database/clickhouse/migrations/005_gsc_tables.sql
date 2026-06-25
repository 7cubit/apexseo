-- GSC Connections Table (PostgreSQL - for auth tokens)
-- This should be added to the PostgreSQL schema, not ClickHouse
-- Location: packages/database/postgres/migrations/

-- GSC Search Analytics Table (ClickHouse)
CREATE TABLE IF NOT EXISTS gsc_search_analytics (
    site_url String,
    project_id String,
    query String CODEC(ZSTD(1)),
    page String CODEC(ZSTD(1)),
    date Date,
    clicks UInt32,
    impressions UInt32,
    ctr Float32,
    position Float32,
    country String DEFAULT 'ALL',
    device String DEFAULT 'ALL',
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (site_url, date, query, page)
TTL date + INTERVAL 365 DAY;

-- Materialized View for Daily Aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS gsc_daily_summary
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (site_url, project_id, date)
AS SELECT
    site_url,
    project_id,
    date,
    sum(clicks) as total_clicks,
    sum(impressions) as total_impressions,
    avg(ctr) as avg_ctr,
    avg(position) as avg_position,
    count(DISTINCT query) as unique_queries,
    count(DISTINCT page) as unique_pages
FROM gsc_search_analytics
GROUP BY site_url, project_id, date;

-- Top Queries Materialized View (Last 30 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS gsc_top_queries_30d
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (site_url, project_id, query)
AS SELECT
    site_url,
    project_id,
    query,
    date,
    sumState(clicks) as total_clicks,
    sumState(impressions) as total_impressions,
    avgState(position) as avg_position,
    avgState(ctr) as avg_ctr
FROM gsc_search_analytics
WHERE date >= today() - 30
GROUP BY site_url, project_id, query, date;

-- Page Performance View
CREATE MATERIALIZED VIEW IF NOT EXISTS gsc_page_performance
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (site_url, project_id, page)
AS SELECT
    site_url,
    project_id,
    page,
    date,
    sumState(clicks) as total_clicks,
    sumState(impressions) as total_impressions,
    avgState(position) as avg_position,
    countDistinctState(query) as unique_queries
FROM gsc_search_analytics
GROUP BY site_url, project_id, page, date;
