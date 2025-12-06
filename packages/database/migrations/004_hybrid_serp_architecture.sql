-- 1. cached_serps
-- Stores raw search results from multiple providers.
-- ReplacingMergeTree ensures we keep the latest version for a (keyword, location, device) tuple.
CREATE TABLE IF NOT EXISTS cached_serps (
    id UUID DEFAULT generateUUIDv4(),
    keyword String,
    location String,
    device String,
    provider_source Enum('serper' = 1, 'dataforseo' = 2),
    last_updated DateTime DEFAULT now(),
    raw_data String, -- JSONB equivalent
    is_stale UInt8 DEFAULT 0
) ENGINE = ReplacingMergeTree(last_updated)
ORDER BY (keyword, location, device);

-- 2. keyword_metrics
-- Stores deep metrics (Volume, CPC) usually from DataForSEO.
CREATE TABLE IF NOT EXISTS keyword_metrics (
    keyword String,
    volume UInt32,
    cpc Decimal(10, 2),
    competition_level Float32,
    last_fetched DateTime DEFAULT now(),
    is_stale UInt8 DEFAULT 0
) ENGINE = ReplacingMergeTree(last_fetched)
ORDER BY keyword;

-- 3. competitor_domains
-- Tracks analyzed domains.
CREATE TABLE IF NOT EXISTS competitor_domains (
    domain String,
    trust_flow UInt8,
    organic_traffic_est UInt64,
    referring_domains UInt32,
    last_updated DateTime DEFAULT now(),
    is_stale UInt8 DEFAULT 0
) ENGINE = ReplacingMergeTree(last_updated)
ORDER BY domain;

-- 4. api_usage_logs
-- Tracks costs.
CREATE TABLE IF NOT EXISTS api_usage_logs (
    request_id UUID DEFAULT generateUUIDv4(),
    endpoint_used String,
    provider Enum('serper' = 1, 'dataforseo' = 2),
    cost_in_usd Decimal(10, 4),
    user_id String,
    timestamp DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (user_id, timestamp);

-- 5. weak_domains
-- Dictionary of weak domains for opportunity flagging.
CREATE TABLE IF NOT EXISTS weak_domains (
    domain String
) ENGINE = Set;

-- Seed weak_domains
INSERT INTO weak_domains VALUES 
('reddit.com'), ('quora.com'), ('medium.com'), ('linkedin.com'), ('pinterest.com'),
('facebook.com'), ('twitter.com'), ('instagram.com'), ('youtube.com'), ('tiktok.com'),
('tumblr.com'), ('wordpress.com'), ('blogspot.com'), ('wix.com'), ('weebly.com'),
('squarespace.com'), ('ghost.org'), ('blogger.com'), ('tripadvisor.com'), ('yelp.com'),
('glassdoor.com'), ('indeed.com'), ('craigslist.org'), ('ebay.com'), ('amazon.com'),
('etsy.com'), ('walmart.com'), ('target.com'), ('bestbuy.com'), ('homedepot.com'),
('lowes.com'), ('wayfair.com'), ('overstock.com'), ('newegg.com'), ('zillow.com'),
('trulia.com'), ('realtor.com'), ('apartments.com'), ('redfin.com'), ('airbnb.com'),
('booking.com'), ('expedia.com'), ('kayak.com'), ('skyscanner.com'), ('hotels.com'),
('stackoverflow.com'), ('github.com'), ('gitlab.com'), ('bitbucket.org'), ('sourceforge.net');

-- 6. user_credits (Atomic Deductions)
-- Uses SummingMergeTree for ledger-style accounting.
CREATE TABLE IF NOT EXISTS user_credits (
    user_id String,
    credits Int64,
    timestamp DateTime DEFAULT now()
) ENGINE = SummingMergeTree(credits)
ORDER BY user_id;
