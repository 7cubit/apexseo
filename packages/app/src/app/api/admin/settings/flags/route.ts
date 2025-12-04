import { NextResponse } from 'next/server';
import { SettingsRepository, AuditLogRepository } from '@apexseo/shared';

const settingsRepo = new SettingsRepository();
const auditRepo = new AuditLogRepository();

export async function GET() {
    try {
        const flags = await settingsRepo.listFlags();
        const overrides = await settingsRepo.getOverrides();
        return NextResponse.json({ flags, overrides });
    } catch (error) {
        console.error('Error fetching flags:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, description, defaultValue, admin_id } = body;

        if (!key || defaultValue === undefined) {
            return NextResponse.json({ error: 'Key and defaultValue are required' }, { status: 400 });
        }

        const flag = await settingsRepo.createFlag(key, description || '', defaultValue);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'CREATE_FLAG',
                entity_type: 'FEATURE_FLAG',
                entity_id: key,
                details: JSON.stringify({ description, defaultValue }),
            });
        }

        return NextResponse.json({ flag });
    } catch (error) {
        console.error('Error creating flag:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
