console.log('🚀 Script started');

const dotenv = require('dotenv');
dotenv.config();

let writePageToClickHouse, updateGraphInNeo4j;

try {
    // We need to use ts-node to require TS files
    // But since we are running with ts-node, we can require them directly
    ({ writePageToClickHouse } = require('../packages/workers/src/activities/db/WritePageToClickHouseActivity'));
    ({ updateGraphInNeo4j } = require('../packages/workers/src/activities/db/UpdateGraphInNeo4jActivity'));
    console.log('✅ Activities loaded');
} catch (e) {
    console.error('❌ Import failed:', e);
    process.exit(1);
}

async function runTest() {
    console.log('🧪 Testing Activities Directly...');

    const mockPage = {
        url: 'https://example.com/direct-test',
        title: 'Direct Test Page',
        h1: 'Direct Test H1',
        content: 'This is a direct test content.',
        wordCount: 50,
        links: [
            { url: 'https://example.com/other', text: 'Other', isInternal: true },
            { url: 'https://google.com', text: 'Google', isInternal: false }
        ],
        status: 200,
        siteId: 'example.com'
    };

    console.log('   Writing to ClickHouse...');
    try {
        await writePageToClickHouse(mockPage);
        console.log('   ✅ ClickHouse Write Success');
    } catch (e) {
        console.error('   ❌ ClickHouse Write Failed:', e);
    }

    console.log('   Updating Neo4j...');
    try {
        await updateGraphInNeo4j(mockPage);
        console.log('   ✅ Neo4j Update Success');
    } catch (e) {
        console.error('   ❌ Neo4j Update Failed:', e);
    }

    console.log('🏁 Direct Test Complete.');
}

runTest().catch(e => {
    console.error('❌ Test failed:', e);
    process.exit(1);
});
