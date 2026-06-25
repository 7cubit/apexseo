import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, UserRole } from '@apexseo/database';

export const requireRole = (allowedRoles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const auth = request.auth;

        if (!auth || !auth.userId) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        // Fetch user role from DB
        // Optimization: Store role in Clerk publicMetadata to avoid DB call
        // For now, prompt implies fetching from our Schema or robust check.
        // Let's assume we sync roles to Clerk or fetch from DB.
        // Fetching from DB is safer for now.

        const user = await prisma.user.findUnique({
            where: { id: auth.userId }
        });

        if (!user) {
            return reply.code(403).send({ error: 'User not found in database' });
        }

        if (!allowedRoles.includes(user.role as UserRole)) {
            return reply.code(403).send({ error: 'Insufficient permissions' });
        }
    };
};
