import { NextResponse } from 'next/server';
import { ApiKeyRepository, AuditLogRepository } from '@apexseo/shared';

const apiKeyRepo = new ApiKeyRepository();
const auditRepo = new AuditLogRepository();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const keys = await apiKeyRepo.listByAccount(params.id);
        return NextResponse.json({ keys });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, admin_id } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { apiKey, secretKey } = await apiKeyRepo.create(params.id, name);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'CREATE_API_KEY',
                entity_type: 'API_KEY',
                entity_id: apiKey.id,
                details: JSON.stringify({ accountId: params.id, name }),
            });
        }

        return NextResponse.json({ apiKey, secretKey });
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('keyId');
        const admin_id = searchParams.get('admin_id');

        if (!keyId) {
            return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }

        await apiKeyRepo.revoke(keyId);

        if (admin_id) {
            await auditRepo.create({
                admin_id: admin_id,
                action: 'REVOKE_API_KEY',
                entity_type: 'API_KEY',
                entity_id: keyId,
                details: JSON.stringify({ accountId: params.id }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error revoking API key:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
