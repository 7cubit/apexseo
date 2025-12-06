# Beta Release Integration Plan: ApexSEO

## Executive Summary
The ApexSEO project has successfully implemented high-fidelity UI components and defined the core architectural flows. To achieve a stable **Beta Release**, the focus must shift from **Frontend/Mock-driven development** to **Backend/Data-driven integration**. The primary objective is to close the loop between "Content Creation" (Write) and "Analytics/Audits" (Read) using the defined technology stack.

## Technology Stack Synergy
*   **Neo4j (The Brain)**: Stores the "State of the World" — Content Inventory, Topical Maps, Internal Links.
*   **ClickHouse (The Pulse)**: Stores "Events & Metrics" — Traffic logs, Ranking history, Volatility data.
*   **Temporal (The Nervous System)**: Orchestrates long-running processes — Content Generation, Periodic Audits, Rank Tracking.
*   **AI (The Muscle)**: Perplexity (Research) & OpenAI (Drafting/Optimization) executed via Temporal Activities.

---

## Phase 1: Data Layer Stabilization (Foundation)
*Goal: Replace hardcoded mocks with database queries.*

### 1.1 Neo4j Schema & Seeding
*   **Objective**: Ensure all "Content" and "Topics" exist in the graph.
*   **Action**:
    *   Finalize `Page`, `Topic`, `Cluster`, and `Keyword` node schemas.
    *   Create a `seed-db.ts` script to populate Neo4j with a realistic initial state (e.g., 50 pages, 5 clusters) so the **Topical Map** and **Content Audit** dashboards have data to render immediately.
    *   **Dependency**: `TopicalMapService` must query Neo4j.

### 1.2 ClickHouse Schema & Ingestion
*   **Objective**: Power the "Volatility" and "Traffic" charts.
*   **Action**:
    *   Define tables: `rankings_daily`, `traffic_daily`, `site_audits`.
    *   Create a mock data generator (or GSC/GA4 connector) to backfill 30 days of data.
    *   **Dependency**: `CannibalizationService` and `ContentAuditService` must query ClickHouse.

---

## Phase 2: Workflow Materialization (The Engine)
*Goal: Make the "Magic" buttons real.*

### 2.1 Content Generation Workflow (Temporal)
*   **Current State**: `activities.ts` is mocked.
*   **Action**: Implement real API calls in `packages/app/src/workflows/content-generation/activities.ts`:
    *   `doPerplexityResearch`: Call Perplexity API.
    *   `draftWithLLM`: Call OpenAI API (GPT-4o).
    *   `saveContent`: Write the final draft to Neo4j (creating a `Page` node with status `DRAFT`).

### 2.2 Periodic Audit Workflow (Temporal)
*   **New Workflow**: `ScheduledAuditWorkflow`.
*   **Action**:
    *   Run weekly.
    *   Fetch all pages from Neo4j.
    *   Fetch metrics from ClickHouse.
    *   Run `ContentAuditService` logic.
    *   Update `Page` nodes with new `contentScore` and `status`.

---

## Phase 3: Service Integration (The Logic)
*Goal: Connect UI to Data.*

### 3.1 Read Services
*   **CannibalizationService**:
    *   *Input*: Query ClickHouse for keywords where `count(distinct url) > 1` in the last 7 days.
    *   *Output*: Return `CannibalizationIssue[]` to the dashboard.
*   **ContentAuditService**:
    *   *Input*: Query Neo4j for pages + ClickHouse for traffic trends.
    *   *Output*: Return `AuditPage[]` to the dashboard.

### 3.2 Write Services
*   **Editor Save**:
    *   When user clicks "Save" in `RichTextEditor`, update the `Page` node in Neo4j.
    *   Trigger `InternalLinkingService` to recalculate link suggestions based on the new content.

---

## Phase 4: User Loop Closure (The Experience)
*Goal: A seamless flow.*

1.  **Research**: User generates a Topical Map (Neo4j).
2.  **Create**: User clicks "Gap Analysis" -> "New Draft".
3.  **Generate**: Temporal runs `ContentGenerationWorkflow` -> Saves Draft to Neo4j.
4.  **Edit**: User edits in `SplitScreenEditor` (reads from Neo4j).
5.  **Publish**: User clicks "Publish" -> Updates Neo4j status to `PUBLISHED`.
6.  **Audit**: `ScheduledAuditWorkflow` runs -> Updates ClickHouse/Neo4j.
7.  **Review**: User sees the new page in `ContentAuditDashboard`.

## Recommended Sequencing
1.  **Immediate**: Implement `seed-db.ts` to back the dashboards with consistent DB data.
2.  **Short-term**: Implement real `activities.ts` for Content Generation (it's the "wow" feature).
3.  **Mid-term**: Connect `ContentAuditService` to ClickHouse/Neo4j (replaces the largest mock).
4.  **Final**: End-to-End testing of the Create -> Publish -> Audit loop.
