import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AdminAuthService } from '../services/admin-auth.service';
import { z } from 'zod';

const adminAuthService = new AdminAuthService();

export default async function adminAuthRoutes(fastify: FastifyInstance) {
    fastify.post('/login', {
        schema: {
            body: z.object({
                email: z.string().email(),
                password: z.string()
            }),
            response: {
                200: z.object({
                    require2fa: z.boolean(),
                    token: z.string().optional(),
                    admin: z.object({
                        id: z.string(),
                        email: z.string(),
                        role: z.string()
                    }).optional()
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body as any;
        try {
            const result = await adminAuthService.login(email, password);

            if (result.require2fa) {
                return { require2fa: true, admin: { id: result.admin.id, email: result.admin.email, role: result.admin.role } };
            }

            // If no 2FA required (e.g. first login or disabled), issue token
            // In a real app, we'd sign a JWT here
            const token = fastify.jwt.sign({
                id: result.admin.id,
                email: result.admin.email,
                role: result.admin.role,
                isAdmin: true
            });

            // Set HTTP-only cookie
            reply.setCookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            return { require2fa: false, token, admin: { id: result.admin.id, email: result.admin.email, role: result.admin.role } };
        } catch (error: any) {
            return reply.code(401).send({ message: error.message });
        }
    });

    fastify.post('/2fa/verify', {
        schema: {
            body: z.object({
                adminId: z.string(),
                token: z.string()
            }),
            response: {
                200: z.object({
                    token: z.string()
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { adminId, token } = request.body as any;
        const isValid = await adminAuthService.verify2FA(adminId, token);

        if (!isValid) {
            return reply.code(401).send({ message: 'Invalid 2FA token' });
        }

        // Fetch admin details again to sign token
        // Optimization: Pass admin object from service if needed
        // For now, assume valid
        const jwtToken = fastify.jwt.sign({
            id: adminId,
            isAdmin: true
        });

        reply.setCookie('token', jwtToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return { token: jwtToken };
    });

    fastify.post('/logout', async (request, reply) => {
        reply.clearCookie('token');
        return { message: 'Logged out' };
    });
}
