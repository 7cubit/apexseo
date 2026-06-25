#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ApexSEO Staging Deployment Script${NC}"
echo "========================================"

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    echo -e "${RED}Error: .env.staging file not found${NC}"
    echo "Please create .env.staging with your configuration"
    exit 1
fi

# Load environment variables
source .env.staging

# Check required variables
required_vars=("GCP_PROJECT_ID" "GCP_REGION")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env.staging${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Project: $GCP_PROJECT_ID"
echo "  Region: $GCP_REGION"
echo ""

# Authenticate with GCP (if not already authenticated)
echo -e "${YELLOW}🔐 Checking GCP authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Not authenticated. Running gcloud auth login..."
    gcloud auth login
fi

# Set project
gcloud config set project $GCP_PROJECT_ID

# Build Docker images
echo -e "${YELLOW}📦 Building Docker images...${NC}"
echo "Building App..."
docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-app:staging \
    -f packages/app/Dockerfile .

echo "Building API..."
docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-api:staging \
    -f packages/api/Dockerfile .

echo "Building Workers..."
docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging \
    -f packages/workers/Dockerfile .

# Configure Docker for GCR
echo -e "${YELLOW}🔧 Configuring Docker for GCR...${NC}"
gcloud auth configure-docker --quiet

# Push images to GCR
echo -e "${YELLOW}⬆️  Pushing images to Google Container Registry...${NC}"
docker push gcr.io/$GCP_PROJECT_ID/apexseo-app:staging
docker push gcr.io/$GCP_PROJECT_ID/apexseo-api:staging
docker push gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging

# Deploy to Cloud Run
echo -e "${YELLOW}🌐 Deploying to Cloud Run...${NC}"

echo "Deploying App..."
gcloud run deploy apexseo-app-staging \
    --image gcr.io/$GCP_PROJECT_ID/apexseo-app:staging \
    --region $GCP_REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=staging \
    --min-instances 0 \
    --max-instances 5 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60 \
    --quiet

echo "Deploying API..."
gcloud run deploy apexseo-api-staging \
    --image gcr.io/$GCP_PROJECT_ID/apexseo-api:staging \
    --region $GCP_REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=staging,PORT=4000 \
    --min-instances 0 \
    --max-instances 5 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60 \
    --quiet

echo "Deploying Workers..."
gcloud run deploy apexseo-workers-staging \
    --image gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging \
    --region $GCP_REGION \
    --platform managed \
    --no-allow-unauthenticated \
    --set-env-vars NODE_ENV=staging \
    --min-instances 1 \
    --max-instances 3 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --quiet

# Get service URLs
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📍 Service URLs:${NC}"

APP_URL=$(gcloud run services describe apexseo-app-staging \
    --region $GCP_REGION \
    --format 'value(status.url)')
API_URL=$(gcloud run services describe apexseo-api-staging \
    --region $GCP_REGION \
    --format 'value(status.url)')
WORKERS_URL=$(gcloud run services describe apexseo-workers-staging \
    --region $GCP_REGION \
    --format 'value(status.url)')

echo "  App:     $APP_URL"
echo "  API:     $API_URL"
echo "  Workers: $WORKERS_URL"
echo ""

# Run health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 5

if curl -f -s "$APP_URL/api/health" > /dev/null 2>&1; then
    echo -e "  App: ${GREEN}✓ Healthy${NC}"
else
    echo -e "  App: ${RED}✗ Health check failed${NC}"
fi

if curl -f -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "  API: ${GREEN}✓ Healthy${NC}"
else
    echo -e "  API: ${RED}✗ Health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Staging environment is ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. Set up custom domain (staging.apexseo.com)"
echo "  2. Configure SSL certificate"
echo "  3. Run database migrations"
echo "  4. Seed sample data"
