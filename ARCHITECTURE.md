# ApexSEO Kubernetes Architecture

## 1. High-Level Strategy: Hybrid Deployment
To balance launch resilience with long-term cost efficiency, we are adopting a **Hybrid Deployment Strategy**.

### Phase 1: Launch (AppSumo / High Traffic)
*   **Compute**: Kubernetes (EKS/GKE) for stateless services and Temporal workers.
*   **Persistence**: Managed Cloud Services.
    *   **ClickHouse**: ClickHouse Cloud (Scalable, managed backups).
    *   **Neo4j**: Neo4j AuraDB (Managed graph database).
    *   **Postgres**: Cloud SQL / RDS (For Temporal persistence).
*   **Reasoning**: Managed services absorb the "hug of death" burst traffic without requiring complex in-house DB tuning during the critical launch window.

### Phase 2: Cost Optimization (Post-Launch)
*   **Compute**: Kubernetes (Same as Phase 1).
*   **Persistence**: Migrated to In-Cluster Operators.
    *   **ClickHouse**: Altinity ClickHouse Operator on K8s (StorageClass: SSD).
    *   **Neo4j**: Official Neo4j Helm Chart (StatefulSet).
*   **Reasoning**: Once traffic stabilizes, self-hosting significantly reduces infrastructure costs.

## 2. Temporal & KEDA Autoscaling
We leverage **Temporal** for durable execution and **KEDA** for event-driven autoscaling.

*   **Metric**: Temporal Task Queue Length (Backlog).
*   **Behavior**:
    *   **Priority Queue (MRR)**: Scales aggressively (Threshold: 5) to ensure low latency. Min Replicas: 1.
    *   **Standard Queue (LTD)**: Scales conservatively (Threshold: 20) to control costs. Min Replicas: 0. Max Replicas: 20.
*   **Isolation**:
    *   `eeat-worker-priority`: Dedicated high-resource pods for paying customers.
    *   `eeat-worker-standard`: Lower-resource pods for LTD users, potentially on Spot Instances.
    *   **Benefit**: "Hug of death" from LTD users never degrades performance for MRR subscribers.

## 3. LLM Key Safety
*   **Storage**: Encrypted in the primary application database (Postgres/ClickHouse).
*   **Usage**: Workers fetch keys at runtime via internal API. Keys are NEVER stored in K8s Secrets or Environment Variables.
*   **Circuit Breaker**: If a user's key fails (401/429) > 5 times, the worker trips a breaker and pauses that user's workflows to prevent resource waste.

## 4. Observability
*   **Stack**: Prometheus + Grafana (kube-prometheus-stack).
*   **Key Metrics**:
    *   `temporal_workflow_failed_count` (by error type).
    *   `worker_queue_latency`.
    *   `llm_api_error_rate` (by tenant).
