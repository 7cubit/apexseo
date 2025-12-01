# Logic Engine & Core Algorithms

This document details the algorithms and scoring mechanisms used in the ApexSEO Logic Engine.

## 1. Topic-Sensitive PageRank (TSPR)

**Purpose**: Measure the structural importance of pages within the site's internal link graph.

**Implementation**:
- **Library**: Neo4j Graph Data Science (GDS).
- **Algorithm**: PageRank (standard for MVP, extensible to Topic-Sensitive).
- **Workflow**:
    1.  Project a subgraph of the site's pages and `LINKS_TO` relationships.
    2.  Run PageRank with `dampingFactor: 0.85` and `maxIterations: 20`.
    3.  Write scores to `Page.tspr` property in Neo4j.
    4.  Persist scores to ClickHouse for historical tracking.

## 2. Content Clustering

**Purpose**: Group semantically similar pages to identify content silos and opportunities for internal linking.

**Implementation**:
- **Library**: `ml-kmeans` (Node.js).
- **Input**: Page embeddings (generated via `Xenova/all-MiniLM-L6-v2`).
- **Algorithm**: K-Means Clustering.
- **Output**:
    -   `(:Cluster)` nodes in Neo4j.
    -   `[:BELONGS_TO_CLUSTER]` relationships.
    -   Cluster summaries in ClickHouse `clusters` table.

## 3. Scoring Components

The composite health score is a weighted average of several components.

### A. Content Depth Score (20%)
- **Metric**: Coverage of expected entities/keywords compared to SERP competitors.
- **Source**: DataForSEO SERP API + Entity Extraction.
- **Calculation**: `(Matched Entities / Expected Entities) * 100`.

### B. Truth & Risk Score (15%)
- **Metric**: Inverse of the maximum risk score of claims found on the page.
- **Source**: Embedding similarity against a Knowledge Base (mocked/simulated for MVP).
- **Calculation**: `100 - Max(Claim Risk Score)`.

### C. UX Friction Score (20%)
- **Metric**: Inverse of friction events (rage clicks, dead clicks, excessive scrolling).
- **Source**: ClickHouse `ux_sessions` and `ux_events`.
- **Calculation**: `100 - Friction Score`.

### D. Backlink Quality (12%)
- **Metric**: Average relevance/authority of referring domains.
- **Source**: DataForSEO Backlink API.
- **Calculation**: Average of `domain_relevance` of all backlinks.

### E. Internal Link Health (8%)
- **Metric**: Structural integrity (orphan status, depth, centrality).
- **Source**: Neo4j Graph Analysis.
- **Calculation**: Heuristic based on graph metrics.

### F. TSPR Component (25%)
- **Metric**: Normalized PageRank score.
- **Calculation**: `(PageRank / MaxSitePageRank) * 100`.

## 4. Composite Health Score Formula

```javascript
Health_Score = (
    0.25 * TSPR_normalized +
    0.20 * Content_Score_normalized +
    0.20 * UX_Friction_Score_inverse +
    0.15 * Truth_Risk_Score_inverse +
    0.12 * Backlink_Quality_Score +
    0.08 * Internal_Link_Health
) * 100
```

## 5. Orchestration

- **Temporal Workflows**:
    -   `AnalysisWorkflow`: Triggers TSPR -> Clustering -> Health Score Calculation.
    -   Runs automatically after `BacklinkIndexWorkflow` or on a schedule.
