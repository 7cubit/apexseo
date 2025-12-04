import { NextResponse } from 'next/server';
import { AuditLogRepository } from '@apexseo/shared';

const auditRepo = new AuditLogRepository();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const log = await auditRepo.getById(params.id);
        if (!log) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }
        return NextResponse.json({ log });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
