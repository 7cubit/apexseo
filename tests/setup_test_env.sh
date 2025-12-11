#!/bin/bash
# Setup script for integration test environment

echo "Setting up integration test environment..."

# Export required environment variables
export NEO4J_URI=${NEO4J_URI:-bolt://localhost:7687}
export NEO4J_USER=${NEO4J_USER:-neo4j}
export NEO4J_PASSWORD=${NEO4J_PASSWORD:-password}

export CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
export CLICKHOUSE_PORT=${CLICKHOUSE_PORT:-9000}
export CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
export CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-CY0_1j2gq1Ki3}
export CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE:-apexseo}

export TEMPORAL_HOST=${TEMPORAL_HOST:-localhost:7233}
export TEMPORAL_ADDRESS=${TEMPORAL_ADDRESS:-$TEMPORAL_HOST}
export TEMPORAL_NAMESPACE=${TEMPORAL_NAMESPACE:-default}

export SIMILARITY_THRESHOLD=${SIMILARITY_THRESHOLD:-0.85}
export EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER:-local}

echo "✓ Environment variables configured"
echo ""
echo "Neo4j:      $NEO4J_URI"
echo "ClickHouse: $CLICKHOUSE_HOST:$CLICKHOUSE_PORT"
echo "Temporal:   $TEMPORAL_HOST"
echo ""
echo "Run the integration test with:"
echo "  ./tests/integration_test.sh"
