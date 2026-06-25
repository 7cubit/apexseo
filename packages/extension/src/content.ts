// content.ts
// Re-inject listener to ensure we don't have duplicates if injected multiple times
(function () {
    if ((window as any).apexSeoListenerInstalled) return;
    (window as any).apexSeoListenerInstalled = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'captureHTML') {
            try {
                const fullHtml = document.documentElement.outerHTML;
                // Limit to 5MB roughly
                const sizeLimit = 5 * 1024 * 1024;
                const payload = fullHtml.length > sizeLimit
                    ? fullHtml.substring(0, sizeLimit)
                    : fullHtml;

                sendResponse({ html: payload });
            } catch (error) {
                console.error('ApexSEO: Failed to capture HTML', error);
                sendResponse({ error: 'Failed to capture HTML' });
            }
        }
        return true; // Keep channel open for async response
    });
})();
