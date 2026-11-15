"use strict";
const realParent = parent;
const pendingRequests = {};
let requestId = 0;
let extId = '';
let apiCode = '';
let simWin = null;
let simDoc = null;
let parentProxy = null;
function sendRequest(method, args) {
    return new Promise((resolve, reject) => {
        const id = `req_${++requestId}_${Date.now()}`;
        pendingRequests[id] = { resolve, reject };
        const msg = { type: 'sandboxRequest', extId, requestId: id, method, args };
        realParent.postMessage(msg, '*');
        setTimeout(() => {
            if (pendingRequests[id]) {
                reject(new Error('Request timeout'));
                delete pendingRequests[id];
            }
        }, 5000);
    });
}
function createSimulatedDocument() {
    const elements = {};
    let elemCounter = 0;
    function createElement(tag) {
        const id = `elem_${++elemCounter}`;
        const elem = {
            _id: id,
            _tag: tag,
            _attrs: {},
            _children: [],
            _text: '',
            tagName: tag.toUpperCase(),
            setAttribute(k, v) { this._attrs[k] = v; },
            getAttribute(k) { return this._attrs[k]; },
            appendChild(child) {
                this._children.push(child);
                return sendRequest('appendChild', [this._id, child._id]);
            },
            addEventListener() { },
            removeEventListener() { },
            get style() {
                const self = this;
                return new Proxy({}, {
                    set(_t, p, v) { self._attrs[`style_${String(p)}`] = String(v); return true; }
                });
            },
            get textContent() { return this._text; },
            set textContent(v) { this._text = v; },
            get innerHTML() { return this._text; },
            set innerHTML(v) { this._text = v; }
        };
        elements[id] = elem;
        return elem;
    }
    const head = createElement('head');
    const body = createElement('body');
    return {
        _elements: elements,
        createElement,
        getElementById: (id) => sendRequest('getElementById', [id]),
        querySelector: (sel) => sendRequest('querySelector', [sel]),
        querySelectorAll: () => [],
        head,
        body,
        documentElement: body
    };
}
function createSimulatedWindow(simDoc) {
    return {
        document: simDoc,
        console,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        JSON,
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Promise,
        Error,
        RegExp,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        decodeURI,
        encodeURI,
        decodeURIComponent,
        encodeURIComponent
    };
}
function executeCode(code) {
    const fn = new Function('window', 'document', 'parent', 'simWin', 'simDoc', 'parentProxy', code);
    fn(simWin, simDoc, parentProxy, simWin, simDoc, parentProxy);
}
window.addEventListener('message', (e) => {
    if (!e.origin.startsWith('chrome-extension://') && !e.origin.startsWith('moz-extension://'))
        return;
    const data = e.data;
    if (data && data.type === 'sandboxResponse') {
        const resp = data;
        const req = pendingRequests[resp.requestId];
        if (req) {
            delete pendingRequests[resp.requestId];
            if (resp.error)
                req.reject(new Error(resp.error));
            else
                req.resolve(resp.result);
        }
        return;
    }
    if (data && data.action === 'execCode') {
        const msg = data;
        extId = msg.id || '';
        apiCode = msg.apiCode || '';
        try {
            const code = msg.code || '';
            const _simDoc = createSimulatedDocument();
            const _simWin = createSimulatedWindow(_simDoc);
            const _parentProxy = new Proxy({}, {
                get(_t, p) {
                    if (p === 'document')
                        return _simDoc;
                    if (p === 'window')
                        return _simWin;
                    if (p === 'postMessage')
                        return realParent.postMessage.bind(realParent);
                    return undefined;
                }
            });
            simWin = _simWin;
            simDoc = _simDoc;
            parentProxy = _parentProxy;
            executeCode(apiCode + '\n' + code);
            realParent.postMessage({ type: 'extDone', id: extId }, e.origin);
        }
        catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            realParent.postMessage({ type: 'extError', id: extId, error }, e.origin);
        }
    }
});
