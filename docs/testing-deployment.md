# ApexSEO - Testing & Deployment Guide

## 🚀 Quick Start (Localhost)

### Prerequisites
```bash
# Required
- Docker Desktop (running)
- Node.js 18+
- npm or pnpm

# Optional (for full functionality)
- OpenAI API key
- DataForSEO credentials
- Perplexity API key
- Google OAuth credentials
```

---

## 📦 Environment Setup

### 1. Clone & Install
```bash
cd /Users/davidbalan86gmail.com/apexseo
npm install
```

### 2. Environment Variables

Create `.env` files in each package:

#### `packages/api/.env`
```env
# Database
CLICKHOUSE_URL=http://localhost:8123
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Temporal
TEMPORAL_ADDRESS=localhost:7233

# Auth
NEXTAUTH_SECRET=your-secret-key-change-this
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### `packages/workers/.env`
```env
# Database
CLICKHOUSE_URL=http://localhost:8123
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# APIs (Optional - platform works without these)
OPENAI_API_KEY=sk-...
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password
PERPLEXITY_API_KEY=pplx-...

# Alerts (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=alerts@yourdomain.com
```

#### `packages/app/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key-change-this
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Start Infrastructure
```bash
# Start Docker services
docker-compose up -d

# Verify services are running
docker ps

# Expected output:
# - clickhouse (port 8123, 9000)
# - neo4j (port 7474, 7687)
# - temporal (port 7233, 8080)
```

### 4. Initialize Databases

```bash
# ClickHouse - Create tables
cd packages/shared
npx tsx src/scripts/init-clickhouse.ts

# Neo4j - Verify connection
# Visit http://localhost:7474
# Login: neo4j / password
```

### 5. Build Shared Package
```bash
cd packages/shared
npm run build
```

---

## 🏃 Running the Platform

### Terminal 1: API Gateway
```bash
cd packages/api
npm run dev

# Expected output:
# ✓ API Gateway listening on port 4000
# ✓ Connected to ClickHouse
# ✓ Connected to Neo4j
```

### Terminal 2: Temporal Worker
```bash
cd packages/workers
npm run dev

# Expected output:
# ✓ Worker connected to Temporal
# ✓ Registered workflows: SiteCrawlWorkflow, AnalysisWorkflow, etc.
```

### Terminal 3: Frontend
```bash
cd packages/app
npm run dev

# Expected output:
# ✓ Ready on http://localhost:3000
```

---

## 🧪 Testing Features

### 1. Health Check
```bash
# API
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
open http://localhost:3000
# Expected: Landing page loads
```

### 2. Test Crawl Workflow
```bash
# Trigger a site crawl
curl -X POST http://localhost:4000/projects/example.com/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "startUrl": "https://example.com",
    "maxDepth": 2
  }'

# Check Temporal UI
open http://localhost:8080
# Navigate to Workflows → Find SiteCrawlWorkflow
```

### 3. Test Keywords Research
```bash
# Visit keywords page
open http://localhost:3000/keywords

# Search for "seo tools"
# Expected: Table of keyword suggestions with search volume

# Note: Requires DATAFORSEO credentials
# Without credentials, you'll see an error - this is expected
```

### 4. Test Content Optimizer
```bash
# Visit content optimizer
open http://localhost:3000/content-optimizer

# Enter target keyword: "seo"
# Type 500 words of content
# Expected: Real-time score updates (should be ~40-50 for 500 words)
```

### 5. Test Graph Visualization
```bash
# First, ensure you have crawled data
# Then visit graph page
open http://localhost:3000/projects/example.com/graph

# Expected: React Flow graph with nodes and edges
# Note: Requires Neo4j data from crawler
```

### 6. Test System Status
```bash
# Visit system status
open http://localhost:3000/system-status

# Expected: Agent status cards (SiteDoctor, RankTracker, ScoreRefresh)
```

---

## 🎯 Feature Testing Checklist

### Core Features (No API Keys Required)
- [ ] Dashboard loads
- [ ] Sites page shows project list
- [ ] Graph visualization renders (after crawl)
- [ ] Content optimizer scores content
- [ ] System status shows agents
- [ ] Alerts page accessible

### Features Requiring DataForSEO
- [ ] Keywords research returns suggestions
- [ ] Keyword tracking shows positions
- [ ] Backlinks dashboard shows data
- [ ] Rank tracking updates

### Features Requiring OpenAI
- [ ] Embeddings generated for pages
- [ ] Semantic clustering works
- [ ] Content depth analysis

