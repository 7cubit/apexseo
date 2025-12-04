-- Check System Parts and Compression
SELECT
    database,
    table,
    count() as parts_count,
    formatReadableSize(sum(bytes_on_disk)) as disk_size,
    formatReadableSize(sum(data_uncompressed_bytes)) as uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(bytes_on_disk), 2) as compression_ratio
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY disk_size DESC;

-- Check Kafka Ingestion Lag (if system.kafka_consumers is available)
-- Note: This table might be empty if no consumption is happening or permissions are restricted
SELECT * FROM system.kafka_consumers;

-- Check Query Performance (Slow Queries)
SELECT
    query_start_time,
    query_duration_ms,
    read_rows,
    read_bytes,
    memory_usage,
    query
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 10;

-- Check Background Merges
SELECT
    database,
    table,
    elapsed,
    progress,
    num_parts,
    result_part_name,
    total_size_bytes_compressed,
    memory_usage
FROM system.merges;

-- Check Replication Queue (if using ReplicatedMergeTree)
SELECT * FROM system.replication_queue;
