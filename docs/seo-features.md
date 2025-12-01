# SEO Feature Suite Documentation

## Overview
ApexSEO provides a comprehensive suite of SEO tools that combine **DataForSEO API data** with our **proprietary algorithms** (TSPR, semantic clustering, truth analysis) to deliver insights beyond traditional SEO platforms.

---

## 1. Keywords Module

### Research Tool (`/keywords`)
**Purpose**: Discover high-value keywords for your content strategy.

**Features**:
- Keyword suggestions via DataForSEO
- Search volume, difficulty, CPC metrics
- SERP features detection (Featured Snippets, PAA, Videos)
- Export to CSV
- One-click add to tracking

**Unique Advantage**: Integrates with our semantic clustering to suggest keywords aligned with your content pillars.

### Tracking Dashboard (`/keywords/tracking`)
**Purpose**: Monitor keyword rankings and visibility over time.

**Features**:
- **Visibility Score**: Weighted metric combining search volume × position weight
- Position distribution (Top 3, Top 10, Top 20, etc.)
- Change tracking (daily movement)
- Historical charts

**Unique Advantage**: Uses our TSPR algorithm to prioritize keywords on high-authority pages.

---

## 2. On-Page SEO Audit

**Service**: `OnPageAuditService`

**Checks**:
- Title tag (length, keyword presence)
- Meta description
- H1 tag (uniqueness, keyword)
- Header hierarchy (H2-H6)
- Image alt text
- Internal links (min 3, max 100)
- Content length (min 300 words)
- Keyword density (1-3%)
- Schema markup
- Canonical tags

**Unique Advantage**: Leverages our existing crawler data - no additional API calls needed.

---

## 3. Backlinks Dashboard (`/backlinks`)

**Purpose**: Monitor backlink profile and authority.

**Features**:
- Total backlinks & referring domains
- New/lost links (30-day tracking)
- **Growth Chart**: Time-series visualization
- **Anchor Text Distribution**: Pie chart (Branded, Exact Match, Partial, Generic)
- **Top Referring Domains**: Sorted by authority (using TSPR-like scoring)
- **Toxic Links Detection**: Spam score > 50
- Disavow file generation

**Unique Advantage**: Authority scores calculated using our TSPR algorithm, not third-party metrics.

---

## 4. Content Optimizer (`/content-optimizer`)

**Purpose**: Write SEO-optimized content with real-time scoring (Surfer SEO alternative).

**Scoring Metrics**:
1. **Word Count** (target: 1500 words)
2. **Keyword Usage** (target density: 2%)
3. **Readability** (Flesch-Kincaid grade level)
4. **Header Structure** (1 H2 per 500 words)
5. **Links** (min 3 internal, 1 external)

**Algorithms Used**:
- **Flesch-Kincaid Readability**: Calculates reading grade level
- **TF-IDF Term Extraction**: Identifies common terms in high-performing content
- **Semantic Analysis**: Compares against your own top pages (not just competitors)

**Unique Advantage**: Uses YOUR site's data to set benchmarks, not generic SERP analysis.

---

## 5. Site Audit Tool

**Service**: `SiteAuditService`

**Issues Detected**:
- Broken links (4xx, 5xx status codes)
- Duplicate titles
- Missing H1 tags
- Thin content (<300 words)
- Orphan pages (using our semantic detection)
- Missing canonical tags

**Crawl Statistics**:
- Status code distribution (2xx, 3xx, 4xx, 5xx)
- Average response time
- Total pages crawled

**Health Score**: Calculated as `100 - (critical issues × 20) - (warnings × 5)`

**Unique Advantage**: Leverages our existing crawler data and orphan detection algorithm.

---

## 6. Competitor Analysis (Partial)

**Purpose**: Identify keyword and backlink gaps vs competitors.

