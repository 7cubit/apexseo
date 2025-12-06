# HexagonClickGapFillWorkflow

This workflow automates the generation of content briefs for identifying content gaps. It is triggered when a user clicks on a "High Opportunity" (Red) hexagon in the Topical Map visualization.

## Overview

The workflow performs the following steps:
1.  **Fetch Cluster Details**: Queries Neo4j to identify keywords that competitors rank for but the user does not.
2.  **Competitor Reconnaissance**:
    *   Fetches competitor content for the missing keywords.
    *   Extracts entities from the competitor content using NER (simulated).
3.  **Brief Generation**: Uses OpenAI (GPT-4) to generate a comprehensive content brief based on the gathered data.
4.  **Task Queueing**: Saves the brief to ClickHouse (`content_production_queue`) for the content production team.

## Prerequisites

*   **Temporal Server**: Must be running locally or in the cloud.
*   **Neo4j**: Database with `Cluster`, `Keyword`, and `Competitor` nodes.
*   **ClickHouse**: Database with `content_production_queue` table.
*   **Environment Variables**:
    *   `TEMPORAL_ADDRESS`: Address of the Temporal server.
    *   `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`: Neo4j credentials.
    *   `CLICKHOUSE_URL`, `CLICKHOUSE_PASSWORD`: ClickHouse credentials.
    *   `OPENAI_API_KEY`: For generating briefs.

## Deployment

1.  **Start the Worker**:
    ```bash
    ts-node packages/app/src/workflows/gap-fill/worker.ts
    ```

2.  **Trigger the Workflow**:
    Use the client helper in your API route:
    ```typescript
    import { triggerGapFillWorkflow } from './workflows/gap-fill/client';

    await triggerGapFillWorkflow({
        cluster_id: '...',
        my_domain: '...',
        topic_id: '...',
        top_competitor_domain: '...',
        user_id: '...'
    });
    ```

## Retry Policy

*   **FetchClusterDetails**: 3 attempts (Neo4j connection issues).
*   **FetchCompetitorContent**: 2 attempts (External website issues).
*   **GenerateContentBrief**: 2 attempts (OpenAI API stability).
*   **QueueContentTask**: 5 attempts (Critical data persistence).

## Dead Letter Queue

Failed workflows will be logged to the Temporal UI. Inspect the stack trace to determine if the failure is due to data issues (e.g., empty cluster) or transient errors.
