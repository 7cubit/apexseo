# Frontend Foundation & Editor Experience

This document details the frontend architecture, state management, and editor implementation.

## 1. Architecture

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS + shadcn/ui
-   **State Management**:
    -   **Server State**: SWR (Stale-While-Revalidate) for API data.
    -   **Client State**: React `useState`/`useReducer` for local UI state.
    -   **Auth State**: NextAuth.js `SessionProvider`.

## 2. Authentication

-   **Provider**: `src/providers.tsx` wraps the app in `SessionProvider`.
-   **Protection**: `middleware.ts` protects `/dashboard` and `/projects` routes.
-   **Hooks**: `useSession()` to access user data.

## 3. Rich Text Editor

Located at `src/components/editor/Editor.tsx`.

-   **Library**: TipTap (Headless).
-   **Features**:
    -   Block formatting (H1-H3, Lists).
    -   Markdown support (via shortcuts).
    -   Auto-save (debounced 1s).
-   **Usage**:
    ```tsx
    <Editor initialContent={content} onSave={handleSave} />
    ```

## 4. Content Pipeline

Located at `src/components/pipeline/PipelineBoard.tsx`.

-   **Library**: `@dnd-kit`.
-   **Columns**: Idea, Draft, Review, Published.
-   **Interaction**: Drag and drop cards to update status.

## 5. Error Handling

-   **Global Boundary**: `ErrorBoundary` catches React render errors.
-   **API Errors**: `apiClient` throws errors which are caught by SWR or `try/catch` blocks.
-   **Notifications**: `sonner` displays toast notifications for success/failure.

## 6. Data Fetching (SWR)

Hooks are located in `src/hooks/`.

-   `useProject(id)`: Fetches project details.
-   `useSites(projectId)`: Fetches sites.
-   `useWorkflow()`: Triggers analysis workflows.

Example:
```tsx
const { project, isLoading, error } = useProject('123');
if (isLoading) return <Skeleton />;
if (error) return <ErrorBoundary />;
```
