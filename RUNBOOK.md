# ApexSEO Operations Runbook

## 1. Identifying Bad API Keys
**Scenario**: A customer's LLM key is invalid or exhausted, causing worker failures.

### Detection
1.  Check **Grafana Dashboard**: "LLM Error Rates by Tenant".
2.  Look for spikes in `401 Unauthorized` or `429 Too Many Requests`.
3.  Identify the `tenant_id` with high error rates.

### Resolution
1.  The **Circuit Breaker** should automatically pause workflows for this tenant.
2.  **Manual Action**:
    *   Query the logs: `kubectl logs -l app=eeat-worker | grep "CircuitBreaker tripped"`
    *   Contact the customer via the Admin Dashboard.
    *   Disable the key in the database if necessary.

## 2. Temporal Worker Scaling Issues
**Scenario**: Queue backlog is growing, but pods are not scaling up.

### Diagnosis
1.  Check KEDA status: `kubectl get scaledobject`
2.  Check HPA status: `kubectl get hpa`
3.  Check for **Pending Pods**: `kubectl get pods --field-selector=status.phase=Pending`
    *   If Pending, check events: `kubectl describe pod <pod-name>`
    *   Common cause: Cluster autoscaler hasn't provisioned a new node yet.

## 3. Database Connectivity
**Scenario**: Services cannot connect to Managed DBs.

### Diagnosis
1.  Check Network Policies: Ensure egress to the managed DB IP range is allowed.
2.  Check Secrets: Verify `DATABASE_URL` and `NEO4J_URI` in `k8s/apps/secrets.yaml` (or external secret store).
3.  Test Connectivity:
    ```bash
    kubectl run debug --rm -it --image=busybox -- restart=Never -- sh
    nc -zv <db-host> <db-port>
    ```
