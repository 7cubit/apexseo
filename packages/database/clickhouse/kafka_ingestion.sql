-- Kafka Engine Table for Page Events
CREATE TABLE IF NOT EXISTS page_events_queue (
    site_id String,
    page_id String,
    url String,
    event_type String,
    payload String,
    timestamp DateTime
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'kafka:29092',
    kafka_topic_list = 'page_events',
    kafka_group_name = 'clickhouse_page_events_consumer',
    kafka_format = 'JSONEachRow';

-- Destination Table for Page Events
CREATE TABLE IF NOT EXISTS page_events (
    site_id String,
    page_id String,
    url String,
    event_type String,
    payload String,
    timestamp DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (site_id, timestamp)
TTL timestamp + INTERVAL 30 DAY;

-- Materialized View to Move Data from Queue to Destination
CREATE MATERIALIZED VIEW IF NOT EXISTS page_events_mv TO page_events AS
SELECT
    site_id,
    page_id,
    url,
    event_type,
    payload,
    timestamp
FROM page_events_queue;
