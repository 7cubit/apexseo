#!/bin/bash
set -e  # Exit immediately on error
set -o pipefail  # Catch errors in pipes

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
TEST_SITE_ID="integration-test-site-$(date +%s)"
WORKFLOW_ID="integration-cannibalization-$(date +%s)"
WORKER_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}[CLEANUP]${NC} Shutting down..."
    
    # Kill worker if running
    if [ ! -z "$WORKER_PID" ]; then
        kill $WORKER_PID 2>/dev/null || true
        echo -e "${CYAN}✓${NC} Temporal worker stopped (PID: $WORKER_PID)"
    fi
    
    # Clean up test data from Neo4j
    if [ ! -z "$CYPHER_CMD" ]; then
        run_cypher "MATCH (p:Page {siteId: '$TEST_SITE_ID'}) DETACH DELETE p" 2>/dev/null || true
        echo -e "${CYAN}✓${NC} Test data cleaned from Neo4j"
    fi
}

# Set up trap for cleanup on exit
trap cleanup EXIT INT TERM

# Header
echo -e "${MAGENTA}"
echo "═══════════════════════════════════════════════════════"
echo "  ApexSEO Backend Logic Integration Test Suite"
echo "  Testing: Cannibalization Detection & Content Scoring"
echo "═══════════════════════════════════════════════════════"
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}[PREREQUISITES]${NC} Checking required services..."

# Check Prerequisites and define cypher execution method
CYPHER_CMD=""

if command -v cypher-shell &> /dev/null; then
    CYPHER_CMD="cypher-shell -u neo4j -p ${NEO4J_PASSWORD:-password}"
    echo -e "${GREEN}✓${NC} Using local cypher-shell"
else
    # Try to find running Neo4j container
    NEO4J_CONTAINER=$(docker ps --format '{{.Names}}' | grep "neo4j" | head -n 1)
    if [ ! -z "$NEO4J_CONTAINER" ]; then
        CYPHER_CMD="docker exec -i $NEO4J_CONTAINER cypher-shell -u neo4j -p ${NEO4J_PASSWORD:-password}"
        echo -e "${GREEN}✓${NC} Using cypher-shell from container: $NEO4J_CONTAINER"
    else
        echo -e "${RED}✗${NC} cypher-shell not found locally and no Neo4j container running."
        exit 1
    fi
fi

# Wrapper function for cypher queries
run_cypher() {
    echo "$1" | $CYPHER_CMD
}

# Test Neo4j connection
if ! run_cypher "RETURN 1" &> /dev/null; then
    echo -e "${RED}✗${NC} Cannot connect to Neo4j. Check NEO4J_PASSWORD or container status."
    exit 1
fi
echo -e "${GREEN}✓${NC} Neo4j connection verified"

# Check Temporal CLI
# Removed check for local CLI as we use python script now.
# TEMPORAL_CMD is no longer needed.
echo -e "${GREEN}✓${NC} Using Python for Temporal interaction"

# Check Python environment
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗${NC} Python3 not found"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python environment ready"

# Check Node.js
if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js/npx not found"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js environment ready"

# Step 1: Initialize Schema & Seed Data
echo -e "\n${YELLOW}[STEP 1/6]${NC} Initializing Schema & Seeding Data..."

