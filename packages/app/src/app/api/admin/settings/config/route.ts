import { NextResponse } from 'next/server';
import { SettingsRepository, AuditLogRepository } from '@apexseo/shared';

const settingsRepo = new SettingsRepository();
const auditRepo = new AuditLogRepository();

export async function GET() {
    try {
        const config = await settingsRepo.getSystemConfig();
        return NextResponse.json({ config });
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { config, admin_id } = body;

        if (!config) {
            return NextResponse.json({ error: 'Config is required' }, { status: 400 });
        }

        const updated = await settingsRepo.updateSystemConfig(config);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'UPDATE_SYSTEM_CONFIG',
                entity_type: 'SYSTEM',
                entity_id: 'global',
                details: JSON.stringify(config),
            });
        }

        return NextResponse.json({ config: updated });
    } catch (error) {
        console.error('Error updating config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
