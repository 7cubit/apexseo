import { UserRepository } from '@apexseo/shared';
import { FastifyReply, FastifyRequest } from 'fastify';

const userRepo = new UserRepository();

export class UserService {
    async listUsers(page: number = 1, limit: number = 10, search?: string) {
        const offset = (page - 1) * limit;
        const users = await userRepo.list(limit, offset, search);
        const total = await userRepo.count(search);

        return {
            data: users.map(u => this.sanitize(u)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async listUsersEnhanced(page: number = 1, limit: number = 10, search?: string) {
        const offset = (page - 1) * limit;
        // status is optional in listWithDetails, passing undefined for now to get all
        const users = await userRepo.listWithDetails(limit, offset, search);
        const total = await userRepo.count(search);

        return {
            data: users.map(u => ({
                ...this.sanitize(u),
                accounts: u.accounts // accounts is already populated by listWithDetails
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUser(id: string) {
        const user = await userRepo.findById(id);
        if (!user) return null;
        return this.sanitize(user);
    }

    async suspendUser(id: string) {
        const user = await userRepo.update(id, { is_suspended: true });
        return user ? this.sanitize(user) : null;
    }

    async unsuspendUser(id: string) {
        const user = await userRepo.update(id, { is_suspended: false });
        return user ? this.sanitize(user) : null;
    }

    async impersonateUser(id: string, reply: FastifyReply) {
        const user = await userRepo.findById(id);
        if (!user) throw new Error('User not found');
        if (user.is_suspended) throw new Error('Cannot impersonate suspended user');

        // In a real app, we would generate a short-lived JWT for the user
        // For now, we'll return a mock token or handle it via session if we had a shared session store
        // Since admin and app are separate, we might need to redirect to the app with a signed token
        // that the app accepts.

        // Mock implementation: Return a token that the frontend can use to "login" to the main app
        // This requires the main app to have an endpoint to exchange this token for a session.

        return { token: `impersonate_${id}_${Date.now()}` };
    }

    private sanitize(user: any) {
        const { password_hash, ...rest } = user;
        return rest;
    }
}
