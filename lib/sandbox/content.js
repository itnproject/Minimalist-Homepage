chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'injectExtCode') {
        try {
            const script = document.createElement('script');
            script.textContent = request.code;
            document.body.appendChild(script);
            script.remove();
            sendResponse({ success: true });
        } catch (e) {
            sendResponse({ success: false, error: e.message });
        }
        return true;
    }
});