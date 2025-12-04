import { AdminRepository, Admin, AdminRole } from '@apexseo/shared';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { FastifyRequest, FastifyReply } from 'fastify';

const adminRepo = new AdminRepository();

export class AdminAuthService {
    async login(email: string, password: string): Promise<{ admin: Admin; require2fa: boolean; token?: string }> {
        const admin = await adminRepo.findByEmail(email);
        if (!admin) {
            throw new Error('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        if (!admin.is_active) {
            throw new Error('Account disabled');
        }

        // Check if 2FA is enabled (it should be mandatory)
        if (admin.two_factor_secret) {
            return { admin, require2fa: true };
        }

        // If no 2FA (should not happen in prod if enforced), return token
        // In reality, we force 2FA setup on first login if missing
        return { admin, require2fa: false }; // TODO: Handle first login setup
    }

    async verify2FA(adminId: string, token: string): Promise<boolean> {
        const admin = await adminRepo.findById(adminId);
        if (!admin || !admin.two_factor_secret) {
            return false;
        }

        return authenticator.check(token, admin.two_factor_secret);
    }

    async createInvite(email: string, role: AdminRole): Promise<string> {
        // Generate invite token (store in DB or Redis)
        // For MVP, we might just create the admin with a temp password or flag
        // But the plan says /invite/:token
        // We need an `admin_invites` table or node
        return 'mock-invite-token';
    }

    async setupAdmin(inviteToken: string, password: string): Promise<Admin> {
        // Validate token, create admin
        return {} as Admin;
    }
}
