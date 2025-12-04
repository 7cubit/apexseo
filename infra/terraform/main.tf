terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "4.51.0"
    }
    clickhouse = {
      source = "ClickHouse/clickhouse"
      version = "0.0.2"
    }
    temporalcloud = {
      source = "temporalio/temporalcloud"
      version = "0.0.12" # Use a recent version
    }
  }
}

provider "clickhouse" {
  organization_id = var.clickhouse_org_id
  token_key       = var.clickhouse_token_key
  token_secret    = var.clickhouse_token_secret
}

provider "temporalcloud" {
  api_key = var.temporal_api_key
}

module "temporal" {
  source         = "./modules/temporal"
  namespace_name = var.temporal_namespace
}

provider "google" {
  project = "apexseo-480102"
  region  = "us-central1"
  zone    = "us-central1-a"
}

resource "google_compute_address" "static_ip" {
  name = "apexseo-infra-ip"
}

resource "google_compute_firewall" "allow_infra_ports" {
  name    = "allow-infra-ports"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8123", "9000", "7474", "7687", "7233", "8233", "8080", "22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["apexseo-infra"]
}

resource "google_compute_instance" "infra_vm" {
  name         = "apexseo-infra-vm"
  machine_type = "e2-standard-4" # 4 vCPU, 16 GB RAM
  zone         = "us-central1-a"

  tags = ["apexseo-infra"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 50
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file("${path.module}/gcp_key.pub")}"
  }

  # Allow full access to Cloud APIs (optional, useful for GCS etc)
  service_account {
    scopes = ["cloud-platform"]
  }
}

output "vm_ip" {
  value = google_compute_address.static_ip.address
}
