# Core Data Pipeline & Crawling

This document describes the architecture and usage of the ApexSEO crawling pipeline.

## Architecture

The pipeline consists of:
1.  **API Gateway** (`packages/api`): Exposes endpoints to trigger crawls.
2.  **Temporal Worker (TS)** (`packages/workers`): Orchestrates the crawl using `SiteCrawlWorkflow`.
3.  **Temporal Worker (Python)** (`packages/python-worker`): Performs the actual HTML fetching (`fetch_html` activity).
4.  **ClickHouse**: Stores raw HTML logs (`raw_crawl_log`) and parsed pages (`pages`).
5.  **Neo4j**: Stores the link graph.

## Setup

### Environment Variables

Ensure the following variables are set in `.env`:

```env
# Temporal
TEMPORAL_ADDRESS=localhost:7233

# ClickHouse
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# DataForSEO (Optional)
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
```

### Python Worker

The Python worker requires Python 3.10+.

```bash
cd packages/python-worker
pip install .
python -m src.main
```

Or use Docker:

```bash
docker-compose up -d python-worker
```

## Usage

### Trigger a Crawl

```bash
curl -X POST http://localhost:4000/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "example.com",
    "startUrl": "https://example.com",
    "depth": 2,
    "limit": 100
  }'
```

### Check Status

```bash
curl http://localhost:4000/crawl/<workflow-id>
```

## Testing

Run the integration test:

```bash
npx ts-node scripts/test-crawl.ts
```
