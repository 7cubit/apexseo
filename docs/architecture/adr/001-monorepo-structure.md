# ADR-001: Monorepo Structure

## Status
Accepted

## Context
ApexSEO consists of multiple distinct but related components: a Next.js frontend, a Fastify API Gateway, a Worker cluster, and shared libraries. Managing these across separate repositories would lead to code duplication, version mismatches, and complex CI/CD pipelines.

## Decision
We will use a **Monorepo** structure managed by **Turborepo** and **pnpm workspaces**.

## Consequences
### Positive
- **Code Sharing**: Shared logic (types, DB clients) lives in `packages/shared` and is consumed by all apps.
- **Atomic Commits**: Changes spanning frontend and backend can be committed together.
- **Unified Tooling**: Single linting, testing, and build configuration.

### Negative
- **Build Complexity**: Requires careful configuration of caching and task dependencies.
- **Repo Size**: The repository is larger than individual ones (though manageable for this scale).
