# Cross-Cutting Concerns

## 1. Authentication & Authorization

### 1.1. Authentication Strategy
ApexSEO uses a **Token-Based Authentication** mechanism.

- **Frontend**: Uses **NextAuth.js** to handle user sessions (GitHub, Google, Credentials).
- **Gateway**: Expects a `Bearer` token (JWT) in the `Authorization` header.
- **Verification**: The API Gateway validates the JWT signature using the shared secret.

### 1.2. Authorization (Multi-Tenancy)
Data isolation is enforced at the Gateway level via the `tenancy` plugin.

1.  **Extraction**: Middleware extracts `projectId` from route params or request body.
2.  **Lookup**: Verifies that the `projectId` belongs to the authenticated user's `orgId`.
3.  **Enforcement**: If mismatch, returns `403 Forbidden`.

## 2. Rate Limiting

To protect the system from abuse and ensure fair usage, we implement rate limiting at the API Gateway.

- **Technology**: `@fastify/rate-limit` backed by Redis (production) or LRU Cache (dev).
- **Policy**:
    - **Standard**: 100 requests per minute per IP.
    - **Heavy Endpoints** (e.g., `/analysis/crawl`): 10 requests per minute per user.
- **Response**: `429 Too Many Requests` with `Retry-After` header.

## 3. Resiliency & Fault Tolerance

### 3.1. Circuit Breakers
External API calls (DataForSEO, OpenAI) are wrapped in Circuit Breakers using `opossum`.

- **Threshold**: Open circuit after 50% failure rate.
- **Reset Timeout**: Try again after 30 seconds.
- **Fallback**: Return cached data or a graceful error message.

### 3.2. Retries
- **Temporal Workflows**: Automatically retry failed Activities with exponential backoff.
- **Database Operations**: The ClickHouse and Neo4j clients implement internal retry logic for transient connection errors.

## 4. Observability

### 4.1. Logging
We use **Pino** for high-performance, structured JSON logging.

- **Levels**: `info` (default), `debug` (dev), `error` (exceptions).
- **Context**: All logs include `requestId`, `userId`, and `traceId`.

### 4.2. Telemetry
The system is instrumented with **OpenTelemetry**.

- **Traces**: Distributed tracing across API Gateway, Workers, and Databases.
- **Metrics**: Request latency, error rates, active workflows, and queue depth.
