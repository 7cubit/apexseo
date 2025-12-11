# ApexSEO Integration Tests

## Overview

This directory contains integration tests for the ApexSEO backend logic materialization.

## Test Files

- `test_activities.py` - Unit tests for vector utilities and activity functions
- `integration_test.sh` - End-to-end integration test script
- `setup_test_env.sh` - Environment configuration helper
- `pytest.ini` - Pytest configuration

## Prerequisites

### Required Services

1. **Neo4j** - Running on localhost:7687 (or configure NEO4J_URI)
2. **ClickHouse** - Running on localhost:9000 (or configure CLICKHOUSE_HOST)
3. **Temporal Server** - Running on localhost:7233 (or configure TEMPORAL_HOST)

### Required Tools

- `cypher-shell` (for Neo4j verification)
- `temporal` CLI (for spawning workflows)
- `python` (with dependencies installed)
- `pytest` (for unit tests)

## Running Tests

### 1. Unit Tests

```bash
pip install -r services/compute-worker/requirements.txt
pytest tests/test_activities.py
```

### 2. Integration Tests

```bash
# Setup environment
source tests/setup_test_env.sh

# Run the test suite
./tests/integration_test.sh
```

## Troubleshooting

- **Integration Test Fails**: Ensure all Docker services are running (`docker-compose ps`).
- **Neo4j Connection Error**: Check `NEO4J_PASSWORD` in `setup_test_env.sh`.
- **Worker Not Starting**: Check python dependencies in `services/compute-worker`.

## Integration Test Flow

The integration test (`integration_test.sh`) performs these steps:

1. **Prerequisites Check** - Verifies Neo4j, Temporal CLI, Python, and Node.js are available.
2. **Seed Database** - Creates 4 test pages in Neo4j with known cannibalization scenarios.
3. **Verify Seed Data** - Confirms all test pages were created.
4. **Start Worker** - Launches the Temporal compute worker in background.
5. **Trigger Workflow** - Starts the `CannibalizationWorkflow` via `trigger_workflow.py`.
6. **Wait for Completion** - Polls workflow status (max 30 seconds).
7. **Verify Results** - Checks Neo4j for:
   - Content scores calculated.
   - Cannibalization conflicts detected.
   - `CANNIBALIZES` relationships created.
   - Status fields updated.

## Test Scenarios

### Scenario 1: High Similarity, Different Keywords
- **Pages**: `/seo-tools` and `/keyword-research`
- **Embeddings**: `[0.9, 0.1, 0.0]` and `[0.92, 0.08, 0.0]`
- **Expected**: Cannibalization detected (similarity > 85%, different keywords).

### Scenario 2: Low Similarity, Different Keywords
- **Pages**: `/seo-tools` and `/content-marketing`
- **Embeddings**: `[0.9, 0.1, 0.0]` and `[0.1, 0.9, 0.0]`
- **Expected**: No cannibalization (low similarity).

### Scenario 3: High Similarity, Same Keyword
- **Pages**: `/seo-tools` and `/seo-guide`
- **Keywords**: Both target "seo tools"
- **Expected**: No cannibalization (intentional duplicate targeting).

## Cleanup

The integration test automatically cleans up:
- Temporal worker process (on exit).
- Test data from Neo4j (on exit or error).

Manual cleanup if needed:
```bash
# Kill any lingering python workers
pkill -f "python3 main.py" 

# Clean Neo4j data (via cypher-shell)
MATCH (p:Page {siteId: 'integration-test-site-*'}) DETACH DELETE p;
```
