# Unified Data Architecture (Neo4j & ClickHouse)

This document defines the finalized data architecture for the ApexSEO platform, implementing the "Dual-Store" strategy.

## 1. Overview

*   **Neo4j (The Map):** Stores the structural graph of the web. Handles relationships, link analysis, and graph algorithms (PageRank, Clusters).
*   **ClickHouse (The Library):** Stores high-volume analytics, content metadata, embeddings, and time-series data.

## 2. Neo4j Schema

### Nodes & Labels

| Label | ID Property | Description |
| :--- | :--- | :--- |
| `:Project` | `id` | The project container. |
| `:Site` | `id` | A domain or subdomain. |
| `:Page` | `page_id` | A unique page, ID derived from Base64(URL). |
| `:Keyword` | `id` | A target keyword. |
| `:Cluster` | `id` | A content cluster. |

### Relationships

*   `(:Project)-[:HAS_SITE]->(:Site)`
*   `(:Site)-[:HAS_PAGE]->(:Page)`
*   `(:Page)-[:LINKS_TO {text: "anchor", weight: 1.0}]->(:Page)`
*   `(:Page)-[:BELONGS_TO]->(:Project)` (Shortcut for query performance)
*   `(:Page)-[:TARGETS]->(:Keyword)`
*   `(:Page)-[:IN_CLUSTER]->(:Cluster)`

### Constraints

*   `CONSTRAINT FOR (p:Project) REQUIRE p.id IS UNIQUE`
*   `CONSTRAINT FOR (s:Site) REQUIRE s.id IS UNIQUE`
*   `CONSTRAINT FOR (p:Page) REQUIRE p.page_id IS UNIQUE`

## 3. ClickHouse Schema

### Tables

#### `projects`
*   **Engine:** `MergeTree`
*   **Order By:** `project_id`
*   **Columns:** `project_id`, `name`, `domain`, `created_at`, `user_id`

#### `pages` (Enriched)
*   **Engine:** `MergeTree`
*   **Order By:** `(site_id, page_id)`
*   **Columns:**
    *   `site_id`, `page_id`, `url`
    *   `title`, `h1`, `content`
    *   `status`, `word_count`
    *   `crawled_at` (DateTime)
    *   `content_score` (Float32)
    *   `is_orphan` (UInt8)
    *   `link_count_internal`, `link_count_external`
    *   `keywords` (Array(String))

#### `page_embeddings`
*   **Engine:** `MergeTree`
*   **Order By:** `(site_id, page_id)`
*   **Columns:** `site_id`, `page_id`, `embedding` (Array(Float32)), `cluster_id`

#### `internal_link_recommendations`
*   **Engine:** `MergeTree`
*   **Order By:** `(source_page_id, relevance_score)`
*   **Columns:** `source_page_id`, `target_page_id`, `anchor_text`, `relevance_score`, `reason`

## 4. Data Sync Strategy (The Truth Table)

| Data Entity | Primary Store | Secondary Store | Sync Trigger |
| :--- | :--- | :--- | :--- |
| **URL Structure** | Neo4j | ClickHouse | Crawl Completion |
| **Links** | Neo4j | ClickHouse (Counts) | Crawl Completion |
| **Content/Meta** | ClickHouse | Neo4j (Title/H1) | Crawl Completion |
| **Embeddings** | ClickHouse | None | Embedding Generation |
| **Clusters** | Neo4j | ClickHouse (ID) | Clustering Workflow |

## 5. Ingestion Flow

1.  **API:** `POST /projects` triggers `ProjectIngestionWorkflow`.
2.  **Workflow:**
    *   Validates domain.
    *   Triggers `SiteCrawlWorkflow`.
3.  **Crawl:**
    *   `CrawlPageActivity` fetches HTML.
    *   `WritePageToClickHouseActivity` writes content/metadata to ClickHouse `pages`.
    *   `UpdateGraphInNeo4jActivity` writes nodes/relationships to Neo4j.
4.  **Analysis:**
    *   `EmbeddingGenerationWorkflow` generates embeddings -> ClickHouse `page_embeddings`.
    *   `ClusteringWorkflow` reads embeddings, calculates clusters -> Neo4j `:Cluster` & ClickHouse `pages.cluster_id`.

## 6. Verification

To verify data consistency:
1.  **Neo4j:** `MATCH (p:Page) RETURN count(p)`
2.  **ClickHouse:** `SELECT count() FROM pages`
3.  Counts should match for a given `site_id`.
