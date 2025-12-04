# ADR-002: Dual-Store Database Strategy

## Status
Accepted

## Context
SEO data is heterogeneous. We need to model the "web" of links (Graph) while also performing heavy aggregations on content metadata and embeddings (OLAP). A single database cannot optimally serve both use cases.

## Decision
We will use a **Dual-Store Strategy**:
1.  **Neo4j**: For graph relationships (PageRank, Clusters, Link Analysis).
2.  **ClickHouse**: For high-volume analytics, embeddings, and time-series data.

## Consequences
### Positive
- **Performance**: Each database does what it's best at. Graph queries are fast in Neo4j; Aggregations are instant in ClickHouse.
- **Scalability**: ClickHouse scales horizontally for massive datasets.

### Negative
- **Complexity**: Requires keeping two data stores in sync.
- **Consistency**: We must accept eventual consistency (managed by Temporal workflows).
