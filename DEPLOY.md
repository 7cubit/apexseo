# Deployment Guide for ApexSEO

This guide details the deployment process for the ApexSEO platform, including Docker build steps and environment variable configuration.

## Prerequisites
- Docker & Docker Compose
- Node.js v18+ (for local scripts)
- PostgreSQL Database
- Redis Instance

## Environment Variables
Ensure the following variables are set in your `.env` file (see `.env.example`):

### Core
\`\`\`bash
DATABASE_URL="postgresql://user:password@host:5432/apexseo?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="production"
\`\`\`

### Authentication (Clerk)
\`\`\`bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
\`\`\`

### API Keys
\`\`\`bash
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
\`\`\`

## Docker Build & Run

### 1. Build All Services
\`\`\`bash
docker-compose build
\`\`\`

### 2. Start Services
\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- `api` (Port 4000)
- `admin` (Port 3002)
- `app` (Port 3000)
- `workers` (Background Jobs)

## Database Migration
Run migrations before starting services or as part of the startup script:
\`\`\`bash
cd packages/database
npx prisma migrate deploy
\`\`\`

## Seeding Data (Staging)
To populate the database with dummy data for staging/demos:
\`\`\`bash
psql $DATABASE_URL -f packages/database/SEED.sql
\`\`\`

## Health Checks
- API Health: \`GET https://api.yourdomain.com/health\`
- Admin Health: Check `/admin/system` dashboard

## Security
- Rate limiting is enabled on the API (100 req/min).
- Swagger docs usually disabled or protected in production (check `swagger.ts`).
