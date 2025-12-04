
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ClickHouseProjectUserRepository, ClickHouseProjectRepository } from '@apexseo/shared';

const projectUsersRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // List members
    fastify.get('/:id/members', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
        const { id } = request.params;
        // TODO: Check if current user has access to project
        try {
            const members = await ClickHouseProjectUserRepository.getMembers(id);
            return { members };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch members' });
        }
    });

    // Invite member
    fastify.post('/:id/members', async (request: FastifyRequest<{ Params: { id: string }; Body: { email: string; role: string } }>, reply) => {
        const { id } = request.params;
        const { email, role } = request.body;
        // TODO: Check permissions (only owner/admin can invite)

        try {
            // Mock user lookup by email - in real app, find user ID by email
            // For now, we'll generate a mock ID or assume user exists
            const mockUserId = `user-${email.split('@')[0]}`;

            await ClickHouseProjectUserRepository.addMember({
                project_id: id,
                user_id: mockUserId,
                role: role as any,
                created_at: new Date().toISOString()
            });

            return { success: true, message: 'Member invited' };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to invite member' });
        }
    });

    // Remove member
    fastify.delete('/:id/members/:userId', async (request: FastifyRequest<{ Params: { id: string; userId: string } }>, reply) => {
        const { id, userId } = request.params;
        // TODO: Check permissions
        try {
            await ClickHouseProjectUserRepository.removeMember(id, userId);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to remove member' });
        }
    });

    // Update role
    fastify.put('/:id/members/:userId', async (request: FastifyRequest<{ Params: { id: string; userId: string }; Body: { role: string } }>, reply) => {
        const { id, userId } = request.params;
        const { role } = request.body;
        // TODO: Check permissions
        try {
            await ClickHouseProjectUserRepository.updateRole(id, userId, role);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to update role' });
        }
    });
};

export default projectUsersRoutes;
