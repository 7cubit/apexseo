import { Client, Connection } from '@temporalio/client';
import { AGENT_SCHEDULES } from '../schedules';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local manually to ensure Cloud credentials are used
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
} else {
    dotenv.config();
}

async function main() {
    // Dynamically import shared modules after env vars are loaded
    const { ClickHouseProjectRepository, ClickHouseScheduleRepository, createTemporalClient } = await import('@apexseo/shared');

    console.log('Starting schedule sync...');

    // Connect to Temporal
    const client = await createTemporalClient();
    if (!client) {
        throw new Error("Failed to create Temporal client");
    }

    // Ensure schedules table exists
    await ClickHouseScheduleRepository.createTable();

    // Fetch all projects
    const projects = await ClickHouseProjectRepository.getAll();
    console.log(`Found ${projects.length} projects.`);

    for (const project of projects) {
        const projectId = project.id;
        console.log(`Syncing schedules for project ${projectId}...`);

        for (const [agentName, config] of Object.entries(AGENT_SCHEDULES) as [string, any][]) {
            const scheduleId = `${config.scheduleId}-${projectId}`;

            // 1. Ensure in ClickHouse
            const existingSchedules = await ClickHouseScheduleRepository.getSchedules(projectId);
            const existing = existingSchedules.find((s: any) => s.agent_name === agentName);

            if (!existing) {
                console.log(`Creating default schedule for ${agentName} in ClickHouse`);
                await ClickHouseScheduleRepository.updateSchedule({
                    project_id: projectId,
                    agent_name: agentName,
                    cron_expression: config.spec.cronExpressions[0],
                    enabled: true
                });
            }

            // 2. Sync to Temporal
            try {
                const handle = client.schedule.getHandle(scheduleId);
                try {
                    await handle.describe();
                    console.log(`Schedule ${scheduleId} exists in Temporal.`);
                    // Optionally update if needed
                } catch (e) {
                    // Schedule doesn't exist, create it
                    console.log(`Creating schedule ${scheduleId} in Temporal`);

                    // Convert policies to correct types
                    const policies: any = { ...config.policies };
                    if (policies.catchupWindow === '1 day') policies.catchupWindow = 86400000;
                    if (policies.catchupWindow === '12 hours') policies.catchupWindow = 43200000;

                    await client.schedule.create({
                        scheduleId,
                        spec: {
                            cronExpressions: config.spec.cronExpressions,
                        },
                        action: {
                            type: 'startWorkflow',
                            workflowType: `${agentName}Workflow`,
                            args: [projectId],
                            taskQueue: 'seo-tasks-queue',
                        },
                        policies: policies,
                    });
                }
            } catch (error) {
                console.error(`Failed to sync schedule ${scheduleId}`, error);
            }
        }
    }

    console.log('Schedule sync completed.');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
