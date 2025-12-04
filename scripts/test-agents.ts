import { AlertService } from '@apexseo/shared';

async function testAgents() {
    const siteId = 'example.com';
    console.log(`Testing Agents & Alerts for ${siteId}...`);

    // 1. Create Alerts Table
    console.log('Creating alerts table...');
    await AlertService.createTable();

    // 2. Create mock alerts
    console.log('Creating mock alerts...');
    await AlertService.createAlert(siteId, 'info', 'Site Doctor started', 'Routine check');
    await AlertService.createAlert(siteId, 'warning', 'High latency detected', 'Response time > 2s');
    await AlertService.createAlert(siteId, 'error', 'Crawl failed', 'Timeout connecting to server');
    console.log('Alerts created.');

    // 3. Fetch alerts
    console.log('Fetching alerts...');
    const alerts = await AlertService.getAlerts(siteId);
    console.log(`Found ${alerts.length} alerts.`);

    if (alerts.length > 0) {
        console.log('First alert:', alerts[0]);

        // 4. Mark as read
        console.log('Marking first alert as read...');
        await AlertService.markAsReadWithSiteId(siteId, alerts[0].id);
        console.log('Marked as read.');
    }

    // 5. Verify read status (optional, fetch again)
    // const updatedAlerts = await AlertService.getAlerts(siteId);
    // console.log('Updated first alert read status:', updatedAlerts[0].is_read);

    console.log('Test completed successfully.');
}

testAgents().catch(console.error);
