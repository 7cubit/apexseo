# Development Setup Guide

This guide covers the setup, configuration, and troubleshooting for the ApexSEO development environment.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Docker**: v24 or higher (with Docker Compose)
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apexseo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy the example environment file and update it with your local credentials.
   ```bash
   cp .env.example .env
   ```
   *Note: For local development, the default values in `.env.example` are usually sufficient if you are running the provided Docker containers.*

4. **Start Infrastructure**
   Start the local databases (ClickHouse and Neo4j).
   ```bash
   docker-compose up -d
   ```

5. **Initialize Databases**
   Run the migration script to set up the database schemas.
   ```bash
   npm run migrate --workspace=@apexseo/database
   ```

6. **Seed Data (Optional)**
   Populate the database with mock data for testing.
   ```bash
   npm run seed --workspace=@apexseo/database
   ```

## Running the Application

- **Development Mode** (All apps)
  ```bash
  npm run dev
  ```

- **Specific Workspace**
  ```bash
  npm run dev --workspace=@apexseo/app
  ```

## Testing

- **Run all tests**
  ```bash
  npm test
  ```

- **Run tests for a specific workspace**
  ```bash
  npm test --workspace=@apexseo/shared
  ```

## Troubleshooting

### Database Connection Issues
If you encounter `ECONNREFUSED` or `ECONNRESET` errors when connecting to ClickHouse or Neo4j:
1. Ensure containers are running: `docker ps`
2. Check container logs: `docker logs apexseo-clickhouse-1`
3. Verify ports are not occupied by other services (8123 for ClickHouse, 7687 for Neo4j).
4. Restart containers: `docker-compose restart`

### Build Errors
If you see TypeScript errors during build:
1. Ensure all dependencies are installed: `npm install`
2. Clean the build cache: `npm run clean` (if configured) or `rm -rf .turbo node_modules` and reinstall.

## Directory Structure

- `packages/app`: Next.js frontend application
- `packages/api`: Backend API service
- `packages/shared`: Shared utilities and libraries
- `packages/database`: Database migrations and seeds
- `infra`: Infrastructure configuration (Docker, Terraform)
