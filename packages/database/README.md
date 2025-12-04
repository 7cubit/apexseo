# Database Architecture

ApexSEO uses a dual-store architecture:
- **ClickHouse**: High-performance time-series analytics and large-scale data storage (Logs, Metrics, Embeddings).
- **Neo4j**: Graph database for managing complex relationships (Link Graph, Clusters, Knowledge Graph).

## Connection Details

Environment variables required in `.env`:

```env
# ClickHouse
CLICKHOUSE_URL=https://...
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=...

# Neo4j
NEO4J_URI=neo4j+s://...
NEO4J_USER=neo4j
NEO4J_PASSWORD=...
```

## Migrations

We use a custom TypeScript migration runner to manage schema changes across both databases.

### Running Migrations

```bash
# Apply pending migrations
npm run migrate
```

### Creating Migrations

1. Create a new file in `packages/database/migrations/` with the format `VVV_description.{sql|cypher}`.
   - `001_initial_schema.sql` (ClickHouse)
   - `002_add_graph_constraints.cypher` (Neo4j)
2. The runner detects the extension and executes against the appropriate database.

## Backup & Restore

### ClickHouse

**Backup**:
ClickHouse Cloud handles automated backups. For manual backups (self-hosted):
```sql
BACKUP TABLE pages TO Disk('backups', 'pages_backup_v1');
```

**Restore**:
```sql
RESTORE TABLE pages FROM Disk('backups', 'pages_backup_v1');
```

### Neo4j

**Backup**:
Neo4j Aura handles automated backups. For manual export:
```bash
neo4j-admin database dump neo4j --to-path=/backups
```

**Restore**:
```bash
neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
```

## Disaster Recovery

- **RPO (Recovery Point Objective)**: 24 hours (Daily backups).
- **RTO (Recovery Time Objective)**: 4 hours.

## Performance Tuning

### ClickHouse
- **Partitioning**: Tables are partitioned by month (`toYYYYMM(created_at)`) to facilitate efficient data dropping.
- **Compression**: `ZSTD(1)` is used for text columns to reduce storage footprint.
- **TTL**: Automatic data expiration (e.g., 90 days for raw crawl data).

### Neo4j
- **Indexes**: Created on frequently queried fields (`url`, `id`).
- **Constraints**: Enforce uniqueness on IDs to prevent duplication.
