# API Gateway & Authentication

This document details the API Gateway architecture, authentication flow, and usage.

## 1. Authentication

ApexSEO uses **NextAuth.js** (Frontend) and **JWT** (Gateway) for authentication.

### Flow
1.  **Frontend**: User signs in via NextAuth (GitHub/Google/Credentials).
2.  **Session**: NextAuth issues a session containing a JWT with `userId` and `orgId`.
3.  **API Request**: Frontend attaches the token to the `Authorization: Bearer <token>` header.
4.  **Gateway**: `auth.ts` plugin validates the token signature.

### Test Credentials
-   **Username**: `demo`
-   **Password**: `demo`

## 2. Multi-Tenancy

Data isolation is enforced at the API Gateway level.

-   **Middleware**: `tenancy.ts` plugin extracts `projectId` from the route or body.
-   **Validation**: Checks if the authenticated user's `orgId` matches the project's organization.
-   **Enforcement**: All database queries are scoped by `site_id` or `project_id`.

## 3. API Usage

### Base URL
`http://localhost:4000`

### Endpoints

#### Projects
-   `GET /projects`: List all projects for the user.
-   `POST /projects`: Create a new project.
-   `GET /projects/:id`: Get project details.

#### Sites
-   `GET /sites/:projectId/sites`: List sites for a project.

#### Analysis
-   `POST /analysis/crawl`: Trigger a site crawl.
    ```json
    { "siteId": "example.com", "startUrl": "https://example.com", "depth": 2 }
    ```
-   `POST /analysis/analyze`: Trigger full analysis (TSPR, Clustering, Scoring).
    ```json
    { "projectId": "proj_1" }
    ```

## 4. Rate Limiting

-   **Limit**: 100 requests per minute per IP.
-   **Response**: `429 Too Many Requests`.

## 5. Documentation (Swagger)

Interactive API documentation is available at:
`http://localhost:4000/documentation`
