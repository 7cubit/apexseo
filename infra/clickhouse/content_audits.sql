-- Content Audits Table
-- Stores semantic content analysis results including NLP term coverage,
-- missing entities, and recommendations based on SERP competitor analysis.

CREATE TABLE IF NOT EXISTS content_audits (
    site_id String,
    page_id String,
    audit_id String,
    audit_date DateTime DEFAULT now(),
    
    -- Semantic Scores
    nlp_term_coverage Float32,          -- 0-100 score: % of competitor terms covered
    semantic_similarity Float32,         -- 0-100 score: cosine similarity to SERP centroid
    content_depth_score Float32,         -- 0-100 combined metric (weighted average)
    
    -- Missing Topics Analysis
    missing_entities Array(String),      -- Entities found in competitors but not in user content
    missing_topics Array(String),        -- Topic clusters missing (future: from clustering)
    competitor_coverage Float32,         -- % of competitor topics covered
    
    -- SERP Context
    serp_keyword String,                 -- The keyword used for SERP analysis
    competitor_count UInt16,             -- Number of competitors analyzed
    user_embedding Array(Float32),       -- User page embedding snapshot (384 dims)
    serp_centroid Array(Float32),        -- SERP competitor centroid (384 dims)
    
    -- Actionable Insights
    recommendations Array(String),       -- Specific, actionable suggestions
    priority String,                     -- 'critical', 'high', 'medium', 'low'
    
    -- Metadata
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
    
) ENGINE = MergeTree()
ORDER BY (site_id, page_id, audit_date)
PARTITION BY toYYYYMM(audit_date)
SETTINGS index_granularity = 8192;

-- Index for fast lookups by page
CREATE INDEX IF NOT EXISTS idx_page_audit ON content_audits (page_id) TYPE minmax GRANULARITY 4;

-- Index for filtering by score
CREATE INDEX IF NOT EXISTS idx_depth_score ON content_audits (content_depth_score) TYPE minmax GRANULARITY 4;
