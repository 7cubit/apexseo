# ApexSEO Architecture Report

## 1. High-Level Overview
ApexSEO is a comprehensive SEO platform built as a monorepo using **Turborepo**. It consists of a Fastify-based API Gateway, a Next.js Admin Dashboard, a Next.js User App, and a Temporal-based Worker service.

## 2. System Components

### 2.1 Backend API (`packages/api`)
- **Framework**: Fastify
- **Port**: 4000
- **Key Features**:
    - **Authentication**: Clerk + RBAC Middleware
    - **Tenancy**: Project-based isolation
    - **Documentation**: Swagger/OpenAPI at `/documentation`
    - **Monitoring**: Redis-based metrics, Slack alerting, `/health` endpoint
    - **Rate Limiting**: Redis-backed (100 req/min)

### 2.2 Shared Libraries (`packages/shared`)
- **Database**: Prisma ORM (PostgreSQL)
- **Redis**: Shared `ioredis` client
- **Services**: Common business logic (MetricCollector, SlackAlert, etc.)
- **Types**: Shared TypeScript interfaces

### 2.3 Worker Service (`packages/workers`)
- **Engine**: Temporal.io
- **Role**: Handles long-running tasks (Crawling, Reports, Email Drips)
- **Queues**: Also supports BullMQ for simpler background jobs if needed.

### 2.4 Admin Dashboard (`packages/admin`)
- **Framework**: Next.js (App Router)
- **Port**: 3002
- **Key Features**:
    - **RBAC**: Protected routes for Admins/Super Admins
    - **Executive Dashboard**: Real-time stats, System Health
    - **Management**: Users, Products, Campaigns, Billing

### 2.5 Database Schema (`packages/database`)
- **Primary DB**: PostgreSQL
- **Key Models**:
    - `User`: Core identity (Clerk ID)
    - `Product`: Subscription plans
    - `EmailCampaign` / `SentEmail`: Marketing
    - `AuditLog`: Security tracking
    - `Metric`: Stored in Redis, not SQL (ephemeral)

## 3. Deployment & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Ready for Kubernetes or ECS
- **CI/CD**: GitHub Actions (planned)
- **Environment**: Managed via `.env` (API Keys, DB URLs)

## 4. Security Posture
- **Auth**: Strict RBAC enforcement.
- **Data**: encrypted at rest (DB), HTTPS in transit.
- **Protection**: Rate limiting, Input Validation (Zod), Helmet headers.
- **Auditing**: Comprehensive `AuditLog` for admin actions.
