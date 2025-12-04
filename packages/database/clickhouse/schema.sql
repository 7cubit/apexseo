-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    project_id String,
    name String,
    domain String,
    created_at DateTime,
    user_id String
) ENGINE = MergeTree()
ORDER BY (user_id, project_id)
SETTINGS index_granularity = 8192;

-- Pages Table (Enriched)
CREATE TABLE IF NOT EXISTS pages (
    site_id String,
    page_id String,
    url String CODEC(ZSTD(1)),
    title String CODEC(ZSTD(1)),
    h1 String CODEC(ZSTD(1)),
    content String CODEC(ZSTD(3)),
    word_count UInt32,
    status String,
    crawled_at DateTime,
    content_score Float32,
    is_orphan UInt8,
    canonical_id String,
    link_count_internal UInt32,
    link_count_external UInt32,
    keywords Array(String) CODEC(ZSTD(1))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(crawled_at)
ORDER BY (site_id, page_id)
TTL crawled_at + INTERVAL 90 DAY
SETTINGS index_granularity = 8192, merge_with_ttl_timeout = 3600;

-- Page Embeddings Table
CREATE TABLE IF NOT EXISTS page_embeddings (
    site_id String,
    page_id String,
    embedding Array(Float32) CODEC(ZSTD(1)),
    cluster_id String
) ENGINE = MergeTree()
ORDER BY (site_id, page_id)
SETTINGS index_granularity = 8192;

-- SERP Competitors Table
CREATE TABLE IF NOT EXISTS serp_competitors (
    keyword_id String,
    rank UInt8,
    url String CODEC(ZSTD(1)),
    domain String,
    title String CODEC(ZSTD(1)),
    word_count UInt32,
    content_score Float32
) ENGINE = MergeTree()
ORDER BY (keyword_id, rank)
SETTINGS index_granularity = 8192;

-- Audits Table
CREATE TABLE IF NOT EXISTS audits (
    page_id String,
    audit_id String,
    created_at DateTime,
    content_score Float32,
    structure_score Float32,
    missing_keywords Array(String) CODEC(ZSTD(1)),
    nlp_term_coverage Float32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (page_id, created_at)
TTL created_at + INTERVAL 1 YEAR
SETTINGS index_granularity = 8192;

-- Keyword Metrics Table
CREATE TABLE IF NOT EXISTS keyword_metrics (
    keyword_id String,
    text String CODEC(ZSTD(1)),
    search_volume UInt32,
    difficulty UInt8,
    cpc Float32,
    updated_at DateTime
) ENGINE = MergeTree()
ORDER BY keyword_id
SETTINGS index_granularity = 8192;

-- Internal Link Recommendations Table
CREATE TABLE IF NOT EXISTS internal_link_recommendations (
    source_page_id String,
    target_page_id String,
    anchor_text String CODEC(ZSTD(1)),
    relevance_score Float32,
    reason String CODEC(ZSTD(1))
) ENGINE = MergeTree()
ORDER BY (source_page_id, relevance_score)
SETTINGS index_granularity = 8192;

-- Aggregated Daily Metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
    date Date,
    site_id String,
    pages_crawled SimpleAggregateFunction(sum, UInt64),
    avg_content_score SimpleAggregateFunction(avg, Float64)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (site_id, date);

-- Materialized View for Daily Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_metrics_mv TO daily_metrics AS
SELECT
    toDate(crawled_at) as date,
    site_id,
    sum(1) as pages_crawled,
    avg(content_score) as avg_content_score
FROM pages
GROUP BY site_id, date;

-- API Usage Logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
    request_id String,
    account_id String,
    api_key_id String,
    endpoint String,
    method String,
    status_code UInt16,
    duration_ms UInt32,
    timestamp DateTime,
    ip_address String,
    user_agent String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (account_id, timestamp)
TTL timestamp + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;
