# Neo4j Operations Guide

## Cluster Management

### Starting Services
```bash
docker-compose up -d neo4j
```

### Stopping Services
```bash
docker-compose stop neo4j
```

## Memory Configuration
Neo4j memory settings are configured in `docker-compose.yml`:
- `NEO4J_dbms_memory_heap_initial__size`: Initial heap size (e.g., 512m)
- `NEO4J_dbms_memory_heap_max__size`: Max heap size (e.g., 1G)
- `NEO4J_dbms_memory_pagecache_size`: Page cache size (e.g., 512m)

Adjust these values based on available system RAM and graph size.

## Graph Algorithms (GDS)

### Running Algorithms
Algorithms are defined in `packages/database/neo4j/algorithms.cypher`.
To run them manually via Cypher Shell:
```bash
cat packages/database/neo4j/algorithms.cypher | docker exec -i apexseo-neo4j-1 cypher-shell -u neo4j -p password
```

### Projections
Always drop projected graphs after use to free up memory:
```cypher
CALL gds.graph.drop('graphName');
```

## Backup & Restore

### Backup
```bash
docker exec apexseo-neo4j-1 neo4j-admin database dump neo4j --to-path=/backups
```

### Restore
```bash
docker exec apexseo-neo4j-1 neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
```

## Data Import
Use the import script for bulk CSV loading:
```bash
npx ts-node packages/database/scripts/import-graph-data.ts /path/to/data.csv
```
