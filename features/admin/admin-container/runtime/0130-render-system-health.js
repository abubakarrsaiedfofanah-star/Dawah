// Runtime slice from admin.js: renderSystemHealth.
function renderSystemHealth(items, running = false) {
    const list = document.getElementById('systemHealthList');
    const summary = document.getElementById('systemHealthSummary');
    if (!list || !summary) return;

    if (running) {
        summary.className = 'alert alert-info py-2 mb-3';
        summary.textContent = 'Checking live app services...';
    } else {
        const failed = items.filter(item => item.status === 'fail').length;
        const warnings = items.filter(item => item.status === 'warn').length;
        summary.className = failed
            ? 'alert alert-danger py-2 mb-3'
            : warnings
                ? 'alert alert-warning py-2 mb-3'
                : 'alert alert-success py-2 mb-3';
        summary.textContent = failed
            ? `${failed} important check(s) failed. Open the failed item before handing over.`
            : warnings
                ? `${warnings} check(s) need attention, but the main app is reachable.`
                : 'Core services are reachable from this browser.';
    }

    list.innerHTML = items.map(item => `
        <div class="col-md-6 col-xl-4">
            <div class="border rounded p-3 h-100">
                <div class="d-flex justify-content-between align-items-start gap-2">
                    <strong><i class="fas ${item.icon} me-1"></i> ${escapeAdminText(item.name)}</strong>
                    ${healthBadge(item.status)}
                </div>
                <p class="text-muted small mb-0 mt-2">${escapeAdminText(item.detail)}</p>
            </div>
        </div>
    `).join('');
}
