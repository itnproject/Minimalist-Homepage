console.log('Sandbox loaded');
window.addEventListener('message', function(e) {
    console.log('Sandbox received message:', e.data.type);
    if (e.data && e.data.type === 'execExt') {
        try {
            var apiCode = e.data.apiCode || '';
            var code = e.data.code || '';
            console.log('Executing code, apiCode length:', apiCode.length, 'code length:', code.length);
            var fullCode = 'var document = parent.document; var window = parent;' + apiCode + '\n' + code;
            eval(fullCode);
            console.log('Code executed successfully');
            parent.postMessage({ type: 'extDone', id: e.data.id }, '*');
        } catch(err) {
            console.error('Sandbox error:', err);
            parent.postMessage({ type: 'extError', id: e.data.id, error: err.message }, '*');
        }
    }
});