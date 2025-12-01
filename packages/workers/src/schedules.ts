// Temporal Schedule Configurations
// These define the recurring execution patterns for autonomous agents

export const AGENT_SCHEDULES = {
    SiteDoctor: {
        scheduleId: 'site-doctor-schedule',
        spec: {
            cronExpressions: ['0 2 * * *'], // 2 AM daily
        },
        policies: {
            overlap: 'SKIP' as const, // Don't run if previous execution is still running
            catchupWindow: '1 day',
        },
    },
    RankTracker: {
        scheduleId: 'rank-tracker-schedule',
        spec: {
            cronExpressions: ['0 */6 * * *'], // Every 6 hours
        },
        policies: {
            overlap: 'BUFFER_ONE' as const,
            catchupWindow: '12 hours',
        },
    },
    ScoreRefresh: {
        scheduleId: 'score-refresh-schedule',
        spec: {
            cronExpressions: ['0 0 * * *'], // Midnight daily
        },
        policies: {
            overlap: 'SKIP' as const,
            catchupWindow: '1 day',
        },
    },
};

// Helper to get schedule config by agent name
export function getScheduleConfig(agentName: string) {
    return AGENT_SCHEDULES[agentName as keyof typeof AGENT_SCHEDULES];
}
