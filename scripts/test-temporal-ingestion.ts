import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { Connection, Client } from '@temporalio/client';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_URL = 'http://localhost:4000';
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';

async function testIngestion() {
    console.log('🧪 Starting End-to-End Temporal Ingestion Test...\n');

    // 1. Generate JWT
    const token = jwt.sign(
        { id: 'temporal-tester', orgId: 'qa_team', email: 'qa@apexseo.com' },
        SECRET,
        { expiresIn: '1h' }
    );

    // 2. Create Project
    const projectName = `SurferSEO Test ${Date.now()}`;
    console.log(`🏗️  Creating Project: "${projectName}"...`);

    let projectId: string;

    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: projectName,
                domain: 'surferseo.com', // Use a real domain to test crawling
                description: 'Temporal E2E Test'
            })
        });

        if (res.ok) {
            const data = await res.json();
            projectId = (data as any).project.id;
            console.log('   ✅ Project Created:', projectId);
        } else {
            console.error('   ❌ Failed to create project:', res.status, await res.text());
            return;
        }
    } catch (err) {
        console.error('   ❌ Request failed', err);
        return;
    }

    // 3. Verify Temporal Workflow
    console.log('\n⏳ Verifying Temporal Workflow Execution...');
    try {
        const client = new Client();
        const workflowId = `ingest-${projectId}`;
        const handle = client.workflow.getHandle(workflowId);

        console.log(`   Checking workflow: ${workflowId}`);
        const description = await handle.describe();
        console.log('   ✅ Workflow Status:', description.status.name);

        // Wait for a few seconds to let it run
        console.log('   Waiting for 10 seconds to allow crawl to start...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Query progress
        try {
            const progress = await handle.query('ingestionProgress');
            console.log('   ✅ Workflow Progress:', progress);
        } catch (e) {
            console.log('   ⚠️  Could not query progress (maybe workflow finished or query not registered yet)');
        }

    } catch (err) {
        console.error('   ❌ Temporal verification failed:', err);
    }

    console.log('\n🏁 Test Complete. Check Temporal UI and ClickHouse for data.');
}

testIngestion();
