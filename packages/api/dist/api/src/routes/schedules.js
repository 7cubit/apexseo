"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const scheduleRoutes = async (fastify, opts) => {
    // Get all schedules for a project
    fastify.get('/projects/:id/schedules', async (request, reply) => {
        const { id } = request.params;
        try {
            console.log(`API: Querying for ${id}`);
            const result = await shared_1.client.query({
                query: `SELECT * FROM schedules WHERE project_id = {projectId:String}`,
                query_params: { projectId: id },
            });
            const data = await result.json();
            console.log('API: Data:', JSON.stringify(data));
            return { schedules: data.data, raw: data };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch schedules', details: error.message, stack: error.stack });
        }
    });
    // Toggle a schedule on/off
    fastify.post('/projects/:id/schedules/:agent/toggle', async (request, reply) => {
        const { id, agent } = request.params;
        const { enabled } = request.body;
        try {
            await shared_1.ClickHouseScheduleRepository.toggleSchedule(id, agent, enabled);
            return { success: true, message: `${agent} ${enabled ? 'enabled' : 'disabled'}` };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to toggle schedule' });
        }
    });
    // Update schedule cron expression
    fastify.put('/projects/:id/schedules/:agent', async (request, reply) => {
        const { id, agent } = request.params;
        const { cron_expression } = request.body;
        try {
            // Fetch existing schedule first
            const schedules = await shared_1.ClickHouseScheduleRepository.getSchedules(id);
            const existing = schedules.find((s) => s.agent_name === agent);
            if (!existing) {
                return reply.status(404).send({ error: 'Schedule not found' });
            }
            const updated = {
                project_id: id,
                agent_name: agent,
                enabled: existing.enabled,
                cron_expression,
                last_run: existing.last_run,
                next_run: existing.next_run
            };
            await shared_1.ClickHouseScheduleRepository.updateSchedule(updated);
            return { success: true, schedule: updated };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to update schedule' });
        }
    });
};
exports.default = scheduleRoutes;
