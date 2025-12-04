# Temporal Operations Guide

## Worker Deployment

### Local Development
Workers are started via `packages/workers/src/worker.ts`.
```bash
npm run dev --workspace=@apexseo/workers
```

### Production
Deploy workers as a separate service (e.g., Docker container, K8s deployment).
Ensure workers have access to:
- Temporal Cluster (Cloud or Self-Hosted)
- Database (ClickHouse, Neo4j)
- External APIs

## Namespace Configuration
- **Development**: `default`
- **Production**: `apexseo-prod` (configured in Temporal Cloud)

## Archival
Configure archival to S3/GCS for long-term history retention if using self-hosted Temporal. Temporal Cloud handles this automatically if configured.

## Troubleshooting

### Stuck Workflows
- Check pending activities in the Temporal Web UI.
- Verify worker connectivity and logs.
- Use `tctl` or Temporal CLI to terminate/reset stuck workflows.

### Versioning Issues
- If a workflow fails with "Nondeterminism error", it means the history doesn't match the code.
- Use `workflow.patched` for changes to running workflows.
- Increment build IDs for incompatible changes.

### Activity Timeouts
- `startToCloseTimeout`: Max time for a single activity attempt.
- `scheduleToStartTimeout`: Max time an activity can wait in the queue.
- Adjust these values in workflow definitions based on expected duration.
