import { NextResponse } from 'next/server';
import { SettingsRepository, AuditLogRepository } from '@apexseo/shared';

const settingsRepo = new SettingsRepository();
const auditRepo = new AuditLogRepository();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { entityId, entityType, flagKey, enabled, admin_id } = body;

        if (!entityId || !flagKey || enabled === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (entityType === 'Plan') {
            await settingsRepo.setPlanOverride(entityId, flagKey, enabled);
        } else if (entityType === 'Account') {
            await settingsRepo.setAccountOverride(entityId, flagKey, enabled);
        } else {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
        }

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'OVERRIDE_FLAG',
                entity_type: entityType.toUpperCase(),
                entity_id: entityId,
                details: JSON.stringify({ flagKey, enabled }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error setting override:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
