# Staging Environment Setup Guide

## Overview

This guide walks through deploying the ApexSEO staging environment to Google Cloud Platform using Cloud Run.

## Prerequisites

- Google Cloud Project (`apexseo-480102`)
- `gcloud` CLI installed and configured
- Docker installed locally
- Terraform installed (optional, for infrastructure provisioning)

---

## Quick Start

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.staging.example .env.staging

# Edit and fill in your values
nano .env.staging
```

Required values:
- `DATABASE_URL`: Cloud SQL connection string
- `CLICKHOUSE_HOST`: ClickHouse Cloud URL
- `TEMPORAL_ADDRESS`: Temporal Cloud address
- `SERPER_API_KEY`: Serper.dev API key
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

### 2. Deploy Infrastructure (Terraform)

```bash
cd infra/terraform/environments/staging

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- Cloud SQL PostgreSQL instance
- Cloud Run services (app, api, workers)
- Secret Manager secrets
- IAM permissions

### 3. Manual Deployment

```bash
# From project root
./scripts/deploy-staging.sh
```

This script will:
1. Build Docker images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Run health checks

### 4. Automated Deployment (CI/CD)

Push to the `develop` branch to trigger automatic deployment:

```bash
git checkout -b develop
git push origin develop
```

GitHub Actions will:
1. Run tests
2. Build Docker images
3. Push to GCR
4. Deploy to Cloud Run
5. Run health checks

---

## Architecture

```
┌─────────────────────────────────────┐
│   Cloud Load Balancer (optional)    │
│      staging.apexseo.com            │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌──────▼──────┐
│  App       │    │  API        │
│ (Next.js)  │    │ (Fastify)   │
│ Cloud Run  │    │ Cloud Run   │
└───┬────────┘    └──────┬──────┘
    │                    │
    └────────┬───────────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───▼──┐ ┌──▼───┐ ┌──▼────┐
│Cloud │ │Click │ │Temporal│
│ SQL  │ │House │ │ Cloud  │
└──────┘ └──────┘ └────────┘
```

---

## Service URLs

After deployment, get your service URLs:

```bash
# App URL
gcloud run services describe apexseo-app-staging \
  --region us-central1 \
  --format 'value(status.url)'

# API URL
gcloud run services describe apexseo-api-staging \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## Database Setup

### Run Migrations

```bash
# SSH into Cloud SQL proxy or use Cloud Shell
gcloud sql connect apexseo-staging-db --user=apexseo

# Run migrations
psql -d apexseo -f packages/database/migrations/*.sql
```

### Seed Sample Data

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export CLICKHOUSE_HOST="https://..."

# Run seed script
cd packages/database
npm run seed:clickhouse
```

---

## Monitoring

### Cloud Run Logs

```bash
# View App logs
gcloud run services logs read apexseo-app-staging \
  --region us-central1 \
  --limit 50

# View API logs
gcloud run services logs read apexseo-api-staging \
  --region us-central1 \
  --limit 50
```

### Cloud Monitoring

Access metrics in Google Cloud Console:
- Navigate to Cloud Run → Select service → Metrics
- View request count, latency, error rate

---

## Troubleshooting

### Build Failures

```bash
# Check Docker build locally
docker build -f packages/app/Dockerfile .

# View build logs in GitHub Actions
# Go to Actions tab → Select workflow run
```

### Deployment Failures

```bash
# Check Cloud Run deployment status
gcloud run services describe apexseo-app-staging \
  --region us-central1

# View recent revisions
gcloud run revisions list \
  --service apexseo-app-staging \
  --region us-central1
```

### Database Connection Issues

```bash
# Test Cloud SQL connectivity
gcloud sql connect apexseo-staging-db --user=apexseo

# Check Cloud Run service account permissions
gcloud projects get-iam-policy apexseo-480102
```

---

## Rollback

### Rollback to Previous Revision

```bash
# List revisions
gcloud run revisions list \
  --service apexseo-app-staging \
  --region us-central1

# Rollback
gcloud run services update-traffic apexseo-app-staging \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### Rollback Database

```bash
# List backups
gcloud sql backups list --instance apexseo-staging-db

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance apexseo-staging-db
```

---

## Cost Optimization

### Current Configuration

- **App**: 0-5 instances, 512Mi RAM, 1 CPU
- **API**: 0-5 instances, 512Mi RAM, 1 CPU
- **Workers**: 1-3 instances, 1Gi RAM, 1 CPU
- **Cloud SQL**: db-f1-micro (smallest instance)

### Estimated Monthly Cost

- Cloud Run: ~$10-20
- Cloud SQL: ~$7
- ClickHouse Cloud: $0-20
- Temporal Cloud: $0
- **Total: ~$17-47/month**

### Further Optimization

1. **Reduce worker min instances** to 0 if Temporal polling isn't critical
2. **Use Cloud SQL proxy** instead of public IP
3. **Enable Cloud CDN** for static assets
4. **Set up budget alerts** in GCP

---

## Security

### Secrets Management

All secrets are stored in Google Secret Manager:

```bash
# Create secret
echo -n "your-secret-value" | gcloud secrets create staging-db-password \
  --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding staging-db-password \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Network Security

- Cloud SQL: Restrict to Cloud Run service accounts only
- Cloud Run: Enable VPC connector for private networking (optional)
- Firewall: Limit access to staging environment

---

## Next Steps

1. **Set up custom domain**: `staging.apexseo.com`
2. **Configure SSL certificate**: Auto-managed by Cloud Run
3. **Enable Cloud CDN**: For static assets
4. **Set up monitoring alerts**: Error rates, latency
5. **Configure backup schedule**: Daily backups
6. **Test end-to-end flows**: User registration, GSC connection, etc.

---

## Support

For issues or questions:
1. Check Cloud Run logs
2. Review GitHub Actions workflow runs
3. Consult GCP documentation
4. Contact the team
