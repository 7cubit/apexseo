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
        // We always try to offload to Temporal first to avoid blocking the response.
        try {
            // Check for Temporal configuration
            if (process.env.TEMPORAL_ADDRESS || process.env.TEMPORAL_CLOUD_ADDRESS) {
                const { Connection, WorkflowClient } = require('@temporalio/client');
                const { GenerateLinkSuggestionsWorkflow, QUEUE_SEO_TASKS } = require('@/temporal/workflows');

                const connection = await Connection.connect();
                const client = new WorkflowClient({ connection });

                const handle = await client.start(GenerateLinkSuggestionsWorkflow, {
                    args: [{ siteId: projectId }],
                    taskQueue: QUEUE_SEO_TASKS,
                    workflowId: `link-suggestions-${projectId}-${Date.now()}`,
                });

                return NextResponse.json({
                    message: "Link suggestion generation started in background.",
                    status: "processing",
                    workflowId: handle.workflowId
                });
            } else {
                console.warn("Temporal not configured, falling back to inline logic.");
            }
        } catch (e) {
            console.error("Failed to start Temporal workflow, falling back to inline logic:", e);
        }

        // 3. Inline Fallback (only if Temporal failed or is not configured)
        // This logic is heavy and should be avoided in production for large sites.

        // Fetch TSPR results from Neo4j
        const pages = await PageRepository.getTsprResults(projectId);

        if (pages.length === 0) {
            return NextResponse.json({ error: "No pages found. Run TSPR first." }, { status: 400 });
        }

        if (!client) return NextResponse.json({ error: "ClickHouse not connected" }, { status: 500 });

        // Fetch embeddings
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

        // Fetch existing links
        const existingLinks = await PageRepository.getAllLinks(projectId);
        const existingLinksSet = new Set(existingLinks.map(l => `${l.source}->${l.target}`));

        // Generate Suggestions
        const suggestions = [];
        const pagesByCluster = new Map<string, any[]>();
        for (const p of pages) {
            const c = String(p.cluster || 'unknown');
            if (!pagesByCluster.has(c)) pagesByCluster.set(c, []);
            pagesByCluster.get(c)?.push(p);
        }

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

        suggestions.sort((a, b) => b.score - a.score);
        const topSuggestions = suggestions.slice(0, 1000);

        if (topSuggestions.length > 0 && client) {
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
            suggestions: topSuggestions.slice(0, 100),
            source: "calculated_inline",
            totalGenerated: topSuggestions.length
        });

    } catch (error) {
        console.error("Link Suggestions Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
