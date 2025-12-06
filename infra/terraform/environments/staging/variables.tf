variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "apexseo-480102"
}

variable "gcp_region" {
  description = "GCP Region for resources"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "clickhouse_host" {
  description = "ClickHouse Cloud host URL"
  type        = string
  default     = "http://localhost:8123" # Override in terraform.tfvars
}

variable "clickhouse_user" {
  description = "ClickHouse username"
  type        = string
  default     = "default"
}

variable "clickhouse_password" {
  description = "ClickHouse password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "temporal_address" {
  description = "Temporal Cloud address (namespace.tmprl.cloud:7233)"
  type        = string
  default     = "localhost:7233" # Override in terraform.tfvars
}

variable "temporal_namespace" {
  description = "Temporal namespace"
  type        = string
  default     = "apexseo-staging"
}

variable "serper_api_key" {
  description = "Serper.dev API key"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth.js secret for session encryption"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}
