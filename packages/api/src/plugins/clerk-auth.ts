import fp from 'fastify-plugin';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { FastifyPluginAsync } from 'fastify';

// Types for request decoration
declare module 'fastify' {
    interface FastifyRequest {
        auth: {
            userId: string | null;
            sessionId: string | null;
            claims: any;
        };
    }
}

const clerkAuthPlugin: FastifyPluginAsync = async (fastify) => {
    // Clerk's Express middleware adapted for Fastify
    // We use the 'preHandler' hook.
    // Note: ClerkExpressWithAuth returns an express middleware (req, res, next)
    // Fastify can use 'fastify-express' or manual adaptation.
    // Manual adaptation for simplicity and avoiding extra deps if possible.

    const clerkMiddleware = ClerkExpressWithAuth();

    fastify.decorateRequest('auth', null as any);

    fastify.addHook('preHandler', (req, reply, done) => {
        // @ts-ignore - Clerk expects Express req/res
        clerkMiddleware(req.raw, reply.raw, (err) => {
            if (err) {
                done(err);
            } else {
                // Clerk attaches auth to req.auth (in strict mode) or req (loose)
                // @ts-ignore
                const nodeReq = req.raw as any;
                if (nodeReq.auth) {
                    req.auth = nodeReq.auth;
                }
                done();
            }
        });
    });
};

export default fp(clerkAuthPlugin);
