# ADR-004: API Gateway

## Status
Accepted

## Context
We need a high-performance Node.js web server to act as the API Gateway, handling authentication, validation, and routing requests to the appropriate services or databases.

## Decision
We will use **Fastify**.

## Consequences
### Positive
- **Performance**: Fastify is one of the fastest Node.js frameworks.
- **Ecosystem**: Rich plugin ecosystem (Auth, Rate Limit, Swagger).
- **Schema Validation**: Built-in support for JSON Schema validation.

### Negative
- **Ecosystem Size**: Smaller than Express (though sufficient for our needs).
