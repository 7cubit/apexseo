import { NextRequest, NextResponse } from 'next/server';
import { ClickHousePageRepository } from '@/lib/clickhouse/repositories/ClickHousePageRepository';
import { ClickHouseClaimStore } from '@/lib/clickhouse/repositories/ClickHouseClaimStore';
import { extractClaims } from '@/lib/llm';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(
    req: NextRequest,
    { params }: { params: { pageId: string } }
) {
    const pageId = params.pageId;
    // Actually, if folder is [pageId], param is pageId.
    // Let's assume params.pageId.

    // Wait, I need to be careful with the param name.
    // If I name the folder [pageId], the param is pageId.
    // But in the previous tool call I used params.id for [id].
    // I will use params.pageId.

    // Correction: The write_to_file target is .../api/verify/[pageId]/route.ts
    // So params should be { pageId: string }

    // However, I need to be sure.
    // Let's use params.pageId.

    try {
        // 1. Fetch Page
        // pageId might be base64 encoded URL or UUID.
        // The repository expects what is stored in 'page_id' column.
        const page = await ClickHousePageRepository.getPageById(pageId) as any; // Cast to any or Page interface if imported
        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        // 2. Extract Claims
        const text = page.text || "";
        if (text.length < 50) {
            return NextResponse.json({ message: "Text too short for verification", claims: [] });
        }

        const extractedClaims = await extractClaims(text);
        const results = [];

        // 3. Verify Claims
        for (const extracted of extractedClaims) {
            const embedding = await generateEmbedding(extracted.text);
            const similar = await ClickHouseClaimStore.findSimilarKBEntries(embedding, 1);

            let riskScore = 0.5; // Default unknown
            let status: 'verified' | 'unverified' | 'debunked' = 'unverified';

            if (similar.length > 0) {
                // @ts-ignore - dist is returned by query but not in interface explicitly if not mapped? 
                // Wait, findSimilarKBEntries returns KBEntry which doesn't have dist.
                // I should update the interface or cast it.
                // The query returns 'dist'.
                const bestMatch = similar[0] as any;
                if (bestMatch.dist < 0.3) {
                    riskScore = 0.1;
                    status = 'verified';
                } else if (bestMatch.dist > 0.6) {
                    riskScore = 0.8;
                    status = 'debunked'; // Or at least "contradicted" or "unsupported"
                }
            } else {
                riskScore = 0.9; // No knowledge found
                status = 'unverified';
            }

            const claim = {
                claim_id: Buffer.from(extracted.text).toString('base64').substring(0, 20),
                site_id: page.site_id,
                page_id: page.page_id,
                text: extracted.text,
                embedding: embedding,
                risk_score: riskScore,
                verification_status: status
            };

            await ClickHouseClaimStore.saveClaim(claim);
            results.push({ ...claim, similar_kb: similar[0] });
        }

        return NextResponse.json({ claims: results });

    } catch (error) {
        console.error("Verification failed:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
