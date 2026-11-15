interface SandboxRequest {
    type: 'sandboxRequest';
    extId: string;
    requestId: string;
    method: string;
    args: unknown[];
}

interface SandboxResponse {
    type: 'sandboxResponse';
    requestId: string;
    result?: unknown;
    error?: string;
}

interface ExecCodeMessage {
    action: 'execCode';
    id: string;
    apiCode: string;
    code: string;
}

interface DoneMessage {
    type: 'extDone';
    id: string;
}

interface ErrorMessage {
    type: 'extError';
    id: string;
    error: string;
}

type IncomingMessage = SandboxResponse | ExecCodeMessage;
type OutgoingMessage = SandboxRequest | DoneMessage | ErrorMessage;

interface SimElement {
    _id: string;
    _tag: string;
    _attrs: Record<string, string>;
    _children: SimElement[];
    _text: string;
    tagName: string;
    setAttribute: (key: string, value: string) => void;
    getAttribute: (key: string) => string | undefined;
    appendChild: (child: SimElement) => Promise<unknown>;
    addEventListener: () => void;
    removeEventListener: () => void;
    style: Record<string, string>;
    textContent: string;
    innerHTML: string;
}

interface SimDocument {
    _elements: Record<string, SimElement>;
    createElement: (tag: string) => SimElement;
    getElementById: (id: string) => Promise<unknown>;
    querySelector: (sel: string) => Promise<unknown>;
    querySelectorAll: () => SimElement[];
    head: SimElement;
    body: SimElement;
    documentElement: SimElement;
}

interface SimWindow {
    document: SimDocument;
    console: Console;
    setTimeout: typeof setTimeout;
    setInterval: typeof setInterval;
    clearTimeout: typeof clearTimeout;
    clearInterval: typeof clearInterval;
    JSON: JSON;
    Math: Math;
    Date: typeof Date;
    Array: typeof Array;
    Object: typeof Object;
    String: typeof String;
    Number: typeof Number;
    Boolean: typeof Boolean;
    Promise: typeof Promise;
    Error: typeof Error;
    RegExp: typeof RegExp;
    parseInt: typeof parseInt;
    parseFloat: typeof parseFloat;
    isNaN: typeof isNaN;
    isFinite: typeof isFinite;
    decodeURI: typeof decodeURI;
    encodeURI: typeof encodeURI;
    decodeURIComponent: typeof decodeURIComponent;
    encodeURIComponent: typeof encodeURIComponent;
}

const realParent = parent;
const pendingRequests: Record<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }> = {};
let requestId = 0;
let extId = '';
let apiCode = '';
let simWin: any = null;
let simDoc: any = null;
let parentProxy: any = null;

function sendRequest(method: string, args: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const id = `req_${++requestId}_${Date.now()}`;
        pendingRequests[id] = { resolve, reject };
        const msg: SandboxRequest = { type: 'sandboxRequest', extId, requestId: id, method, args };
        realParent.postMessage(msg, '*');
        setTimeout(() => {
            if (pendingRequests[id]) {
                reject(new Error('Request timeout'));
                delete pendingRequests[id];
            }
        }, 5000);
    });
}

function createSimulatedDocument(): SimDocument {
    const elements: Record<string, SimElement> = {};
    let elemCounter = 0;

    function createElement(tag: string): SimElement {
        const id = `elem_${++elemCounter}`;
        const elem: SimElement = {
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
            addEventListener() {},
            removeEventListener() {},
            get style() {
                const self = this;
                return new Proxy<Record<string, string>>({}, {
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

function createSimulatedWindow(simDoc: SimDocument): SimWindow {
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

function executeCode(code: string): void {
    const fn = new Function(
        'window', 'document', 'parent', 'simWin', 'simDoc', 'parentProxy',
        code
    );
    fn(simWin, simDoc, parentProxy, simWin, simDoc, parentProxy);
}

window.addEventListener('message', (e: MessageEvent<IncomingMessage>) => {
    if (!e.origin.startsWith('chrome-extension://') && !e.origin.startsWith('moz-extension://')) return;
    const data = e.data;

    if (data && (data as SandboxResponse).type === 'sandboxResponse') {
        const resp = data as SandboxResponse;
        const req = pendingRequests[resp.requestId];
        if (req) {
            delete pendingRequests[resp.requestId];
            if (resp.error) req.reject(new Error(resp.error));
            else req.resolve(resp.result);
        }
        return;
    }

    if (data && (data as ExecCodeMessage).action === 'execCode') {
        const msg = data as ExecCodeMessage;
        extId = msg.id || '';
        apiCode = msg.apiCode || '';
        try {
            const code = msg.code || '';
            const _simDoc = createSimulatedDocument();
            const _simWin = createSimulatedWindow(_simDoc);
            const _parentProxy = new Proxy({}, {
                    get(_t, p) {
                        if (p === 'document') return _simDoc;
                        if (p === 'window') return _simWin;
                        if (p === 'postMessage') return realParent.postMessage.bind(realParent);
                        return undefined;
                    }
                });

            simWin = _simWin;
            simDoc = _simDoc;
            parentProxy = _parentProxy;

            executeCode(apiCode + '\n' + code);
            realParent.postMessage({ type: 'extDone', id: extId } as DoneMessage, e.origin);
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            realParent.postMessage({ type: 'extError', id: extId, error } as ErrorMessage, e.origin);
        }
    }
});