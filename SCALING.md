# Scaling Configuration (KEDA & HPA)

## 1. Temporal Worker Autoscaling (KEDA)
We use KEDA to scale workers based on the Temporal Task Queue backlog.

### Configuration
*   **Scaler**: `temporal`
*   **Metric**: `temporal_workflow_task_queue_backlog`
*   **Threshold**: `10` (Target backlog per replica)
*   **Min Replicas**: `0` (Scale to zero when idle)
*   **Max Replicas**: `50` (Prevent runaway costs)
*   **Cooldown Period**: `300` seconds (Prevent flapping)

### Tuning
*   If workers are thrashing (up/down rapidly), increase `cooldownPeriod`.
*   If latency is high, decrease `threshold` (e.g., to 5).

## 2. API Gateway Autoscaling (HPA)
We use standard Kubernetes HPA for the stateless API Gateway.

### Configuration
*   **Metric**: CPU Utilization
*   **Target**: `70%`
*   **Min Replicas**: `2` (High availability)
*   **Max Replicas**: `20`

### Burst Handling
*   For AppSumo launches, pre-scale the API Gateway manually:
    ```bash
    kubectl scale deployment api-gateway --replicas=10
    ```
*   This warms up the load balancer and ensures capacity before the traffic spike hits.
