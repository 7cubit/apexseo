import { NextResponse } from 'next/server';
import { AuditLogRepository } from '@apexseo/shared';

const auditRepo = new AuditLogRepository();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const filters = {
            adminId: searchParams.get('adminId') || undefined,
            action: searchParams.get('action') || undefined,
            entityType: searchParams.get('entityType') || undefined
        };

        const logs = await auditRepo.list(limit, offset, filters);

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
