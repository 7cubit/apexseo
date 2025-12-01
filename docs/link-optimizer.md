# Site Graph & Internal Link Optimizer

## Overview
The Link Optimizer analyzes your site's structure and content to recommend internal linking opportunities. It uses a combination of **Topic-Sensitive PageRank (TSPR)**, **Semantic Clustering**, and **Vector Similarity** to find pages that should be linked but aren't.

## Architecture

### 1. Graph Service (`packages/shared/src/lib/services/GraphService.ts`)
- Fetches nodes and edges from Neo4j.
- Formats data for **React Flow** visualization.
- Calculates cluster statistics.

### 2. Link Optimizer Service (`packages/shared/src/lib/services/LinkOptimizerService.ts`)
- **Generation**: Finds "semantic orphans" (pages isolated from their semantic cluster) and searches for relevant targets using vector embeddings.
- **Persistence**: Stores suggestions in ClickHouse (`link_suggestions` table).
- **Action**: Handles acceptance (writing to Neo4j) and rejection (updating ClickHouse status).

### 3. Workflow (`packages/workers/src/workflows/LinkOptimizerWorkflow.ts`)
Orchestrates the analysis pipeline:
1.  **Embedding Generation**: Computes embeddings for new pages.
2.  **Clustering**: Groups pages by semantic topic.
3.  **TSPR**: Calculates authority scores.
4.  **Suggestion Generation**: Identifies missing links.

## Usage

### Visualization
Navigate to `/projects/[id]/graph` to see the interactive site map.
- **Nodes**: Colored by cluster, sized by TSPR.
- **Edges**: Existing internal links.

### Reviewing Suggestions
Switch to the "Link Opportunities" tab to view recommendations.
- **Accept**: Adds the link to the graph (Neo4j) and marks as accepted.
- **Reject**: Dismisses the suggestion (persisted to prevent re-suggestion).

## API Endpoints

- `GET /projects/:id/graph`: Fetch graph nodes/edges.
- `GET /projects/:id/suggestions`: Fetch pending suggestions.
- `POST /projects/:id/optimizer`: Trigger the optimization workflow.
- `POST /suggestions/:id/accept`: Accept a suggestion.
- `POST /suggestions/:id/reject`: Reject a suggestion.
