#!/bin/bash
set -e

echo "🚀 ApexSEO Quick Staging Deployment"
echo "===================================="
echo ""

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    echo "❌ .env.staging not found!"
    echo "Creating from template..."
    
    # Get VM IP from terraform
    VM_IP=$(cd infra/terraform && terraform output -raw vm_ip 2>/dev/null || echo "")
    
    if [ -z "$VM_IP" ]; then
        echo "⚠️  Could not get VM IP from terraform"
        echo "Please enter your VM IP address:"
        read VM_IP
    fi
    
    # Create .env.staging
    cat > .env.staging << EOF
GCP_PROJECT_ID=apexseo-480102
GCP_REGION=us-central1
VM_IP=$VM_IP

DATABASE_URL=postgresql://user:password@$VM_IP:5432/apexseo
CLICKHOUSE_HOST=http://$VM_IP:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
NEO4J_URI=bolt://$VM_IP:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
TEMPORAL_ADDRESS=$VM_IP:7233
SERPER_API_KEY=your-key-here
NEXTAUTH_URL=https://staging.apexseo.co
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NODE_ENV=staging
EOF
    
    echo "✅ Created .env.staging with VM IP: $VM_IP"
    echo "⚠️  Please edit .env.staging and update passwords/API keys"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Load environment
source .env.staging

echo "📋 Configuration:"
echo "  Project: $GCP_PROJECT_ID"
echo "  Region: $GCP_REGION"
echo "  VM IP: $VM_IP"
echo ""

# Authenticate
echo "🔐 Checking GCP authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Not authenticated. Running gcloud auth login..."
    gcloud auth login
fi

gcloud config set project $GCP_PROJECT_ID

# Configure Docker
echo "🔧 Configuring Docker for GCR..."
gcloud auth configure-docker --quiet

# Build images
echo ""
echo "📦 Building Docker images..."
echo "  Building App..."
echo "  (Running local build first to optimize Docker context...)"
npm run build --workspace=@apexseo/app

docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-app:staging \
  -f packages/app/Dockerfile.prebuilt .

echo "  Building API..."
docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-api:staging \
  -f packages/api/Dockerfile .

echo "  Building Workers..."
docker build -t gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging \
  -f packages/workers/Dockerfile .

# Push images
echo ""
echo "⬆️  Pushing images to GCR..."
docker push gcr.io/$GCP_PROJECT_ID/apexseo-app:staging
docker push gcr.io/$GCP_PROJECT_ID/apexseo-api:staging
docker push gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging

# Create/update secrets
echo ""
echo "🔒 Creating/updating secrets..."
for secret in "staging-db-url:$DATABASE_URL" \
              "staging-clickhouse-host:$CLICKHOUSE_HOST" \
              "staging-neo4j-uri:$NEO4J_URI" \
              "staging-neo4j-password:$NEO4J_PASSWORD" \
              "staging-temporal-address:$TEMPORAL_ADDRESS" \
              "staging-serper-key:$SERPER_API_KEY" \
              "staging-nextauth-secret:$NEXTAUTH_SECRET"; do
    
    secret_name=$(echo $secret | cut -d: -f1)
    secret_value=$(echo $secret | cut -d: -f2-)
    
    echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- 2>/dev/null || \
      echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- 2>/dev/null
done

# Deploy services
echo ""
echo "🌐 Deploying to Cloud Run..."

echo "  Deploying App..."
gcloud run deploy apexseo-app-staging \
  --image gcr.io/$GCP_PROJECT_ID/apexseo-app:staging \
  --region $GCP_REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=staging,NEXTAUTH_URL=https://staging.apexseo.co \
  --set-secrets DATABASE_URL=staging-db-url:latest,NEXTAUTH_SECRET=staging-nextauth-secret:latest,CLICKHOUSE_HOST=staging-clickhouse-host:latest,NEO4J_URI=staging-neo4j-uri:latest,NEO4J_PASSWORD=staging-neo4j-password:latest \
  --min-instances 0 \
  --max-instances 5 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --quiet

echo "  Deploying API..."
gcloud run deploy apexseo-api-staging \
  --image gcr.io/$GCP_PROJECT_ID/apexseo-api:staging \
  --region $GCP_REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=staging,PORT=4000 \
  --set-secrets DATABASE_URL=staging-db-url:latest,SERPER_API_KEY=staging-serper-key:latest,CLICKHOUSE_HOST=staging-clickhouse-host:latest,NEO4J_URI=staging-neo4j-uri:latest,NEO4J_PASSWORD=staging-neo4j-password:latest \
  --min-instances 0 \
  --max-instances 5 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --quiet

echo "  Deploying Workers..."
gcloud run deploy apexseo-workers-staging \
  --image gcr.io/$GCP_PROJECT_ID/apexseo-workers:staging \
  --region $GCP_REGION \
  --platform managed \
  --no-allow-unauthenticated \
  --set-env-vars NODE_ENV=staging \
  --set-secrets DATABASE_URL=staging-db-url:latest,TEMPORAL_ADDRESS=staging-temporal-address:latest,CLICKHOUSE_HOST=staging-clickhouse-host:latest,NEO4J_URI=staging-neo4j-uri:latest,NEO4J_PASSWORD=staging-neo4j-password:latest \
  --min-instances 1 \
  --max-instances 3 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --quiet

# Get URLs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Service URLs:"

APP_URL=$(gcloud run services describe apexseo-app-staging \
  --region $GCP_REGION \
  --format 'value(status.url)')
API_URL=$(gcloud run services describe apexseo-api-staging \
  --region $GCP_REGION \
  --format 'value(status.url)')

echo "  App: $APP_URL"
echo "  API: $API_URL"
echo ""

# Health checks
echo "🏥 Running health checks..."
sleep 5

if curl -f -s "$APP_URL/api/health" > /dev/null 2>&1; then
    echo "  App: ✅ Healthy"
else
    echo "  App: ⚠️  Health check failed (may need time to start)"
fi

if curl -f -s "$API_URL/health" > /dev/null 2>&1; then
    echo "  API: ✅ Healthy"
else
    echo "  API: ⚠️  Health check failed (may need time to start)"
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "Next steps:"
echo "  1. Map domain: gcloud run domain-mappings create --service apexseo-app-staging --domain staging.apexseo.co --region $GCP_REGION"
echo "  2. Configure DNS CNAME: staging -> ghs.googlehosted.com"
echo "  3. Visit: https://staging.apexseo.co"
