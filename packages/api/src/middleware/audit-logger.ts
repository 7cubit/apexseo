import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@apexseo/database';

export async function auditLogger(request: FastifyRequest, reply: FastifyReply) {
    // Only log state-changing methods
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)) {
        const userId = request.auth?.userId;
        if (!userId) return; // Don't log anonymous? Or log as anonymous.

        // Use 'onResponse' hook logic or just fire and forget here
        // We'll fire async to not block
        const action = request.method;
        const resource = request.routeOptions.url || request.url;
        const metadata = {
            body: request.body,
            query: request.query,
            params: request.params,
            ip: request.ip,
            userAgent: request.headers['user-agent']
        };

        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    resource,
                    metadata: metadata as any,
                    ipAddress: request.ip,
                    userAgent: request.headers['user-agent']
                }
            });
        } catch (error) {
            request.log.error({ err: error }, 'Failed to write audit log');
        }
    }
}