**Planned Features**:
- Keyword gap analysis (keywords they rank for, you don't)
- Backlink gap analysis (domains linking to them, not you)
- Content gap analysis (using semantic clustering)

**Unique Advantage**: Semantic clustering allows topic-level comparison, not just keyword-level.

---

## 7. SERP Analysis (Partial)

**Purpose**: Analyze SERP features and top 10 competitors.

**Planned Features**:
- SERP preview visualization
- Featured snippet opportunities
- PAA (People Also Ask) tracking
- Top 10 breakdown (word count, backlinks, DA)

---

## 8. Reporting & Export (Partial)

**Purpose**: Generate professional SEO reports.

**Planned Features**:
- PDF report generation (Puppeteer)
- CSV export for all data tables
- Scheduled reports (weekly/monthly email delivery)
- Custom metric selection

---

## Unique Algorithms

### 1. TSPR (Topic-Sensitive PageRank)
- **What**: Authority scoring algorithm that considers topic relevance
- **Used In**: Keyword tracking, backlinks dashboard, link optimizer
- **Advantage**: More accurate than generic PageRank for niche sites

### 2. Semantic Clustering
- **What**: K-means clustering on OpenAI embeddings
- **Used In**: Content optimizer, orphan detection, competitor analysis
- **Advantage**: Groups content by meaning, not just keywords

### 3. Flesch-Kincaid Readability
- **What**: Calculates reading grade level based on sentence/word complexity
- **Used In**: Content optimizer
- **Formula**: `206.835 - (1.015 × avg words/sentence) - (84.6 × avg syllables/word)`

### 4. TF-IDF Term Extraction
- **What**: Identifies important terms based on frequency and uniqueness
- **Used In**: Content optimizer SERP recommendations
- **Advantage**: Finds terms that matter, not just common words

### 5. Orphan Detection
- **What**: Identifies pages isolated from semantic clusters
- **Used In**: Site audit, link optimizer
- **Advantage**: Finds pages that need internal links based on topic, not just link count

---

## API Endpoints

### Keywords
- `GET /keywords/research?query=seo` - Keyword suggestions
- `GET /keywords/tracking/:projectId` - Tracked keywords
- `POST /keywords/track` - Add keyword to tracking
- `DELETE /keywords/track/:projectId/:keyword` - Remove from tracking

### Content
- `POST /content/score` - Score content in real-time
- `GET /content/serp-recommendations?keyword=seo&siteId=example.com` - Get SERP recommendations

### Backlinks
- `GET /backlinks/:projectId` - Backlink summary
- `GET /backlinks/:projectId/growth` - Time-series data
- `GET /backlinks/:projectId/toxic` - Toxic links

### Site Audit
- `GET /audit/:projectId` - Run site audit
- `GET /audit/:projectId/issues` - Get issues by type

---

## Testing Recommendations

### Unit Tests
1. **ContentOptimizerService.scoreContent()**: Test with various content lengths and keyword densities
2. **SiteAuditService.runAudit()**: Mock page data with known issues
3. **OnPageAuditService.auditPage()**: Test each check individually

### Integration Tests
1. **Keywords Research**: Mock DataForSEO response, verify table renders
2. **Content Optimizer**: Type content, verify score updates in real-time
3. **Backlinks Dashboard**: Verify charts render with mock data

### E2E Tests (Browser)
1. Navigate to `/keywords`, search for "seo tools", verify results
2. Navigate to `/content-optimizer`, type 500 words, verify score < 50
3. Navigate to `/backlinks`, verify growth chart displays

---

## Deployment Checklist

- [ ] Set DataForSEO credentials (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`)
- [ ] Ensure ClickHouse is running and accessible
- [ ] Ensure Neo4j is running with page data
- [ ] Run initial crawl to populate page data
- [ ] Test keyword tracking workflow
- [ ] Verify content optimizer scoring accuracy
- [ ] Test backlinks dashboard with real data

---

## Future Enhancements

1. **AI Content Generation**: Use GPT-4 to generate optimized content based on SERP analysis
2. **Automated Link Building**: Suggest outreach targets based on backlink gap analysis
3. **Rank Prediction**: ML model to predict ranking potential before publishing
4. **Competitive Intelligence**: Track competitor content updates and rankings
5. **Local SEO**: Add local rank tracking and GMB integration
