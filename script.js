const statuses = [
    { code: 100, title: 'Continue', description: 'Client should continue with request body.' },
    { code: 101, title: 'Switching Protocols', description: 'Server switches to another protocol.' },
    { code: 200, title: 'OK', description: 'Request succeeded normally.' },
    { code: 201, title: 'Created', description: 'Resource created successfully.' },
    { code: 204, title: 'No Content', description: 'Request succeeded but no response body.' },
    { code: 301, title: 'Moved Permanently', description: 'Resource has a new permanent URL.' },
    { code: 302, title: 'Found', description: 'Resource temporarily available at another URL.' },
    { code: 304, title: 'Not Modified', description: 'Cached version is still valid.' },
    { code: 400, title: 'Bad Request', description: 'Request syntax is invalid.' },
    { code: 401, title: 'Unauthorized', description: 'Authentication is required.' },
    { code: 403, title: 'Forbidden', description: 'Server understood but refuses access.' },
    { code: 404, title: 'Not Found', description: 'Requested resource does not exist.' },
    { code: 409, title: 'Conflict', description: 'Request conflicts with current state.' },
    { code: 429, title: 'Too Many Requests', description: 'Rate limit has been exceeded.' },
    { code: 500, title: 'Internal Server Error', description: 'Unexpected server-side failure.' },
    { code: 502, title: 'Bad Gateway', description: 'Invalid response from upstream server.' },
    { code: 503, title: 'Service Unavailable', description: 'Server cannot handle request currently.' }
];

const searchEl = document.getElementById('search');
const groupEl = document.getElementById('group');
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const exampleButtons = document.querySelectorAll('.example');

function groupFromCode(code) {
    return String(code)[0];
}

function matchesQuery(item, query) {
    if (!query) return true;

    const raw = query.toLowerCase().trim();
    const compact = raw.replace(/\s+/g, '');
    const itemCode = String(item.code);

    if (compact.endsWith('xx') && compact.length === 3 && /[1-5]xx/.test(compact)) {
        return itemCode.startsWith(compact[0]);
    }

    return itemCode.includes(compact) ||
        item.title.toLowerCase().includes(raw) ||
        item.description.toLowerCase().includes(raw);
}

function render() {
    const query = searchEl.value;
    const group = groupEl.value;

    const filtered = statuses.filter((item) => {
        if (group !== 'all' && groupFromCode(item.code) !== group) {
            return false;
        }
        return matchesQuery(item, query);
    });

    listEl.innerHTML = filtered
        .map((item) => `
            <li class="status-item group-${groupFromCode(item.code)}">
                <h3>${item.code} — ${item.title}</h3>
                <p>${item.description}</p>
            </li>
        `)
        .join('');

    emptyEl.classList.toggle('hidden', filtered.length > 0);
}

searchEl.addEventListener('input', render);
groupEl.addEventListener('change', render);

exampleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        searchEl.value = button.dataset.query || '';
        render();
        searchEl.focus();
    });
});

render();
