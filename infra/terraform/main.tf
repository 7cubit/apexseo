terraform {
  required_providers {
    neo4j = {
      source = "neo4j/neo4j"
      version = "0.1.0"
    }
    clickhouse = {
      source = "clickhouse/clickhouse"
      version = "0.1.0"
    }
  }
}

module "neo4j" {
  source = "./modules/neo4j"
  # vars
}

module "clickhouse" {
  source = "./modules/clickhouse"
  # vars
}

module "temporal" {
  source = "./modules/temporal"
  # vars
}
