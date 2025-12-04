# Technical Debt Registry

## Prioritization Matrix

| Impact \ Effort | Low Effort | High Effort |
| :--- | :--- | :--- |
| **High Impact** | **P0 (Critical)** | **P1 (Important)** |
| **Low Impact** | **P2 (Nice to have)** | **P3 (Deferred)** |

## Backlog

### P0 - Critical (High Impact, Low Effort)

| ID | Item | Description | Mitigation |
| :--- | :--- | :--- | :--- |
| **TD-001** | **Hardcoded Secrets in Tests** | Some test files might contain hardcoded credentials or API keys. | Audit all `*.test.ts` files and move secrets to `.env.test`. |
| **TD-002** | **Missing Error Handling in Workers** | Some Temporal Activities lack specific error handling for API failures, relying on generic retries. | Implement `try/catch` blocks with specific error types (e.g., `ApplicationFailure.nonRetryable`). |

### P1 - Important (High Impact, High Effort)

| ID | Item | Description | Mitigation |
| :--- | :--- | :--- | :--- |
| **TD-003** | **Lack of Integration Tests** | We have unit tests, but lack end-to-end integration tests covering the full flow (API -> Temporal -> DB). | Set up a CI pipeline with Docker Compose to run E2E tests. |
| **TD-004** | **Schema Migration Strategy** | Currently using manual SQL scripts. Need a robust migration tool for ClickHouse and Neo4j. | Adopt a migration tool like `dbmate` or write a custom migration runner in `packages/database`. |

### P2 - Nice to Have (Low Impact, Low Effort)

| ID | Item | Description | Mitigation |
| :--- | :--- | :--- | :--- |
| **TD-005** | **Shared Library Organization** | `packages/shared` is becoming a "god package". | Split into smaller packages: `@apexseo/db`, `@apexseo/types`, `@apexseo/utils`. |
| **TD-006** | **Logging Consistency** | Log formats vary slightly between API and Workers. | Standardize on a shared `Logger` instance with consistent metadata fields. |

### P3 - Deferred (Low Impact, High Effort)

| ID | Item | Description | Mitigation |
| :--- | :--- | :--- | :--- |
| **TD-007** | **GraphQL Support** | REST API might become chatty for complex dashboard views. | Consider adding a GraphQL layer (Mercurius) to Fastify. |
