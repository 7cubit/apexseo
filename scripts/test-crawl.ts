import http from 'http';
import { Client, Connection } from '@temporalio/client';

// Simple fixture server
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><head><title>Home</title></head><body><a href="/page1">Page 1</a></body></html>');
    } else if (req.url === '/page1') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><head><title>Page 1</title></head><body><a href="/">Home</a></body></html>');
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

async function runTest() {
    // Start server
    await new Promise<void>((resolve) => server.listen(8081, resolve));
    console.log('Fixture server running on port 8081');

    try {
        // Trigger crawl
        const connection = await Connection.connect({
            address: 'localhost:7233',
        });
        const client = new Client({
            connection,
        });

        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `test-crawl-${Date.now()}`,
            args: [{ siteId: 'test-site', startUrl: 'http://localhost:8081', maxDepth: 1, limit: 10 }],
        });

        console.log(`Started workflow ${handle.workflowId}`);
        await handle.result(); // Wait for completion
        console.log('Workflow completed');

        // Verify data (mock verification for now, or query DBs if possible)
        // In a real test, we would query ClickHouse/Neo4j here.
        console.log('Verification: Check ClickHouse and Neo4j for "test-site" data.');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        server.close();
    }
}

runTest();
