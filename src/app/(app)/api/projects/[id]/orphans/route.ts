import { NextRequest, NextResponse } from 'next/server';
import { ClickHousePageRepository } from '@/lib/clickhouse/repositories/ClickHousePageRepository';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const projectId = params.id;

    try {
        const orphans = await ClickHousePageRepository.getSemanticOrphans(projectId);
        return NextResponse.json({ orphans });
    } catch (error) {
        console.error("Failed to fetch orphans:", error);
        return NextResponse.json({ error: "Failed to fetch orphans" }, { status: 500 });
    }
}
