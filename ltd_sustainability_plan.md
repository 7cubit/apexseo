# LTD Sustainability & Cost Control Strategy for ApexSEO

## Executive Summary
Lifetime Deals (LTDs) are excellent for initial cash flow and feedback but can become a "ticking time bomb" of infrastructure costs, especially for compute-heavy AI applications like ApexSEO. To ensure long-term viability without breaking promises, we must implement a **"Fair Use & Cost Offloading"** architecture.

The core philosophy is: **"LTD users get the platform for free, but they pay for the fuel (Compute/API costs) for heavy lifting."**

---

## 1. The "Bring Your Own Key" (BYOK) Enforcement
**Impact**: Reduces AI API costs (OpenAI/Perplexity) by ~90-100% for heavy users.

### Implementation
1.  **Tiered Access**:
    *   **Standard LTD**: Includes X "System Credits" per month (e.g., 10 articles) using our keys.
    *   **Power LTD**: Unlimited usage **ONLY** when BYOK is enabled.
2.  **Code Change (`eeat-service.ts`)**:
    *   Check `user.subscriptionType`.
    *   If `LTD` and `monthly_usage > limit`, enforce `userKeys` presence.
    *   If keys missing -> Throw `402 Payment Required` (Upgrade or Add Keys).

## 2. Temporal Queue Prioritization (The "Fast Lane")
**Impact**: Protects MRR (Monthly Recurring Revenue) users from LTD "hug of death" spikes.

### Architecture
Use Temporal's **Task Queue** routing to separate traffic.

1.  **Queues**:
    *   `priority-queue`: For Monthly/Annual Subscribers.
    *   `standard-queue`: For LTD Users.
2.  **Worker Allocation**:
    *   **Priority Workers**: Poll `priority-queue` exclusively.
    *   **Standard Workers**: Poll `standard-queue` (and `priority-queue` when idle).
3.  **Rate Limiting**:
    *   Configure `standard-queue` workers with a lower `maxConcurrentActivityTaskExecutions`.
    *   LTD users might wait 5-10 mins for an article during peak times, while Subscribers get it in 2 mins.

## 3. "Eco-Mode" Model Swapping
**Impact**: Reduces per-request cost by 10x-30x.

### Strategy
LTD users (without BYOK) get "Eco-Mode" by default.

1.  **Research**: Use `sonar-small` instead of `sonar-reasoning-pro`.
2.  **Drafting**: Use `gpt-4o-mini` instead of `gpt-4o`.
3.  **Upsell**: "Want GPT-4o quality? Add your own API key."

### Implementation
Modify `EEATService` to select models based on user tier:
```typescript
const model = (user.isLTD && !user.hasKey) ? 'gpt-4o-mini' : 'gpt-4o';
```

## 4. Aggressive Research Caching (The "Green Cache")
**Impact**: Eliminates redundant Perplexity API calls (approx. $0.05 - $0.10 per call).

### Logic
Many users research the same topics (e.g., "Best SEO tools 2025").

1.  **Global Cache**: Store `ResearchData` in ClickHouse/Redis hashed by `normalized_topic`.
2.  **TTL**: Valid for 7-30 days depending on category (News = 24h, Evergreen = 30d).
3.  **Hit Logic**:
    *   If User A searches "SEO Tools", we pay Perplexity.
    *   If User B (LTD) searches "SEO Tools" 10 mins later, serve the **cached brief**.
    *   **Saving**: $0.00 cost for User B.

## 5. "Ghost" Processing (Off-Peak Scheduling)
**Impact**: Flattens infrastructure spikes, allowing smaller K8s clusters.

### Concept
LTD users often bulk-generate content.
1.  **Deferral**: If system load > 80%, LTD bulk jobs are marked as "Scheduled".
2.  **Execution**: Processed during low-traffic windows (e.g., 2 AM - 6 AM UTC) or when Spot Instances are cheapest.
3.  **UX**: "Your bulk job is queued and will be ready by morning. Upgrade to Skip the Line."

## 6. Feature Gating (The "Pro" Wall)
Reserve expensive *new* features for MRR users.

*   **LTD**: Core E-E-A-T workflow.
*   **MRR**:
    *   "Deep Research" (Iterative agent loops).
    *   "Competitor Spy" (Scraping live URLs).
    *   "Auto-Publishing" (WordPress integration).

---

## Implementation Roadmap

### Phase 1: Immediate Actions (Low Effort)
1.  [ ] **Model Swap**: Hardcode `gpt-4o-mini` for non-BYOK LTD users in `eeat-service.ts`.
2.  [ ] **Cache**: Implement Redis caching for `doPerplexityResearch`.

### Phase 2: Infrastructure (Medium Effort)
1.  [ ] **Temporal Queues**: Split `eeat-worker` into `priority` and `standard` deployments in K8s.
2.  [ ] **BYOK Logic**: Update UI to prompt for keys when limits are hit.

### Phase 3: Advanced (High Effort)
1.  [ ] **Global Research Index**: Build a searchable index of all past research briefs.
2.  [ ] **Spot Instance Workers**: Run `standard-queue` workers entirely on Spot Instances.
