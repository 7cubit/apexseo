
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_URL = 'http://localhost:4000';
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';

async function smokeTest() {
    console.log('🔥 Starting Smoke Test: Release Candidate Verification...\n');

    // 1. Simulate Login (Generate Fresh JWT)
    console.log('👤 Step 1: Simulating User Login...');
    const token = jwt.sign(
        { id: 'smoke-tester', orgId: 'qa_team', email: 'qa@apexseo.com' },
        SECRET,
        { expiresIn: '1h' }
    );
    console.log('   ✅ Fresh JWT Generated');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Create Project 'Phoenix_V1'
    console.log('\n🏗️  Step 2: Creating Project "Phoenix_V1"...');
    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Phoenix_V1',
                domain: 'phoenix-v1.test',
                description: 'Smoke test project 1',
                types: ['audit']
            })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('   ✅ Project Created:', (data as any).project?.id);
        } else {
            console.error('   ❌ Failed to create project:', res.status, await res.text());
            return;
        }
    } catch (err) {
        console.error('   ❌ Request failed', err);
        return;
    }

    // 3. Verify Dashboard Load
    console.log('\n👀 Step 3: Verifying Dashboard Load...');
    try {
        const res = await fetch(`${API_URL}/projects`, { headers });
        if (res.ok) {
            const data = await res.json();
            const projects = (data as any).projects || [];
            const found = projects.find((p: any) => p.name === 'Phoenix_V1');

            if (found) {
                console.log('   ✅ Dashboard Loaded Successfully');
                console.log('   ✅ "Phoenix_V1" found in list');
            } else {
                console.error('   ❌ "Phoenix_V1" NOT found in dashboard list');
                console.log('   Current list:', projects.map((p: any) => p.name));
            }
        } else {
            console.error('   ❌ Failed to load dashboard:', res.status);
        }
    } catch (err) {
        console.error('   ❌ Request failed', err);
    }

    // 4. Edge Case: Rapid Second Creation
    console.log('\n⚡ Step 4: Edge Case - Rapid Second Creation ("Phoenix_V2")...');
    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Phoenix_V2',
                domain: 'phoenix-v2.test',
                description: 'Smoke test project 2',
                types: ['keyword']
            })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('   ✅ Project "Phoenix_V2" Created:', (data as any).project?.id);
        } else {
            console.error('   ❌ Failed to create second project:', res.status);
        }
    } catch (err) {
        console.error('   ❌ Request failed', err);
    }

    // 5. Final Verification
    console.log('\n🏁 Step 5: Final Dashboard Verification...');
    try {
        const res = await fetch(`${API_URL}/projects`, { headers });
        if (res.ok) {
            const data = await res.json();
            const projects = (data as any).projects || [];
            const names = projects.map((p: any) => p.name);

            const hasV1 = names.includes('Phoenix_V1');
            const hasV2 = names.includes('Phoenix_V2');

            if (hasV1 && hasV2) {
                console.log('   ✅ Both projects found in dashboard');
                console.log('   🎉 SMOKE TEST PASSED: Release Candidate Approved');
            } else {
                console.error('   ❌ Missing projects in final check');
                console.log('   Found:', names);
            }
        }
    } catch (err) {
        console.error('   ❌ Request failed', err);
    }
}

smokeTest();
