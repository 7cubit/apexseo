import { NextResponse } from 'next/server';
import { AdminTemporalService, ProjectRepository, AuditLogRepository } from '@apexseo/shared';

const auditRepo = new AuditLogRepository();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { action, admin_id, url } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'FORCE_CRAWL':
                if (!url) return NextResponse.json({ error: 'URL is required for crawl' }, { status: 400 });
                result = await AdminTemporalService.triggerCrawl(params.id, url);
                await ProjectRepository.updateStatus(params.id, 'CRAWLING');
                break;
            case 'PAUSE':
                // In a real app, we'd need the running workflow ID. For now, let's assume it's passed or we find it.
                // Simplified: Just update status in DB for this demo if no workflow ID.
                await ProjectRepository.updateStatus(params.id, 'PAUSED');
                break;
            case 'RESUME':
                await ProjectRepository.updateStatus(params.id, 'ACTIVE');
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: `PROJECT_${action}`,
                entity_type: 'PROJECT',
                entity_id: params.id,
                details: JSON.stringify({ action, url }),
            });
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error performing crawl action:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
