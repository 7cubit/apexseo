# ClickHouse Operations Guide

## Cluster Management

### Starting Services
```bash
docker-compose up -d clickhouse kafka zookeeper
```

### Stopping Services
```bash
docker-compose stop clickhouse kafka zookeeper
```

## Backup & Restore

### Backup (ClickHouse Cloud)
ClickHouse Cloud performs automated daily backups. You can also trigger manual backups via the console.

### Backup (Self-Hosted)
To backup a specific table:
```sql
BACKUP TABLE pages TO Disk('backups', 'pages_backup_v1');
```

To restore:
```sql
RESTORE TABLE pages FROM Disk('backups', 'pages_backup_v1');
```

## Scaling

### Vertical Scaling
Increase `max_memory_usage` in `config.xml` and allocate more RAM to the container/VM.

### Horizontal Scaling
ClickHouse scales horizontally using shards and replicas.
- **Sharding**: Distributes data across multiple nodes.
- **Replication**: Provides high availability.

To add a new shard, update the `remote_servers` configuration in `config.xml` and rebalance data.

## Query Tuning

1. **Use Partitioning**: Ensure queries filter by the partition key (e.g., `toYYYYMM(created_at)`).
2. **Leverage Sorting Keys**: Filter by columns in the `ORDER BY` clause.
3. **Limit Read Columns**: Select only necessary columns (`SELECT *` is expensive).
4. **Materialized Views**: Use MVs for heavy aggregations instead of running them on raw data.

## Kafka Ingestion

### Debugging
If data is not appearing in the destination table:
1. Check `system.kafka_consumers` for lag or errors.
2. Verify the `kafka_broker_list` in the table definition matches the Docker network address.
3. Check ClickHouse logs (`docker logs apexseo-clickhouse-1`) for connection errors.

### Resetting Offsets
To re-consume data, drop and recreate the Kafka engine table with a new consumer group name.