### Features Requiring Perplexity
- [ ] Truth risk scoring
- [ ] Claim verification

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to ClickHouse"
```bash
# Check if running
docker ps | grep clickhouse

# Restart
docker-compose restart clickhouse

# Test connection
curl http://localhost:8123/ping
```

### Issue: "Neo4j connection refused"
```bash
# Check if running
docker ps | grep neo4j

# Restart
docker-compose restart neo4j

# Test connection
curl http://localhost:7474
```

### Issue: "Temporal worker not connecting"
```bash
# Check Temporal server
docker-compose logs temporal

# Restart
docker-compose restart temporal

# Verify UI
open http://localhost:8080
```

### Issue: "Frontend shows 'Failed to fetch'"
```bash
# Ensure API is running
curl http://localhost:4000/health

# Check CORS (should be allowed for localhost:3000)
# Check API logs for errors
```

### Issue: "Keywords research fails"
```bash
# This is expected without DataForSEO credentials
# Add credentials to packages/workers/.env:
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password

# Restart worker
```

### Issue: "Build errors in shared package"
```bash
cd packages/shared
npm run build

# If errors, check TypeScript version
npm list typescript

# Rebuild
rm -rf dist
npm run build
```

---

## 📊 Sample Data (For Testing Without APIs)

### Create Test Project
```bash
# Via API
curl -X POST http://localhost:4000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Site",
    "domain": "example.com"
  }'
```

### Seed Sample Pages (Optional)
```bash
# Create a seed script
cd packages/shared/src/scripts
cat > seed-sample-data.ts << 'EOF'
import { ClickHousePageRepository } from '../lib/clickhouse/repositories/ClickHousePageRepository';

async function seed() {
    await ClickHousePageRepository.createTable();
    
    const samplePages = [
        {
            site_id: 'example.com',
            page_id: Buffer.from('https://example.com').toString('base64'),
            url: 'https://example.com',
            title: 'Example Domain',
            h1: 'Example Domain',
            word_count: 500,
            status_code: 200,
            link_count_internal: 5,
            link_count_external: 2,
            is_semantic_orphan: false
        }
    ];
    
    for (const page of samplePages) {
        await ClickHousePageRepository.insertPage(page);
    }
    
    console.log('✓ Sample data seeded');
}

seed();
EOF

# Run seed
npx tsx seed-sample-data.ts
```

---

## 🚀 Production Deployment

### Build for Production
```bash
# Build all packages
npm run build

# Verify builds
ls packages/shared/dist
ls packages/app/.next
```

### Docker Deployment (Recommended)
```bash
# Create Dockerfile for each service
# Use docker-compose for orchestration
# Set production environment variables
# Use managed databases (ClickHouse Cloud, Neo4j Aura)
```

### Environment Variables (Production)
```env
# Use strong secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Use production URLs
NEXTAUTH_URL=https://app.apexseo.co
NEXT_PUBLIC_API_URL=https://api.apexseo.co

# Use managed databases
CLICKHOUSE_URL=https://your-clickhouse-cloud.com
NEO4J_URI=neo4j+s://your-neo4j-aura.com
```

---

## ✅ Verification Checklist

### Before Going Live
- [ ] All Docker containers running
- [ ] API responds at `/health`
- [ ] Frontend loads
- [ ] Can create a project
- [ ] Can trigger a crawl
- [ ] Graph visualization works
- [ ] Content optimizer scores content
- [ ] Agents show in system status
- [ ] No console errors in browser
- [ ] No errors in API logs
- [ ] Database connections stable

### Performance Checks
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Graph renders < 2s (for 100 nodes)
- [ ] Content scoring < 1s

---

## 📈 Monitoring

### Key Metrics to Track
1. **API**: Request rate, error rate, response time
2. **Workers**: Workflow success rate, activity duration
3. **Database**: Query performance, connection pool
4. **Frontend**: Page load time, user engagement

### Logging
```bash
# API logs
tail -f packages/api/logs/app.log

# Worker logs
tail -f packages/workers/logs/worker.log

# Docker logs
docker-compose logs -f
```

---

## 🎓 Next Steps

1. **Test all features** using the checklist above
2. **Add your own site** and run a full crawl
3. **Explore the graph** visualization
4. **Try the content optimizer** with real content
5. **Set up alerts** (Slack/email)
6. **Configure scheduled agents** for automated monitoring

**You're ready to go! 🚀**

For issues, check the troubleshooting section or review logs.
