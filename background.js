chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchQuote') {
        fetch('https://v2.jinrishici.com/one.json')
            .then(res => res.json())
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
    if (request.action === 'execExtCode') {
        const fullCode = (request.apiCode || '') + '\n' + (request.code || '');
        chrome.tabs.sendMessage(sender.tab.id, {
            action: 'injectExtCode',
            code: fullCode
        }, function(response) {
            if (response && response.success) {
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: response ? response.error : 'unknown' });
            }
        });
        return true;
    }
});