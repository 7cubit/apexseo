# Project Plan: Cannibalization Matrix & Keyword Volatility

## 1. Executive Summary
**Objective**: Develop and launch the "Cannibalization Matrix & Keyword Volatility" feature set for ApexSEO.
**Scope**:
1.  **Cannibalization Matrix**: A diagnostic tool to identify internal competition where multiple pages rank for the same keyword, diluting authority.
2.  **Keyword Volatility**: A monitoring system to track ranking fluctuations, signaling algorithm updates or unstable SERPs.
**Goal**: Empower users to consolidate content and react to SERP instability.

## 2. Team Composition & Resource Allocation
To execute this data-intensive feature, we require a specialized "Data-First" squad.

| Role | Count | Justification |
| :--- | :---: | :--- |
| **Backend Engineer (Lead)** | 1 | **Critical**. Requires deep expertise in **ClickHouse** aggregations and **Temporal** workflows to process millions of ranking data points efficiently without latency. |
| **Data Scientist / Analyst** | 0.5 | **Strategic**. Needed to define the mathematical models for the "Volatility Index" (Standard Deviation vs. ATR) and "Cannibalization Overlap Score". |
| **Frontend Developer** | 1 | **Visual**. The "Matrix" requires complex data visualization (Heatmaps, Scatter Plots) and interactive charts for Volatility history. |
| **QA Tester** | 0.5 | **Quality**. Essential for verifying data accuracy. "False positives" in cannibalization can lead users to delete good content, which is a high-risk scenario. |

**Total Headcount**: 3 FTE (Full-Time Equivalent).

## 3. High-Level Technical Approach

### A. Cannibalization Matrix
*   **Data Source**: `ranking_history` table in ClickHouse.
*   **Logic**:
    1.  Group rankings by `keyword_id`.
    2.  Identify keywords where `distinct_count(url) > 1` within the last 30 days.
    3.  Calculate **Overlap Score**: % of time multiple URLs appeared in the Top 100 simultaneously.
*   **Visualization**: A Heatmap or Network Graph showing Keywords connected to multiple URLs.

### B. Keyword Volatility
*   **Data Source**: Daily rank tracking snapshots.
*   **Logic**:
    1.  Calculate **Daily Delta**: `abs(rank_today - rank_yesterday)`.
    2.  Compute **Volatility Index (VI)**: Rolling 7-day Standard Deviation of the Delta.
    3.  **Global Volatility**: Average VI across all tracked keywords to detect "Google Updates".
*   **Visualization**: Time-series line chart with "High Volatility" alert zones.

## 4. Project Phases & Timeline

### Phase 1: Discovery & Algorithm Definition (Week 1)
*   **Deliverable**: Mathematical formulas for Volatility and Cannibalization.
*   **Owner**: Data Scientist + Backend Lead.
*   **Key Decision**: Should we use Standard Deviation or Average True Range (ATR) for volatility?

### Phase 2: Backend Implementation (Weeks 2-3)
*   **Deliverable**:
    *   ClickHouse Materialized Views for pre-calculating Volatility.
    *   API Endpoint: `/api/analytics/cannibalization`.
    *   API Endpoint: `/api/analytics/volatility`.
*   **Owner**: Backend Engineer.

### Phase 3: Frontend Visualization (Weeks 3-4)
*   **Deliverable**:
    *   Interactive Volatility Chart (Recharts/D3).
    *   Cannibalization Data Grid with "Merge" action recommendations.
*   **Owner**: Frontend Developer.

### Phase 4: QA & Validation (Week 5)
*   **Deliverable**: Validated data against manual SERP checks.
*   **Risk Mitigation**: Ensure "Sub-domains" vs "Sub-folders" are treated correctly.

### Phase 5: Deployment & Launch (Week 6)
*   **Deliverable**: Feature Flag enable, User Documentation, Marketing Announcement.

## 5. Risk Assessment

| Risk Area | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Data Volume** | High | Calculating volatility across millions of keywords can be slow. **Mitigation**: Use ClickHouse Materialized Views to pre-aggregate daily stats. |
| **False Positives** | High | Flagging "intentional" duplicates (e.g., product variants) as cannibalization. **Mitigation**: Allow users to "Ignore" specific URL pairs. |
| **Algorithmic Complexity** | Medium | Volatility formulas might be too sensitive (noise) or too rigid. **Mitigation**: Beta test with real data to tune the sensitivity thresholds. |

---
**Next Step**: Approve the "Discovery Phase" to define the exact Volatility formula.
