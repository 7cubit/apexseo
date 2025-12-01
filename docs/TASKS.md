# Task Status

## Resolved Issues

- [x] **Double Sidebar Issue**: The `DashboardLayout` was being applied redundantly in several page components (`sites/[id]/page.tsx`, `sites/[id]/pages/[page_id]/page.tsx`, etc.) while also being applied globally in `(app)/layout.tsx`. This has been fixed by removing the local `DashboardLayout` wrappers.
- [x] **Crawler Ingestion Update**: Updated `src/app/(app)/api/crawl/[url]/route.ts` to use consistent base64 `pageId` generation. Deprecated the old `savePage` in `src/lib/neo4j.ts`. Verified `src/temporal/activities.ts` and `src/lib/crawler.ts` use `PageRepository.savePageWithLinks`.

## Pending Tasks

- [ ] Verify fix on all routes.
