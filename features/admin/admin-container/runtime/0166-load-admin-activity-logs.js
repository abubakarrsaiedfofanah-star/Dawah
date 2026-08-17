// Runtime slice from admin.js: loadAdminActivityLogs.
function loadAdminActivityLogs() {
    fetch(`${API_URL}?action=getAdminActivityLogs`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load admin activity');
        }
        renderActivityLogTable('adminActivityLogList', result.data || [], {
            showMainAdminActions: true,
            showUndoActions: false
        });
        const container = document.getElementById('adminActivityLogList');
        if (container && !document.getElementById('auditExportButton')) {
            container.insertAdjacentHTML('afterbegin', `
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <input type="search" class="form-control form-control-sm" id="auditLogFilter" placeholder="Filter audit logs" oninput="filterAuditLogRows()" style="max-width: 320px;">
                    <a class="btn btn-sm btn-outline-secondary" id="auditExportButton" href="${API_URL}?action=exportAuditLogs" target="_blank">
                        <i class="fas fa-file-csv"></i> Export Audit CSV
                    </a>
                </div>
            `);
        }
    })
    .catch(error => {
        const container = document.getElementById('adminActivityLogList');
        if (container) container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load admin activity')}</p>`;
    });
}
