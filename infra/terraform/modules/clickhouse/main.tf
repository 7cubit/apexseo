terraform {
  required_providers {
    clickhouse = {
      source = "ClickHouse/clickhouse"
    }
  }
}

resource "clickhouse_service" "apexseo_db" {
  name           = "apexseo-db"
  cloud_provider = "gcp"
  region         = "us-central1"
  tier           = "development" # or "production" based on need
  
  ip_allow_list {
    source = "0.0.0.0/0" # Update this to restrict access in production
    description = "Allow all"
  }
}

output "clickhouse_host" {
  value = clickhouse_service.apexseo_db.endpoints[0].host
}

output "clickhouse_password" {
  value     = clickhouse_service.apexseo_db.password
  sensitive = true
}
