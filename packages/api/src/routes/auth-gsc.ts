import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// TODO: Install googleapis package
// npm install googleapis @google-cloud/local-auth

/**
 * GSC OAuth Routes
 * 
 * Handles Google Search Console authentication flow:
 * 1. POST /authorize - Generate OAuth URL
 * 2. GET /callback - Handle OAuth callback
 * 3. POST /refresh - Refresh access token
 * 4. DELETE /disconnect - Remove GSC connection
 * 
 * SETUP REQUIRED:
 * - Set GOOGLE_CLIENT_ID in .env
 * - Set GOOGLE_CLIENT_SECRET in .env
 * - Set GOOGLE_REDIRECT_URI in .env
 */

const authorizeSchema = z.object({
    projectId: z.string().uuid().optional(),
});

const callbackSchema = z.object({
    code: z.string(),
    state: z.string(), // userId
    error: z.string().optional(),
});

export const authGscRoutes: FastifyPluginAsync = async (fastify) => {
    /**
     * POST /api/auth/gsc/authorize
     * Generate OAuth authorization URL
     */
    fastify.post('/authorize', {
        schema: {
            body: authorizeSchema,
        },
    }, async (request, reply) => {
        // TODO: Implement after OAuth credentials are set up
        // const { google } = await import('googleapis');
        // const oauth2Client = new google.auth.OAuth2(
        //   process.env.GOOGLE_CLIENT_ID,
        //   process.env.GOOGLE_CLIENT_SECRET,
        //   process.env.GOOGLE_REDIRECT_URI
        // );

        // const authUrl = oauth2Client.generateAuthUrl({
        //   access_type: 'offline',
        //   scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
        //   state: request.user.id,
        //   prompt: 'consent', // Force consent to get refresh token
        // });

        // return { authUrl };

        // Placeholder response
        return reply.code(501).send({
            error: 'Not Implemented',
            message: 'GSC OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in .env',
        });
    });

    /**
     * GET /api/auth/gsc/callback
     * Handle OAuth callback from Google
     */
    fastify.get('/callback', {
        schema: {
            querystring: callbackSchema,
        },
    }, async (request, reply) => {
        const { code, state: userId, error } = request.query as z.infer<typeof callbackSchema>;

        if (error) {
            return reply.redirect(`/onboarding?error=${encodeURIComponent(error)}`);
        }

        // TODO: Implement after OAuth credentials and database schema are set up
        // const { google } = await import('googleapis');
        // const oauth2Client = new google.auth.OAuth2(
        //   process.env.GOOGLE_CLIENT_ID,
        //   process.env.GOOGLE_CLIENT_SECRET,
        //   process.env.GOOGLE_REDIRECT_URI
        // );

        // const { tokens } = await oauth2Client.getToken(code);

        // // Store tokens in PostgreSQL
        // await fastify.pg.query(`
        //   INSERT INTO gsc_connections (
        //     user_id, access_token, refresh_token, expires_at
        //   ) VALUES ($1, $2, $3, $4)
        //   ON CONFLICT (user_id) DO UPDATE SET
        //     access_token = EXCLUDED.access_token,
        //     refresh_token = EXCLUDED.refresh_token,
        //     expires_at = EXCLUDED.expires_at,
        //     updated_at = NOW()
        // `, [
        //   userId,
        //   tokens.access_token,
        //   tokens.refresh_token,
        //   new Date(tokens.expiry_date!)
        // ]);

        // // Fetch available sites
        // oauth2Client.setCredentials(tokens);
        // const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
        // const { data } = await webmasters.sites.list();

        return reply.redirect('/onboarding?step=2&gsc=connected');
    });

    /**
     * POST /api/auth/gsc/refresh
     * Refresh expired access token
     */
    fastify.post('/refresh', async (request, reply) => {
        // TODO: Implement token refresh logic
        return reply.code(501).send({
            error: 'Not Implemented',
            message: 'Token refresh not yet implemented',
        });
    });

    /**
     * DELETE /api/auth/gsc/disconnect
     * Remove GSC connection for user
     */
    fastify.delete('/disconnect', async (request, reply) => {
        // TODO: Implement disconnect logic
        // await fastify.pg.query('DELETE FROM gsc_connections WHERE user_id = $1', [request.user.id]);
        return reply.code(501).send({
            error: 'Not Implemented',
            message: 'Disconnect not yet implemented',
        });
    });

    /**
     * GET /api/auth/gsc/sites
     * List available GSC properties for authenticated user
     */
    fastify.get('/sites', async (request, reply) => {
        // TODO: Implement after OAuth is set up
        // const { rows } = await fastify.pg.query(
        //   'SELECT access_token, refresh_token FROM gsc_connections WHERE user_id = $1',
        //   [request.user.id]
        // );

        // if (!rows[0]) {
        //   return reply.code(404).send({ error: 'No GSC connection found' });
        // }

        // const { google } = await import('googleapis');
        // const oauth2Client = new google.auth.OAuth2();
        // oauth2Client.setCredentials({
        //   access_token: rows[0].access_token,
        //   refresh_token: rows[0].refresh_token,
        // });

        // const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
        // const { data } = await webmasters.sites.list();

        // return { sites: data.siteEntry || [] };

        return reply.code(501).send({
            error: 'Not Implemented',
            message: 'GSC sites listing not yet implemented',
        });
    });
};
