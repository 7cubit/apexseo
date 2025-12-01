# Agents & Background Jobs

## Overview
ApexSEO uses autonomous agents powered by Temporal workflows to continuously monitor site health, track rankings, and detect issues. Agents run on configurable schedules and raise alerts when problems are detected.

## Agent Types

### 1. SiteDoctor
**Purpose**: Comprehensive site health monitoring and regression detection.

**Schedule**: Daily at 2 AM (configurable)

**Workflow**:
1. Re-crawl priority pages (homepage + top 10 by TSPR)
2. Recompute TSPR and health scores
3. Compare against historical baselines
4. Raise alerts if metrics regress beyond thresholds

**Alerts Triggered**:
- Health score drops > 10 points
- TSPR decreases > 15%
- New orphan pages detected

---

### 2. RankTracker
**Purpose**: Monitor keyword rankings and detect volatility.

**Schedule**: Every 6 hours (configurable)

**Workflow**:
1. Fetch tracked keywords from ClickHouse
2. Query DataForSEO for current rankings
3. Store rank history with volatility calculations
4. Flag keywords with significant movement (±5 positions)

**Alerts Triggered**:
- Keyword drops out of top 10
- Volatility exceeds threshold (5+ position change)
- New competitor appears in top 3

---

### 3. ScoreRefresh
**Purpose**: Nightly recalculation of composite health scores.

**Schedule**: Daily at midnight (configurable)

**Workflow**:
1. Fetch latest data from all sources
2. Recalculate health scores for all pages
3. Update ClickHouse with new scores

**No alerts** - This is a maintenance job.

---

## Cannibalization Detector

**Trigger**: Part of SiteDoctor workflow

**Logic**:
1. Query ClickHouse for keywords with multiple ranking pages
2. Calculate semantic similarity using embeddings
3. Identify high-priority issues (top 10 keywords)
4. Write findings to `alerts` table

**Alert Criteria**:
- 2+ pages ranking for same keyword
- Keyword in top 10 positions
- Pages have high semantic overlap (>0.8 similarity)

---

## Alerting System

### Storage
Alerts are stored in ClickHouse `alerts` table:
- `site_id`: Project identifier
- `type`: Alert category (cannibalization, rank_volatility, health_regression)
- `severity`: low | medium | high | critical
- `message`: Human-readable description
- `details`: JSON payload with additional context
- `status`: new | acknowledged | resolved

### Delivery Channels

#### Slack
Configure via `SLACK_WEBHOOK_URL` environment variable.
Alerts are sent as rich attachments with color-coded severity.

#### Email
Configure via SMTP settings:
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`
- `ALERT_EMAIL`

---

## Schedule Management

### Per-Project Configuration
Schedules are stored in ClickHouse `schedules` table with per-project metadata:
- `project_id`: Site identifier
- `agent_name`: SiteDoctor | RankTracker | ScoreRefresh
- `cron_expression`: Standard cron format
- `enabled`: Boolean flag
- `last_run`: Timestamp of last execution
- `next_run`: Calculated next execution time

### API Endpoints
- `GET /projects/:id/schedules`: List all agent schedules
- `POST /projects/:id/schedules/:agent/toggle`: Enable/disable an agent
- `PUT /projects/:id/schedules/:agent`: Update cron expression

### UI Controls
Navigate to `/system-status` to:
- View agent status (idle/running/failed)
- See last run and next run times
- Manually trigger agents
- Pause/resume schedules

---

## Resilience & Error Handling

### Circuit Breaker
External API calls (DataForSEO) are protected by circuit breakers:
- **Threshold**: 5 consecutive failures
- **Timeout**: 60 seconds
- **States**: CLOSED → OPEN → HALF_OPEN

When OPEN, requests fail fast to prevent cascading failures.

### Retry Logic
Failed activities use exponential backoff:
- **Max Retries**: 3
- **Base Delay**: 1 second
- **Backoff**: 2^attempt seconds

### Temporal Policies
- **Overlap**: SKIP (don't run if previous execution is still running)
- **Catchup Window**: 1 day (don't backfill missed runs older than 1 day)

---

## Activity Log

### Viewing Execution History
Navigate to `/system-status` and click on an agent card to view:
- Workflow execution ID
- Start/end timestamps
- Duration
- Outcome (success/failure)
- Error details (if failed)

### API Endpoint
`GET /agents/activity`: Returns recent workflow executions from Temporal.

---

## Pausing/Resuming Jobs

### Via UI
1. Navigate to `/system-status`
2. Click "Pause" button on agent card
3. Confirm action

### Via API
```bash
POST /projects/:id/schedules/SiteDoctor/toggle
{
  "enabled": false
}
```

### Effect
- Paused agents will not execute on schedule
- Can still be triggered manually
- Resume by toggling `enabled: true`

---

## Monitoring Best Practices

1. **Review alerts daily** at `/alerts`
2. **Check system status** before major deployments
3. **Pause agents** during site migrations to avoid false alerts
4. **Adjust thresholds** based on your site's volatility
5. **Monitor circuit breaker state** - frequent OPEN states indicate API issues
