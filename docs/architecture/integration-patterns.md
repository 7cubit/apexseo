# Integration Architecture

## 1. Overview

ApexSEO employs a **Microservices-based Architecture** with a **Dual-Store Data Strategy**. The system is designed for high-scale SEO analysis, leveraging specialized databases for different data types and a robust orchestration engine for complex workflows.

## 2. Core Components

### 2.1. Databases (The Dual-Store Pattern)

We use a "Right Tool for the Job" approach, splitting data between a Graph Database and a Columnar Store.

| Component | Technology | Role | Key Data |
| :--- | :--- | :--- | :--- |
| **The Map** | **Neo4j** | Stores the structural web of the internet. Optimized for traversal, relationship analysis, and graph algorithms. | Sites, Pages, Links, Clusters, Keywords. |
| **The Library** | **ClickHouse** | Stores high-volume content, metadata, and analytics. Optimized for aggregation, filtering, and vector search. | HTML Content, Embeddings, Rankings, Audit Logs. |

### 2.2. Orchestration

| Component | Technology | Role |
| :--- | :--- | :--- |
| **The Conductor** | **Temporal** | Manages long-running, reliable workflows. Ensures fault tolerance, retries, and state management for distributed processes. | Crawling, Scoring, Reporting. |

### 2.3. Services

| Component | Technology | Role |
| :--- | :--- | :--- |
| **API Gateway** | **Fastify** | Entry point for the frontend. Handles auth, rate limiting, and routing. |
| **Worker Cluster** | **Node.js** | Executes Temporal Activities. Scalable pool of workers processing tasks. |

## 3. Integration Patterns

### 3.1. Ingestion Flow (Saga Pattern)

When a new project is added, a Temporal Workflow orchestrates the ingestion across both stores.

```mermaid
sequenceDiagram
    participant API as API Gateway
    participant T as Temporal
    participant W as Worker
    participant CH as ClickHouse
    participant N4J as Neo4j

    API->>T: Start ProjectIngestionWorkflow
    T->>W: Execute Activities
    
    par Parallel Write
        W->>CH: Write Project Metadata
        W->>N4J: Create Project Node
    end

    W->>T: Complete
```

### 3.2. Crawl & Analysis Flow

Data flows from the crawler to both databases, with Temporal ensuring consistency.

```mermaid
graph TD
    subgraph Temporal Workflow
        Start((Start)) --> Crawl[CrawlPageActivity]
        Crawl --> Parse[ParseHTML]
        Parse --> WriteCH[Write to ClickHouse]
        Parse --> WriteN4J[Write to Neo4j]
        WriteCH --> Embed[Generate Embeddings]
        Embed --> UpdateCH[Update ClickHouse]
        WriteN4J --> Cluster[Cluster Analysis]
        Cluster --> UpdateN4J[Update Neo4j]
    end

    WriteCH -.->|Content, Meta| ClickHouse[(ClickHouse)]
    WriteN4J -.->|Nodes, Links| Neo4j[(Neo4j)]
    Embed -.->|Vectors| ClickHouse
    Cluster -.->|Relationships| Neo4j
```

### 3.3. Data Synchronization (The Truth Table)

To maintain consistency without distributed transactions, we define a "Source of Truth" for each data entity.

| Entity | Source of Truth | Secondary Store | Sync Mechanism |
| :--- | :--- | :--- | :--- |
| **URL Structure** | Neo4j | ClickHouse | Workflow (Crawl) |
| **Links** | Neo4j | ClickHouse (Aggregates) | Workflow (Crawl) |
| **Content** | ClickHouse | Neo4j (Title/H1) | Workflow (Crawl) |
| **Embeddings** | ClickHouse | None | Workflow (Analysis) |
| **Clusters** | Neo4j | ClickHouse (ClusterID) | Workflow (Clustering) |

## 4. Service Boundaries

### 4.1. API Gateway (`packages/api`)
- **Responsibility**: Request handling, Authentication, Validation, Querying Databases for UI.
- **Constraint**: **READ-ONLY** access to Databases (mostly). **WRITE** operations should trigger Temporal Workflows.
- **Direct Writes**: Allowed only for simple entities (e.g., User Settings) that don't require orchestration.

### 4.2. Workers (`packages/workers`)
- **Responsibility**: Heavy lifting, External API calls, Database Writes, Complex Logic.
- **Constraint**: Stateless. All state must be passed via Temporal Context or persisted in DB.

### 4.3. Shared Library (`packages/shared`)
- **Responsibility**: Common Types, Database Clients, Utility Functions.
- **Constraint**: Must be stateless and side-effect free (except for DB clients).
