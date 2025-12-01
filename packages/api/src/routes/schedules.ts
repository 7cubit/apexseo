import { FastifyPluginAsync } from 'fastify';
import { ClickHouseScheduleRepository, Schedule } from '@apexseo/shared';

const scheduleRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Get all schedules for a project
    fastify.get<{ Params: { id: string } }>('/projects/:id/schedules', async (request, reply) => {
        const { id } = request.params;
        try {
            const schedules = await ClickHouseScheduleRepository.getSchedules(id);
            return { schedules };
        } catch (error: any) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch schedules', details: error.message, stack: error.stack });
        }
    });

    // Toggle a schedule on/off
    fastify.post<{ Params: { id: string, agent: string }, Body: { enabled: boolean } }>(
        '/projects/:id/schedules/:agent/toggle',
        async (request, reply) => {
            const { id, agent } = request.params;
            const { enabled } = request.body;

            try {
                await ClickHouseScheduleRepository.toggleSchedule(id, agent, enabled);
                return { success: true, message: `${agent} ${enabled ? 'enabled' : 'disabled'}` };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to toggle schedule' });
            }
        }
    );

    // Update schedule cron expression
    fastify.put<{ Params: { id: string, agent: string }, Body: { cron_expression: string } }>(
        '/projects/:id/schedules/:agent',
        async (request, reply) => {
            const { id, agent } = request.params;
            const { cron_expression } = request.body;

            try {
                // Fetch existing schedule first
                const schedules = await ClickHouseScheduleRepository.getSchedules(id);
                const existing = schedules.find((s: any) => s.agent_name === agent) as Schedule | undefined;

                if (!existing) {
                    return reply.status(404).send({ error: 'Schedule not found' });
                }

                const updated: Schedule = {
                    project_id: id,
                    agent_name: agent,
                    enabled: existing.enabled,
                    cron_expression,
                    last_run: existing.last_run,
                    next_run: existing.next_run
                };

                await ClickHouseScheduleRepository.updateSchedule(updated);
                return { success: true, schedule: updated };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to update schedule' });
            }
        }
    );
};

export default scheduleRoutes;
