// background.ts
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url) return;

    // Inject content script if not already there (Manifest injects it, but programmatic injection is safer for SPA navs or reloads)
    // However, manifest content_scripts is sufficient for "matches": ["<all_urls>"]

    try {
        // Send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'captureHTML' });

        if (response && response.html) {
            console.log('Sending HTML to API...');

            // Post to API
            const apiResponse = await fetch('http://localhost:4000/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'dev_secret_key' // Should be env var in real build, but hardcoded for now as per constraints
                },
                body: JSON.stringify({
                    url: tab.url,
                    html: response.html
                })
            });

            const result = await apiResponse.json();
            console.log('API Response:', result);
        }
    } catch (error) {
        console.error('ApexSEO Background Error:', error);
    }
});

// Also listen for navigation completion if we want auto-ingest
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        // Logic for auto-ingest could go here, but strict requirement "on navigation" usually implies explicit action or specific event.
        // "Inject the content script upon navigation" in the prompt.
        // With MV3 and `content_scripts` in manifest, it's auto-injected.
        // But let's support programmatic injection just in case.

        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            });

            // We might not want to auto-send every page load to avoid spamming the local dev API.
            // Prompt says "Inject the content script upon navigation. Send the HTML payload to the API."
            // implying AUTO send.

            const response = await chrome.tabs.sendMessage(tabId, { action: 'captureHTML' });
            if (response && response.html) {
                await fetch('http://localhost:4000/ingest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'dev_secret_key' // Using simple dev key
                    },
                    body: JSON.stringify({
                        url: tab.url,
                        html: response.html
                    })
                });
            }

        } catch (e) {
            // Ignore errors for tabs we can't inject into
        }
    }
});
