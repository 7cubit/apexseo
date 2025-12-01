import { DataForSEOClient } from '@/lib/dataforseo';

async function verify() {
    console.log("Verifying DataForSEO credentials...");

    // Manually set env vars for this process if not already set
    // In a real run, we'd pass them, but here we can rely on the caller to provide them
    // or we can hardcode them temporarily for this test script (not recommended for commit)
    // but since I'm running it via `run_command` with env vars, I'll rely on process.env.

    const client = new DataForSEOClient();

    try {
        console.log("Testing getSearchVolume...");
        const volume = await client.getSearchVolume(['seo tools']);
        console.log("Search Volume Result:", JSON.stringify(volume, null, 2));

        if (volume && volume.tasks && volume.tasks[0] && volume.tasks[0].status_code === 20000) {
            console.log("SUCCESS: DataForSEO credentials are valid.");
        } else {
            console.error("FAILURE: DataForSEO API returned unexpected response.");
        }

    } catch (error) {
        console.error("FAILURE: Error calling DataForSEO API:", error);
    }
}

verify();
