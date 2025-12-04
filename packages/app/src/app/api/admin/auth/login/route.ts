import { NextResponse } from 'next/server';
import { AdminRepository } from '@apexseo/shared';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const adminRepo = new AdminRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const admin = await adminRepo.findByEmail(email);

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!admin.is_active) {
            return NextResponse.json(
                { error: 'Account is inactive' },
                { status: 403 }
            );
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                type: 'admin',
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        // Note: In a real app we might want to await this or fire-and-forget
        // await adminRepo.update(admin.id, { last_login_at: new Date().toISOString() });

        return NextResponse.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
