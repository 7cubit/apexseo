# SEO Insights Dashboard Documentation

## Overview
The SEO Insights Dashboard provides users with actionable data derived from the Unified Data Schema (Neo4j & ClickHouse). It exposes metrics like content scores, page counts, and internal link recommendations.

## Architecture
- **Frontend**: Next.js (React) using `swr` hooks to fetch data.
- **API**: Fastify endpoints under `/projects/:id` that proxy requests to ClickHouse.
- **Data Source**: ClickHouse tables (`pages`, `internal_link_recommendations`) and Neo4j (for graph structure, though currently mostly ClickHouse for metrics).

## API Endpoints

### 1. Project Overview
- **Endpoint**: `GET /projects/:id/overview`
- **Returns**: `totalPages`, `avgContentScore`, `lastCrawl`
- **Backing Query**: Aggregates from `pages` table in ClickHouse.

### 2. Pages List
- **Endpoint**: `GET /projects/:id/pages?page=1&limit=10`
- **Returns**: Paginated list of pages with status, word count, content score.
- **Backing Query**: `SELECT * FROM pages` in ClickHouse.

### 3. Page Audit
- **Endpoint**: `GET /projects/:id/pages/:pageId/audit`
- **Returns**: Detailed metrics for a single page.
- **Backing Query**: `SELECT * FROM pages WHERE page_id = ...` in ClickHouse.

### 4. Internal Link Recommendations
- **Endpoint**: `GET /projects/:id/internal-links`
- **Returns**: List of suggested internal links.
- **Backing Query**: `SELECT * FROM internal_link_recommendations` in ClickHouse.

## Adding New Metrics
1.  **Database**: Add column to ClickHouse `pages` table or create new table.
2.  **Shared Repo**: Update `ClickHousePageRepository` to fetch new column.
3.  **API**: Update `insights.ts` to expose new field in JSON response.
4.  **Frontend**: Update `useInsights.ts` interface and UI component to display it.
