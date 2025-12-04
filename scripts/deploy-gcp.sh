#!/bin/bash
set -e

# 1. Apply Terraform
echo "Applying Terraform..."
cd infra/terraform
terraform init
terraform apply -auto-approve
VM_IP=$(terraform output -raw vm_ip)
cd ../..

echo "VM IP: $VM_IP"

# 2. Wait for SSH to be ready (simple sleep for now)
echo "Waiting for VM to initialize..."
sleep 30

# 3. Copy files
echo "Copying files to VM..."
gcloud compute scp --zone us-central1-a --ssh-key-file infra/terraform/gcp_key \
    docker-compose.yml \
    clickhouse-users.xml \
    scripts/setup-vm.sh \
    ubuntu@apexseo-infra-vm:~/app/

# 4. Run setup script
echo "Running setup script on VM..."
gcloud compute ssh --zone us-central1-a --ssh-key-file infra/terraform/gcp_key ubuntu@apexseo-infra-vm --command "chmod +x ~/app/setup-vm.sh && ~/app/setup-vm.sh"

echo "Deployment complete!"
echo "ClickHouse: http://$VM_IP:8123"
echo "Neo4j: http://$VM_IP:7474"
echo "Temporal: http://$VM_IP:8080"
