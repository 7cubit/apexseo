import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/reporting';

const { generateReport, saveReport, emailReport } = proxyActivities<typeof activities>({
    startToCloseTimeout: '10 minutes',
    retry: {
        initialInterval: '10 seconds',
        maximumAttempts: 3,
    }
});

export interface ReportGenerationInput {
    projectId: string;
    reportType: 'seo_audit' | 'performance' | 'competitor';
    email?: string;
}

export async function ReportGenerationWorkflow(input: ReportGenerationInput): Promise<string> {
    const { projectId, reportType, email } = input;

    // 1. Generate Report Data
    const reportData = await generateReport({ projectId, reportType });

    // 2. Save Report to Storage (e.g., S3/GCS)
    const reportUrl = await saveReport({ projectId, reportData, format: 'pdf' });

    // 3. Email Report (Optional)
    if (email) {
        await emailReport({ email, reportUrl, subject: `Your ${reportType} Report` });
    }

    return reportUrl;
}
