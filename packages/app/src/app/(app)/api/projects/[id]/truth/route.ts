import { NextRequest, NextResponse } from 'next/server';
import { ClickHouseClaimStore } from '@/lib/clickhouse/repositories/ClickHouseClaimStore';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const projectId = params.id;

    try {
        const claims = await ClickHouseClaimStore.getClaimsBySite(projectId, 50);
        const highRiskPages = await ClickHouseClaimStore.getHighRiskPages(projectId, 10);

        return NextResponse.json({ claims, highRiskPages });
    } catch (error) {
        console.error("Failed to fetch truth data:", error);
        return NextResponse.json({ error: "Failed to fetch truth data" }, { status: 500 });
    }
}
