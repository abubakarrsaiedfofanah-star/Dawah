// Runtime slice from admin.js: renderActivityLogTable.
function renderActivityLogTable(containerId, logs, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!logs.length) {
        container.innerHTML = '<p class="text-muted">No admin activity recorded yet.</p>';
        return;
    }

    container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead>
                        <tr>
                            <th>Who Did It</th>
                            <th>Source</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP</th>
                            <th>Time</th>
                            ${options.showMainAdminActions ? '<th>Main Admin Action</th>' : ''}
                            ${options.showUndoActions ? '<th>Undo</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td>${escapeAdminText(log.username || 'Unknown')}</td>
                                <td><span class="badge bg-${log.source === 'member_dashboard' ? 'info' : 'dark'}">${escapeAdminText(formatActivitySource(log.source))}</span></td>
                                <td><span class="badge bg-secondary">${escapeAdminText(formatAdminAction(log.action))}</span></td>
                                <td>${escapeAdminText(formatAdminActivityDetails(log.details))}</td>
                                <td>${escapeAdminText(log.ip_address || '-')}</td>
                                <td>${log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                                ${options.showMainAdminActions ? `<td>${renderAdminActivityControls(log)}</td>` : ''}
                                ${options.showUndoActions ? `<td>${renderUndoActivityControls(log)}</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
}
