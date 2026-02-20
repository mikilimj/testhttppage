const methodEl = document.getElementById('method');
const urlEl = document.getElementById('url');
const headersEl = document.getElementById('headers');
const bodyEl = document.getElementById('body');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const outputEl = document.getElementById('output');
const statusTextEl = document.getElementById('statusText');
const responseMetaEl = document.getElementById('responseMeta');

const bodyMethods = new Set(['POST', 'PUT', 'PATCH']);

function setStatus(message, isError = false) {
    statusTextEl.textContent = message;
    statusTextEl.classList.toggle('status--error', isError);
}

function setMeta({ status = '—', time = '—', size = '—' }) {
    responseMetaEl.innerHTML = `<span>Status: ${status}</span><span>Time: ${time}</span><span>Size: ${size}</span>`;
}

function formatOutput(data) {
    if (typeof data === 'string') {
        return data;
    }
    return JSON.stringify(data, null, 2);
}

function parseJsonInput(text, label) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        throw new Error(`${label} must be valid JSON.`);
    }
}

async function sendRequest() {
    const method = methodEl.value;
    const url = urlEl.value.trim();

    if (!url) {
        setStatus('URL is required.', true);
        return;
    }

    let headers = {};
    let body = null;

    try {
        headers = parseJsonInput(headersEl.value, 'Headers') || {};
        body = parseJsonInput(bodyEl.value, 'Body');
    } catch (error) {
        setStatus(error.message, true);
        return;
    }

    if (!bodyMethods.has(method)) {
        body = null;
    }

    sendBtn.disabled = true;
    setStatus('Sending...');
    setMeta({});

    const start = performance.now();

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body !== null ? JSON.stringify(body) : null
        });

        const elapsed = `${Math.round(performance.now() - start)}ms`;
        const contentType = response.headers.get('content-type') || '';
        const rawText = await response.text();

        let payload = rawText;
        if (contentType.includes('application/json')) {
            try {
                payload = JSON.parse(rawText);
            } catch {
                payload = rawText;
            }
        }

        outputEl.textContent = formatOutput(payload);
        setMeta({
            status: `${response.status} ${response.statusText}`,
            time: elapsed,
            size: `${new Blob([rawText]).size} bytes`
        });
        setStatus(response.ok ? 'Request complete.' : 'Request completed with server error.', !response.ok);
    } catch (error) {
        setStatus('Network error or blocked by CORS policy.', true);
        outputEl.textContent = error.message;
        setMeta({ status: 'Failed' });
    } finally {
        sendBtn.disabled = false;
    }
}

function clearAll() {
    headersEl.value = '';
    bodyEl.value = '';
    outputEl.textContent = 'No request sent yet.';
    setMeta({});
    setStatus('Cleared');
}

async function copyResponse() {
    try {
        await navigator.clipboard.writeText(outputEl.textContent);
        setStatus('Response copied.');
    } catch {
        setStatus('Copy failed.', true);
    }
}

sendBtn.addEventListener('click', sendRequest);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResponse);

setMeta({});
