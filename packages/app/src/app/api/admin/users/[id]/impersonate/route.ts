import { NextResponse } from 'next/server';
import { UserRepository, AuditLogRepository } from '@apexseo/shared';
import jwt from 'jsonwebtoken';

const userRepo = new UserRepository();
const auditRepo = new AuditLogRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { admin_id, reason } = body;

        if (!reason) {
            return NextResponse.json({ error: 'Reason is required for impersonation' }, { status: 400 });
        }

        const user = await userRepo.findById(params.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate a special impersonation token
        // In a real app, this might be a short-lived session token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: 'user', // Impersonating as regular user
                is_impersonated: true,
                impersonator_id: admin_id
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'IMPERSONATE_USER',
                entity_type: 'USER',
                entity_id: params.id,
                details: JSON.stringify({ reason }),
            });
        }

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error generating impersonation token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
