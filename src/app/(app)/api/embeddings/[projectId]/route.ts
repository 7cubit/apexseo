import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { initClickHouse, insertEmbedding } from "@/lib/clickhouse";
import { getProjectPages, updatePageCluster } from "@/lib/neo4j";
import { kmeans } from "ml-kmeans";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    const projectId = params.projectId;
    const { k = 7 } = await request.json();

    try {
        // 1. Init ClickHouse
        await initClickHouse();

        // 2. Fetch Pages
        const pages = await getProjectPages(projectId);
        if (pages.length === 0) {
            // Mock pages if DB is empty for demo
            return NextResponse.json({ message: "No pages found to cluster (Mock mode)", clusters: [] });
        }

        // 3. Generate Embeddings
        const embeddings: number[][] = [];
        const pageUrls: string[] = [];

        for (const page of pages) {
            if (page.text) {
                const embedding = await generateEmbedding(page.text.substring(0, 500)); // Limit text
                embeddings.push(embedding);
                pageUrls.push(page.url);

                // Store in ClickHouse
                await insertEmbedding(page.url, embedding);
            }
        }

        if (embeddings.length < k) {
            return NextResponse.json({ error: `Not enough pages (${embeddings.length}) for k=${k}` }, { status: 400 });
        }

        // 4. K-means Clustering
        const result = kmeans(embeddings, k, { initialization: 'kmeans++' });

        // 5. Update Neo4j
        for (let i = 0; i < pageUrls.length; i++) {
            const clusterId = result.clusters[i];
            await updatePageCluster(projectId, pageUrls[i], clusterId, embeddings[i]);
        }

        return NextResponse.json({
            message: "Clustering completed",
            k,
            pagesProcessed: pageUrls.length,
            centroids: result.centroids
        });

    } catch (error) {
        console.error("Clustering failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
