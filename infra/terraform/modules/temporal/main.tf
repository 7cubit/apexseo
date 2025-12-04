terraform {
  required_providers {
    temporalcloud = {
      source = "temporalio/temporalcloud"
    }
  }
}

resource "temporalcloud_namespace" "apexseo_namespace" {
  name             = var.namespace_name
  regions          = ["gcp-us-central1"]
  retention_days   = 30
  # certificate_filters removed as we are using API Key auth or verifying syntax
  # certificate_filters {
  #   common_name = "apexseo"
  # }
  # Note: Temporal Cloud Terraform provider might vary in resource names.
  # This is a best-effort configuration based on standard practices.
}

# output "temporal_grpc_endpoint" {
#   value = temporalcloud_namespace.apexseo_namespace.endpoints.grpc
# }
