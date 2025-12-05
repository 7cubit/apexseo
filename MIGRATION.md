# Database Migration Plan (Phase 1 -> Phase 2)

## 1. ClickHouse Migration
**Goal**: Move from ClickHouse Cloud to Self-Hosted ClickHouse Operator.

### Step 1: Preparation
1.  Deploy ClickHouse Operator: `kubectl apply -f k8s/database/clickhouse-operator.yaml`
2.  Provision ClickHouse Cluster: `kubectl apply -f k8s/database/clickhouse-cluster.yaml`
3.  Verify connectivity and storage.

### Step 2: Data Sync
1.  **Schema Dump**: Export schema from Cloud.
    ```bash
    clickhouse-client --host <cloud-host> --query "SHOW CREATE TABLE default.events" > schema.sql
    ```
2.  **Data Export/Import**: Use `remote` function for efficient transfer.
    ```sql
    INSERT INTO default.events SELECT * FROM remote('<cloud-host>', default.events, 'user', 'password');
    ```

### Step 3: Cutover
1.  Schedule maintenance window.
2.  Stop ingestion services (API Gateway).
3.  Perform final data sync.
4.  Update K8s Secrets to point to the in-cluster ClickHouse service.
5.  Restart services.

## 2. Neo4j Migration
**Goal**: Move from Neo4j AuraDB to Self-Hosted Helm Chart.

### Step 1: Preparation
1.  Deploy Neo4j Helm Chart: `helm install neo4j neo4j/neo4j -f k8s/database/neo4j-values.yaml`
2.  Verify StatefulSet is running.

### Step 2: Backup & Restore
1.  **Export**: Use `neo4j-admin database dump` (if access allows) or export via Cypher/APOC.
    *   *Note*: AuraDB allows exporting `.dump` files via the console.
2.  **Import**:
    *   Copy dump to K8s pod: `kubectl cp graph.dump neo4j-0:/tmp/`
    *   Restore: `kubectl exec neo4j-0 -- neo4j-admin database load --from-path=/tmp/ --overwrite-destination=true`

### Step 3: Cutover
1.  Update `NEO4J_URI` in K8s Secrets.
2.  Restart services.
