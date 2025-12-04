import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
    fastify.register(jwt, {
        secret: process.env.NEXTAUTH_SECRET || 'supersecret', // Should match NextAuth secret
        cookie: {
            cookieName: 'token',
            signed: false
        }
    });

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
            // RBAC Logic could go here if we passed roles to authenticate()
            // For now, we just verify the token.
            // Future: fastify.authenticate = (role) => ...
        } catch (err) {
            reply.send(err);
        }
    });

    // Add a specific RBAC decorator
    fastify.decorate("rbac", (requiredPermission: string) => {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
                const user = (request as any).user;
                // TODO: Import hasPermission from shared and check
                // const { hasPermission, UserRole } = require('@apexseo/shared');
                // if (!hasPermission(user.role, requiredPermission)) {
                //     throw new Error('Forbidden');
                // }
            } catch (err) {
                reply.send(err);
            }
        };
    });
    // Admin Authentication Decorator
    fastify.decorate("authenticateAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            console.log('authenticateAdmin: Headers:', request.headers);
            console.log('authenticateAdmin: Cookies:', request.cookies);
            await request.jwtVerify();
            const user = (request as any).user;
            console.log('authenticateAdmin: User:', user);
            if (!user.isAdmin) {
                throw new Error('Unauthorized: Admin access required');
            }
        } catch (err) {
            console.error('authenticateAdmin: Error:', err);
            reply.send(err);
        }
    });

    // Admin Role RBAC Decorator
    fastify.decorate("requireAdminRole", (allowedRoles: string[]) => {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
                const user = (request as any).user;
                if (!user.isAdmin || !allowedRoles.includes(user.role)) {
                    throw new Error('Forbidden: Insufficient admin privileges');
                }
            } catch (err) {
                reply.send(err);
            }
        };
    });
});

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
        authenticateAdmin: any;
        requireAdminRole: (roles: string[]) => any;
        rbac: (permission: string) => any;
    }
}
