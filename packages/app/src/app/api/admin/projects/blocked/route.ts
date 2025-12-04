import { NextResponse } from 'next/server';
import { BlockedDomainRepository, AuditLogRepository } from '@apexseo/shared';

const blockedRepo = new BlockedDomainRepository();
const auditRepo = new AuditLogRepository();

export async function GET() {
    try {
        const domains = await blockedRepo.list();
        return NextResponse.json({ domains });
    } catch (error) {
        console.error('Error fetching blocked domains:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { domain, reason, admin_id } = body;

        if (!domain || !reason) {
            return NextResponse.json({ error: 'Domain and reason are required' }, { status: 400 });
        }

        const blocked = await blockedRepo.create(domain, reason, admin_id);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'BLOCK_DOMAIN',
                entity_type: 'BLOCKED_DOMAIN',
                entity_id: blocked.id,
                details: JSON.stringify({ domain, reason }),
            });
        }

        return NextResponse.json({ blocked });
    } catch (error) {
        console.error('Error blocking domain:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const admin_id = searchParams.get('admin_id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await blockedRepo.delete(id);

        if (admin_id) {
            await auditRepo.create({
                admin_id: admin_id,
                action: 'UNBLOCK_DOMAIN',
                entity_type: 'BLOCKED_DOMAIN',
                entity_id: id,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unblocking domain:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
