import { NextResponse } from "next/server";
import { GraphAlgoRepository } from "@/lib/neo4j/repositories/GraphAlgoRepository";
import { PageRepository } from "@/lib/neo4j/repositories/PageRepository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const projectId = params.id;

    try {
        // 1. Identify Pillar Pages (Top 3 per cluster by indegree)
        const seedUrls = await GraphAlgoRepository.getPillarPages(projectId);

        if (seedUrls.length === 0) {
            return NextResponse.json({ error: "No pillar pages found. Ensure clustering is complete." }, { status: 400 });
        }

        // 2. Run Base PageRank
        await GraphAlgoRepository.runPageRank(projectId);

        // 3. Run Topic-Sensitive PageRank (Personalized)
        await GraphAlgoRepository.runTSPR(projectId, seedUrls);

        // 4. Fetch Results
        const results = await PageRepository.getTsprResults(projectId);

        // Calculate averages
        const totalPr = results.reduce((sum, r) => sum + r.pr, 0);
        const totalTspr = results.reduce((sum, r) => sum + r.tspr, 0);
        const avgPr = results.length > 0 ? totalPr / results.length : 0;
        const avgTspr = results.length > 0 ? totalTspr / results.length : 0;

        return NextResponse.json({
            message: "TSPR calculation complete",
            pagesProcessed: results.length,
            avgPr,
            avgTspr,
            top5: results.slice(0, 5)
        });

    } catch (error) {
        console.error("TSPR API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const projectId = params.id;

    try {
        const results = await PageRepository.getTsprResults(projectId);

        const totalPr = results.reduce((sum, r) => sum + r.pr, 0);
        const totalTspr = results.reduce((sum, r) => sum + r.tspr, 0);
        const avgPr = results.length > 0 ? totalPr / results.length : 0;
        const avgTspr = results.length > 0 ? totalTspr / results.length : 0;

        return NextResponse.json({
            pagesProcessed: results.length,
            avgPr,
            avgTspr,
            results // Return all results for the table
        });
    } catch (error) {
        console.error("TSPR GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
