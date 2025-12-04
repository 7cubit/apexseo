variable "clickhouse_org_id" {
  description = "ClickHouse Cloud Organization ID"
  type        = string
  sensitive   = true
}

variable "clickhouse_token_key" {
  description = "ClickHouse Cloud API Token Key"
  type        = string
  sensitive   = true
}

variable "clickhouse_token_secret" {
  description = "ClickHouse Cloud API Token Secret"
  type        = string
  sensitive   = true
}

variable "temporal_api_key" {
  description = "Temporal Cloud API Key"
  type        = string
  sensitive   = true
}

variable "temporal_namespace" {
  description = "Temporal Cloud Namespace"
  type        = string
}
