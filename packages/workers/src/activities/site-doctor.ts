import { ClickHouseAlertRepository, ClickHousePageRepository, Alert } from '@apexseo/shared';

export async function checkHealthRegressionActivity(siteId: string): Promise<void> {
    console.log(`Checking health regression for ${siteId}`);

    // Get latest health score
    // This assumes we have a way to get the latest score. 
    // ClickHousePageRepository has page scores, but we might want an aggregate site score.
    // For now, let's check for pages with significant score drops if we had history, 
    // or just check for critical health issues (score < 50).

    try {
        const pages = await ClickHousePageRepository.getPagesBySite(siteId);
        const criticalPages = pages.filter((p: any) => p.content_score < 40); // Threshold

        if (criticalPages.length > 5) { // Threshold
            const alert: Alert = {
                site_id: siteId,
                type: 'health_regression',
                severity: 'high',
                message: `Found ${criticalPages.length} pages with critical health scores (< 40).`,
                details: `Pages: ${criticalPages.slice(0, 5).map((p: any) => p.url).join(', ')}...`,
                status: 'new'
            };

            await ClickHouseAlertRepository.createTable();
            await ClickHouseAlertRepository.createAlert(alert);
        }
    } catch (error) {
        console.error(`Failed to check health regression for ${siteId}`, error);
    }
}
