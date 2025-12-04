console.log('🚀 Insights API Test Started');

const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'http://localhost:4000';
const jwt = require('jsonwebtoken');
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';

async function runTest() {
    // 1. Generate JWT
    const token = jwt.sign({
        id: 'user-unity-test',
        email: 'unity@test.com',
        name: 'Unity Tester'
    }, SECRET);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Use the project ID from the previous test if possible, or a placeholder.
    // The API currently ignores the ID and uses 'example.com' hardcoded for MVP.
    const projectId = 'test-project-id';

    console.log('\n🔍 Testing GET /projects/:id/overview');
    const overviewRes = await fetch(`${API_URL}/projects/${projectId}/overview`, { headers });
    if (overviewRes.ok) {
        const data = await overviewRes.json();
        console.log('   ✅ Overview:', data);
    } else {
        console.error('   ❌ Failed:', await overviewRes.text());
    }

    console.log('\n🔍 Testing GET /projects/:id/pages');
    const pagesRes = await fetch(`${API_URL}/projects/${projectId}/pages?limit=5`, { headers });
    if (pagesRes.ok) {
        const data = await pagesRes.json();
        // @ts-ignore
        console.log(`   ✅ Pages: ${data.pages.length} returned (Total: ${data.total})`);
        // @ts-ignore
        if (data.pages.length > 0) {
            // @ts-ignore
            console.log(`      First page: ${data.pages[0].url}`);
        }
    } else {
        console.error('   ❌ Failed:', await pagesRes.text());
    }

    console.log('\n🔍 Testing GET /projects/:id/internal-links');
    const linksRes = await fetch(`${API_URL}/projects/${projectId}/internal-links`, { headers });
    if (linksRes.ok) {
        const data = await linksRes.json();
        // @ts-ignore
        console.log(`   ✅ Suggestions: ${data.length} returned`);
    } else {
        console.error('   ❌ Failed:', await linksRes.text());
    }

    console.log('\n🏁 Test Complete');
}

runTest().catch(e => {
    console.error('❌ Test failed:', e);
    process.exit(1);
});
