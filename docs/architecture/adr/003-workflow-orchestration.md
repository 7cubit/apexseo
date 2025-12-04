# ADR-003: Workflow Orchestration

## Status
Accepted

## Context
SEO processes (crawling, scoring, report generation) are long-running, distributed, and prone to failure (network issues, rate limits). We need a system that guarantees execution and handles retries automatically.

## Decision
We will use **Temporal** as the workflow orchestration engine.

## Consequences
### Positive
- **Reliability**: Workflows are durable. If a worker crashes, the workflow resumes on another.
- **Visibility**: Temporal UI provides deep insight into workflow state and history.
- **Simplicity**: We write code (Workflows/Activities) instead of complex DAG configurations.

### Negative
- **Learning Curve**: Requires understanding the "Deterministic Execution" model.
- **Infrastructure**: Requires running the Temporal Server (or using Temporal Cloud).
