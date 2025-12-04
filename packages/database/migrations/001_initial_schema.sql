-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    project_id String,
    name String,
    domain String,
    created_at DateTime,
    user_id String
) ENGINE = MergeTree()
ORDER BY (user_id, project_id);

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
TTL crawled_at + INTERVAL 90 DAY;

-- Page Embeddings Table
CREATE TABLE IF NOT EXISTS page_embeddings (
    site_id String,
    page_id String,
    embedding Array(Float32) CODEC(ZSTD(1)),
    cluster_id String
) ENGINE = MergeTree()
ORDER BY (site_id, page_id);

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
ORDER BY (keyword_id, rank);

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
TTL created_at + INTERVAL 1 YEAR;

-- Keyword Metrics Table
CREATE TABLE IF NOT EXISTS keyword_metrics (
    keyword_id String,
    text String CODEC(ZSTD(1)),
    search_volume UInt32,
    difficulty UInt8,
    cpc Float32,
    updated_at DateTime
) ENGINE = MergeTree()
ORDER BY keyword_id;

-- Internal Link Recommendations Table
CREATE TABLE IF NOT EXISTS internal_link_recommendations (
    source_page_id String,
    target_page_id String,
    anchor_text String CODEC(ZSTD(1)),
    relevance_score Float32,
    reason String CODEC(ZSTD(1))
) ENGINE = MergeTree()
ORDER BY (source_page_id, relevance_score);
