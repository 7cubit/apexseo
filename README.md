# ApexSEO Monorepo

This repository contains the source code for the ApexSEO platform, organized as a Turborepo monorepo.

## Structure

- **`packages/app`**: Next.js frontend application.
- **`packages/api`**: Fastify API Gateway.
- **`packages/workers`**: Temporal workers.
- **`packages/shared`**: Shared libraries, types, and utilities.
- **`infra/terraform`**: Infrastructure as Code (Neo4j, ClickHouse, Temporal).

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Terraform (for infra deployment)

### Installation

```bash
npm install
```

### Local Development

To start the entire stack (App, API, Workers, Temporal, Databases):

```bash
docker-compose up -d
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Temporal UI**: http://localhost:8080

### Infrastructure

Provision infrastructure using Terraform:

```bash
cd infra/terraform
terraform init
terraform apply
```

### CI/CD

GitHub Actions are configured in `.github/workflows`:
- `ci.yml`: Runs on PRs and push to main (Build, Lint, Test).
- `deploy.yml`: Deploys to production on push to main.

## Secrets

Copy `.env.example` to `.env` and fill in the required credentials for:
- OpenAI
- DataForSEO
- ClickHouse
- Neo4j
- Temporal
