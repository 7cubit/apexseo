terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "apexseo-terraform-state"
    prefix = "staging"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "secretmanager.googleapis.com",
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "staging" {
  name             = "apexseo-staging-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region
  
  settings {
    tier = "db-f1-micro" # Smallest instance for staging
    
    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all-staging"
        value = "0.0.0.0/0" # Restrict in production
      }
    }
    
    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }
  
  deletion_protection = false # Allow deletion in staging
}

resource "google_sql_database" "apexseo" {
  name     = "apexseo"
  instance = google_sql_database_instance.staging.name
}

resource "google_sql_user" "apexseo" {
  name     = "apexseo"
  instance = google_sql_database_instance.staging.name
  password = var.db_password
}

# Secret Manager for sensitive data
resource "google_secret_manager_secret" "db_password" {
  secret_id = "staging-db-password"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

# Cloud Run - App (Next.js)
resource "google_cloud_run_service" "app" {
  name     = "apexseo-app-staging"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/apexseo-app:staging"
        
        ports {
          container_port = 3000
        }
        
        env {
          name  = "NODE_ENV"
          value = "staging"
        }
        
        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.apexseo.name}:${var.db_password}@${google_sql_database_instance.staging.public_ip_address}/apexseo"
        }
        
        env {
          name  = "CLICKHOUSE_HOST"
          value = var.clickhouse_host
        }
        
        env {
          name  = "TEMPORAL_ADDRESS"
          value = var.temporal_address
        }
        
        env {
          name  = "NEXTAUTH_URL"
          value = "https://staging.apexseo.com"
        }
        
        env {
          name  = "NEXTAUTH_SECRET"
          value = var.nextauth_secret
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = "0"
        "autoscaling.knative.dev/maxScale"      = "5"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.staging.connection_name
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.apis]
}

# Cloud Run - API (Fastify)
resource "google_cloud_run_service" "api" {
  name     = "apexseo-api-staging"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/apexseo-api:staging"
        
        ports {
          container_port = 4000
        }
        
        env {
          name  = "NODE_ENV"
          value = "staging"
        }
        
        env {
          name  = "PORT"
          value = "4000"
        }
        
        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.apexseo.name}:${var.db_password}@${google_sql_database_instance.staging.public_ip_address}/apexseo"
        }
        
        env {
          name  = "CLICKHOUSE_HOST"
          value = var.clickhouse_host
        }
        
        env {
          name  = "SERPER_API_KEY"
          value = var.serper_api_key
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = "0"
        "autoscaling.knative.dev/maxScale"      = "5"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.staging.connection_name
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.apis]
}

# Cloud Run - Workers (Temporal)
resource "google_cloud_run_service" "workers" {
  name     = "apexseo-workers-staging"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/apexseo-workers:staging"
        
        env {
          name  = "NODE_ENV"
          value = "staging"
        }
        
        env {
          name  = "TEMPORAL_ADDRESS"
          value = var.temporal_address
        }
        
        env {
          name  = "CLICKHOUSE_HOST"
          value = var.clickhouse_host
        }
        
        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.apexseo.name}:${var.db_password}@${google_sql_database_instance.staging.public_ip_address}/apexseo"
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = "1" # Keep at least 1 worker running
        "autoscaling.knative.dev/maxScale"      = "3"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.staging.connection_name
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.apis]
}

# IAM - Allow public access (staging only)
resource "google_cloud_run_service_iam_member" "app_public" {
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "api_public" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "app_url" {
  value       = google_cloud_run_service.app.status[0].url
  description = "URL of the staging app"
}

output "api_url" {
  value       = google_cloud_run_service.api.status[0].url
  description = "URL of the staging API"
}

output "workers_url" {
  value       = google_cloud_run_service.workers.status[0].url
  description = "URL of the staging workers"
}

output "db_connection_name" {
  value       = google_sql_database_instance.staging.connection_name
  description = "Cloud SQL connection name"
}

output "db_public_ip" {
  value       = google_sql_database_instance.staging.public_ip_address
  description = "Cloud SQL public IP address"
}
