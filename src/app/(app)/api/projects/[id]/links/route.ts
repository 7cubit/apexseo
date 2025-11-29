import { NextResponse } from "next/server";
import { ClickHouseEmbeddingStore } from "@/lib/clickhouse/repositories/ClickHouseEmbeddingStore";
import { ClickHouseLinkSuggestionStore } from "@/lib/clickhouse/repositories/ClickHouseLinkSuggestionStore";
import { PageRepository } from "@/lib/neo4j/repositories/PageRepository";
import { client } from "@/lib/clickhouse";

// Helper to calculate L2 distance (Euclidean)
function l2Distance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    try {
        // 1. Check if we already have suggestions (unless refresh is forced)
        if (!forceRefresh) {
            const existing = await ClickHouseLinkSuggestionStore.getTopSuggestions(projectId, 100);
            if (existing.length > 0) {
                return NextResponse.json({ suggestions: existing, source: "cache" });
            }
        }

        // 2. Trigger Temporal Workflow for background processing
        // We check if we should trigger it (e.g. if no suggestions exist or forceRefresh)

        if (forceRefresh || !client) { // If client is missing, we can't check ClickHouse easily here, but we can try to start workflow.
            // Actually, if client is missing, the workflow might also fail if it runs on the same env without config.
            // But assuming the worker has config.

            try {
                if (!process.env.TEMPORAL_ADDRESS && !process.env.TEMPORAL_CLOUD_ADDRESS) {
                    // Fallback to inline if Temporal is not configured
                    // But we want to avoid the heavy inline logic if possible.
                    // For now, let's keep the inline logic as a fallback or just return error.
                    // The user complained about heavy inline logic.
                    // Let's try to connect to Temporal.
                    console.warn("Temporal not configured, falling back to inline logic (warning: slow).");
                    // Fallthrough to inline logic below...
                } else {
                    const { Connection, WorkflowClient } = require('@temporalio/client');
                    const { GenerateLinkSuggestionsWorkflow, QUEUE_SEO_TASKS } = require('@/temporal/workflows');

                    const connection = await Connection.connect();
                    const client = new WorkflowClient({ connection });

                    await client.start(GenerateLinkSuggestionsWorkflow, {
                        args: [{ siteId: projectId }],
                        taskQueue: QUEUE_SEO_TASKS,
                        workflowId: `link-suggestions-${projectId}-${Date.now()}`,
                    });

                    return NextResponse.json({
                        message: "Link suggestion generation started in background.",
                        status: "processing"
                    });
                }
            } catch (e) {
                console.error("Failed to start Temporal workflow", e);
                // Fallthrough to inline logic
            }
        }

        // ... Inline logic (kept as fallback or for when Temporal is missing/fails) ...
        // We will wrap the existing inline logic in a check so it only runs if we didn't return above.

        // 2. Fetch all pages with embeddings and TSPR scores
        // We need TSPR scores from Neo4j and Embeddings from ClickHouse
        // Let's fetch TSPR results from Neo4j first
        const pages = await PageRepository.getTsprResults(projectId);

        if (pages.length === 0) {
            return NextResponse.json({ error: "No pages found. Run TSPR first." }, { status: 400 });
        }

        // Fetch embeddings for these pages
        // This might be slow if done one by one. Better to fetch all embeddings for the site.
        // Let's assume we can fetch all embeddings for the site from ClickHouse.
        // We need to add a method to ClickHouseEmbeddingStore or use raw query here.
        if (!client) return NextResponse.json({ error: "ClickHouse not connected" }, { status: 500 });

        const embeddingsResult = await client.query({
            query: `SELECT page_id, embedding, cluster_id FROM page_embeddings WHERE site_id = {projectId:String}`,
            query_params: { projectId },
            format: 'JSONEachRow'
        });
        const embeddingsRows = await embeddingsResult.json();

        const embeddingsMap = new Map<string, { embedding: number[], clusterId: string }>();
        embeddingsRows.forEach((row: any) => {
            embeddingsMap.set(row.page_id, { embedding: row.embedding, clusterId: row.cluster_id });
        });

        // 3. Fetch existing links to filter out
        const existingLinks = await PageRepository.getAllLinks(projectId);
        const existingLinksSet = new Set(existingLinks.map(l => `${l.source}->${l.target}`));

        // 4. Generate Suggestions
        const suggestions = [];

        // Optimization: Group pages by cluster to avoid N^2 comparison across all pages
        // Only compare pages within the same cluster or "nearby" clusters (if we had cluster centroids).
        // For now, strict same-cluster comparison + a small random sample of others?
        // Or just optimize the loop to be faster.
        // Let's stick to the loop but add a check for cluster match to skip heavy L2 calculation if possible,
        // OR just rely on the fact that we only want high similarity.
        // If we only want high similarity, we can skip if clusters are different (heuristic).

        const pagesByCluster = new Map<string, any[]>();
        for (const p of pages) {
            const c = String(p.cluster || 'unknown');
            if (!pagesByCluster.has(c)) pagesByCluster.set(c, []);
            pagesByCluster.get(c)?.push(p);
        }

        // Compare within clusters (O(M^2) where M << N)
        for (const [clusterId, clusterPages] of Array.from(pagesByCluster.entries())) {
            for (const sourcePage of clusterPages) {
                const sourceData = embeddingsMap.get(sourcePage.page_id);
                if (!sourceData) continue;

                for (const targetPage of clusterPages) {
                    if (sourcePage.page_id === targetPage.page_id) continue;

                    const targetData = embeddingsMap.get(targetPage.page_id);
                    if (!targetData) continue;

                    if (existingLinksSet.has(`${sourcePage.page_id}->${targetPage.page_id}`)) continue;

                    const dist = l2Distance(sourceData.embedding, targetData.embedding);
                    if (dist > 0.8) continue;

                    const similarity = Math.max(0, 1 - dist);
                    const score = similarity * (targetPage.tspr || 0.0001) * 1.2 * 100;

                    suggestions.push({
                        site_id: projectId,
                        from_page_id: sourcePage.page_id,
                        to_page_id: targetPage.page_id,
                        similarity: similarity,
                        target_tspr: targetPage.tspr || 0,
                        score: score,
                        reason: "Same Cluster"
                    });
                }
            }
        }

        // Sort by score
        suggestions.sort((a, b) => b.score - a.score);

        // Take top 1000
        const topSuggestions = suggestions.slice(0, 1000);

        // 5. Store in ClickHouse (Fire and forget / Background)
        if (topSuggestions.length > 0 && client) {
            // We don't await this to speed up response. 
            // Note: In Vercel serverless, this might be killed. 
            // Ideally use waitUntil from @vercel/functions.
            // For now, we just don't await it and hope it finishes or we accept the risk.
            // Or better: await it but it's a single batch so it should be fast.
            // The issue was "writes up to 1000 rows back... while assuming client is instantiated".
            // We checked client.
            // Let's await it to be safe but it's a single batch.
            try {
                await client.insert({
                    table: 'link_suggestions',
                    values: topSuggestions,
                    format: 'JSONEachRow',
                });
            } catch (e) {
                console.error("Failed to save suggestions", e);
            }
        }

        return NextResponse.json({
            suggestions: topSuggestions.slice(0, 100), // Return top 100 for UI
            source: "calculated",
            totalGenerated: topSuggestions.length
        });

    } catch (error) {
        console.error("Link Suggestions Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