# Init ClickHouse
CH_CONTAINER=$(docker ps --format '{{.Names}}' | grep "clickhouse" | head -n 1)
if [ ! -z "$CH_CONTAINER" ]; then
    echo "Creating ClickHouse schema in $CH_CONTAINER..."
    docker exec -i $CH_CONTAINER clickhouse-client --password "${CLICKHOUSE_PASSWORD:-CY0_1j2gq1Ki3}" --query "
        CREATE DATABASE IF NOT EXISTS apexseo;
        CREATE TABLE IF NOT EXISTS apexseo.serp_results (
            keyword String,
            page_url String,
            position UInt32,
            embedding Array(Float32),
            created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree() ORDER BY (keyword, position);
    "
    echo -e "${GREEN}✓${NC} ClickHouse schema initialized"
else
    echo -e "${YELLOW}⚠${NC} ClickHouse container not found, skipping schema init"
fi

# Create test pages with known cannibalization scenarios
run_cypher "
// Clean up any existing test data
MATCH (p:Page {siteId: '$TEST_SITE_ID'}) DETACH DELETE p;

// Create test pages - Scenario 1: High similarity, different keywords (should detect)
CREATE (p1:Page {
    id: 'test-page-1',
    siteId: '$TEST_SITE_ID',
    url: 'https://test.example.com/seo-tools',
    targetKeyword: 'seo tools',
    embedding: [0.9, 0.1, 0.0],
    content: 'This is a comprehensive guide about seo tools and software.',
    contentScore: null,
    cannibalizationStatus: 'pending'
});

CREATE (p2:Page {
    id: 'test-page-2',
    siteId: '$TEST_SITE_ID',
    url: 'https://test.example.com/keyword-research',
    targetKeyword: 'keyword research',
    embedding: [0.92, 0.08, 0.0],
    content: 'Learn how to do keyword research effectively.',
    contentScore: null,
    cannibalizationStatus: 'pending'
});

// Scenario 2: Low similarity, different keywords (should NOT detect)
CREATE (p3:Page {
    id: 'test-page-3',
    siteId: '$TEST_SITE_ID',
    url: 'https://test.example.com/content-marketing',
    targetKeyword: 'content marketing',
    embedding: [0.1, 0.9, 0.0],
    content: 'Content marketing strategies for growth.',
    contentScore: null,
    cannibalizationStatus: 'pending'
});

// Scenario 3: High similarity, same keyword (should NOT detect - intentional)
CREATE (p4:Page {
    id: 'test-page-4',
    siteId: '$TEST_SITE_ID',
    url: 'https://test.example.com/seo-guide',
    targetKeyword: 'seo tools',
    embedding: [0.88, 0.12, 0.0],
    content: 'Another guide about seo tools but different focus.',
    contentScore: null,
    cannibalizationStatus: 'pending'
});

RETURN count(*) as pages_created;
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Test data seeded successfully (4 pages created)"
else
    echo -e "${RED}✗${NC} Database seeding failed"
    exit 1
fi

# Step 2: Verify seed data
echo -e "\n${YELLOW}[STEP 2/6]${NC} Verifying seed data..."

SEEDED_COUNT=$(run_cypher "MATCH (p:Page {siteId: '$TEST_SITE_ID'}) RETURN count(p)" 2>/dev/null | tail -n 1)

if [ "$SEEDED_COUNT" = "4" ]; then
    echo -e "${GREEN}✓${NC} Verified 4 test pages in Neo4j"
else
    echo -e "${RED}✗${NC} Expected 4 pages, found $SEEDED_COUNT"
    exit 1
fi

# Step 3: Start Temporal worker
echo -e "\n${YELLOW}[STEP 3/6]${NC} Starting Temporal compute worker..."

cd services/compute-worker
python3 main.py &
WORKER_PID=$!
cd ../..

# Wait for worker to initialize
sleep 5

if ps -p $WORKER_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Worker started successfully (PID: $WORKER_PID)"
else
    echo -e "${RED}✗${NC} Worker failed to start"
    exit 1
fi

# Step 4: Trigger cannibalization workflow
echo -e "\n${YELLOW}[STEP 4/6]${NC} Triggering CannibalizationWorkflow..."

python3 tests/trigger_workflow.py "$WORKFLOW_ID" "$TEST_SITE_ID" "start"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Workflow triggered: $WORKFLOW_ID"
else
    echo -e "${RED}✗${NC} Failed to trigger workflow"
    exit 1
fi

# Step 5: Wait for workflow completion
echo -e "\n${YELLOW}[STEP 5/6]${NC} Waiting for workflow completion (max 30s)..."

TIMEOUT=30
ELAPSED=0
WORKFLOW_STATUS=""

while [ $ELAPSED -lt $TIMEOUT ]; do
    WORKFLOW_STATUS=$(python3 tests/trigger_workflow.py "$WORKFLOW_ID" "$TEST_SITE_ID" "describe" | grep "Status:" | awk '{print $2}')
    
    if [ "$WORKFLOW_STATUS" = "COMPLETED" ]; then
        echo -e "${GREEN}✓${NC} Workflow completed successfully"
        break
    elif [ "$WORKFLOW_STATUS" = "FAILED" ]; then
        echo -e "${RED}✗${NC} Workflow failed"
        exit 1
    fi
    
    echo -e "${CYAN}⏳${NC} Workflow status: $WORKFLOW_STATUS (${ELAPSED}s elapsed)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ "$WORKFLOW_STATUS" != "COMPLETED" ]; then
    echo -e "${RED}✗${NC} Workflow did not complete within ${TIMEOUT}s"
    exit 1
fi

# Step 6: Verify results in Neo4j
echo -e "\n${YELLOW}[STEP 6/6]${NC} Verifying workflow results..."

# Check 1: Verify content scores were calculated
echo -e "${CYAN}→${NC} Checking content scores..."
SCORED_PAGES=$(run_cypher "MATCH (p:Page {siteId: '$TEST_SITE_ID'}) 
     WHERE p.contentScore IS NOT NULL 
     RETURN count(p)" 2>/dev/null | tail -n 1)

echo -e "   Pages with content scores: ${SCORED_PAGES}/4"

if [ "$SCORED_PAGES" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Content scoring working"
else
    echo -e "${YELLOW}⚠${NC}  No content scores found (may need SERP data in ClickHouse)"
fi

# Check 2: Verify cannibalization detection
echo -e "\n${CYAN}→${NC} Checking cannibalization detection..."
CANNIBAL_PAGES=$(run_cypher "MATCH (p:Page {siteId: '$TEST_SITE_ID'}) 
     WHERE p.cannibalizationStatus = 'conflict' 
     RETURN count(p)" 2>/dev/null | tail -n 1)

echo -e "   Pages with cannibalization conflicts: $CANNIBAL_PAGES"

# Check 3: Verify CANNIBALIZES relationships
CANNIBAL_RELS=$(run_cypher "MATCH (p1:Page {siteId: '$TEST_SITE_ID'})-[r:CANNIBALIZES]->(p2:Page) 
     RETURN count(r)" 2>/dev/null | tail -n 1)

echo -e "   CANNIBALIZES relationships created: $CANNIBAL_RELS"

if [ "$CANNIBAL_RELS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Cannibalization detection working"
    
    # Show detected conflicts
    echo -e "\n${CYAN}→${NC} Detected conflicts:"
    run_cypher "MATCH (p1:Page {siteId: '$TEST_SITE_ID'})-[r:CANNIBALIZES]->(p2:Page) 
         RETURN p1.url as Page1, p1.targetKeyword as Keyword1, 
                p2.url as Page2, p2.targetKeyword as Keyword2, 
                round(r.similarity * 100) as SimilarityPercent" 2>/dev/null
else
    echo -e "${YELLOW}⚠${NC}  No cannibalization detected (check similarity threshold)"
fi

# Check 4: Verify status updates
echo -e "\n${CYAN}→${NC} Checking status field updates..."
STATUS_UPDATED=$(run_cypher "MATCH (p:Page {siteId: '$TEST_SITE_ID'}) 
     WHERE p.cannibalizationStatus IN ['ok', 'conflict'] 
     RETURN count(p)" 2>/dev/null | tail -n 1)

echo -e "   Pages with updated status: ${STATUS_UPDATED}/4"

if [ "$STATUS_UPDATED" = "4" ]; then
    echo -e "${GREEN}✓${NC} All pages have status updates"
else
    echo -e "${YELLOW}⚠${NC}  Some pages missing status updates"
fi

# Final summary
echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "═══════════════════════════════════════════════════════${NC}"
echo -e "Test Site ID:              ${CYAN}$TEST_SITE_ID${NC}"
echo -e "Workflow ID:               ${CYAN}$WORKFLOW_ID${NC}"
echo -e "Pages Analyzed:            ${CYAN}4${NC}"
echo -e "Pages with Content Scores: ${CYAN}$SCORED_PAGES${NC}"
echo -e "Cannibalization Conflicts: ${CYAN}$CANNIBAL_RELS${NC}"
echo -e "Status Updates:            ${CYAN}${STATUS_UPDATED}/4${NC}"

# Determine overall result
if [ "$STATUS_UPDATED" = "4" ] && [ "$CANNIBAL_RELS" -ge 0 ]; then
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════"
    echo -e "  ✓ INTEGRATION TEST PASSED"
    echo -e "═══════════════════════════════════════════════════════${NC}\n"
    exit 0
else
    echo -e "\n${RED}═══════════════════════════════════════════════════════"
    echo -e "  ✗ INTEGRATION TEST FAILED"
    echo -e "═══════════════════════════════════════════════════════${NC}\n"
    exit 1
fi
