import { NextResponse } from 'next/server';
import { UserRepository, AuditLogRepository } from '@apexseo/shared';

const userRepo = new UserRepository();
const auditRepo = new AuditLogRepository();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await userRepo.getDetails(params.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { is_suspended, reason, admin_id } = body;

        if (typeof is_suspended !== 'boolean') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedUser = await userRepo.setSuspended(params.id, is_suspended);

        if (updatedUser && admin_id) {
            await auditRepo.create({
                admin_id,
                action: is_suspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
                entity_type: 'USER',
                entity_id: params.id,
                details: JSON.stringify({ reason }),
            });
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
