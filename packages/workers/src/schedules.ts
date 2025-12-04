import { Client, ScheduleOverlapPolicy } from '@temporalio/client';

export async function createSchedules(client: Client) {
    // 1. SiteDoctor Schedule (Nightly at 2 AM)
    try {
        await client.schedule.create({
            scheduleId: 'site-doctor-schedule',
            spec: {
                cronExpressions: ['0 2 * * *'], // 2:00 AM daily
            },
            action: {
                type: 'startWorkflow',
                workflowType: 'SiteDoctorWorkflow',
                args: [], // Pass args if needed, e.g., list of projects? Or workflow fetches them.
                taskQueue: 'seo-tasks-queue',
            },
            policies: {
                overlap: ScheduleOverlapPolicy.SKIP, // Don't run if previous run is still going
            },
        });
        console.log('Created SiteDoctor schedule');
    } catch (e: any) {
        if (e.code === 'ALREADY_EXISTS') {
            console.log('SiteDoctor schedule already exists');
        } else {
            console.error('Failed to create SiteDoctor schedule:', e);
        }
    }

    // 2. RankTracker Schedule (Daily at 6 AM)
    try {
        await client.schedule.create({
            scheduleId: 'rank-tracker-schedule',
            spec: {
                cronExpressions: ['0 6 * * *'], // 6:00 AM daily
            },
            action: {
                type: 'startWorkflow',
                workflowType: 'RankTrackerWorkflow',
                args: [],
                taskQueue: 'seo-tasks-queue',
            },
            policies: {
                overlap: ScheduleOverlapPolicy.SKIP,
            },
        });
        console.log('Created RankTracker schedule');
    } catch (e: any) {
        if (e.code === 'ALREADY_EXISTS') {
            console.log('RankTracker schedule already exists');
        } else {
            console.error('Failed to create RankTracker schedule:', e);
        }
    }
}
