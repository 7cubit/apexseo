import { NextResponse } from "next/server";
import { PageRepository } from "@/lib/neo4j/repositories/PageRepository";
import { crawlWorkflow } from "@/temporal/workflows";

export async function POST(request: Request, { params }: { params: { url: string } }) {
    const url = decodeURIComponent(params.url);

    try {
        // 1. Create Page node
        const pageId = url.replace(/[^a-zA-Z0-9]/g, "-");
        await PageRepository.createOrUpdatePage({
            pageId,
            url,
            status: 'pending'
        });

        // 2. Trigger Crawl (Directly for now)
        // Note: In production, this should be a background job (Temporal/Queue)
        // We don't await this to avoid timeout, or we await if we want to block (bad practice but ok for demo)
        // Let's NOT await it, so the response is fast.
        // But we need to import crawlSite.
        const { crawlSite } = await import("@/lib/crawler");
        crawlSite(url, "junet-japan").catch(err => console.error("Background crawl failed:", err));

        return NextResponse.json({ message: "Crawl started", url });

    } catch (error) {
        console.error("Crawl error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

