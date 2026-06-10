// Runtime slice from admin.js: renderAdminActivityControls.
function renderAdminActivityControls(log) {
    const deleteLogButton = `<button class="btn btn-sm btn-outline-danger me-1" onclick="deleteAdminActivityLog(${Number(log.id)})">Delete Log</button>`;
    if (log.action === 'pendingAdminApproval') {
        return `
            <button class="btn btn-sm btn-success me-1" onclick="approvePendingAdminActivity(${Number(log.id)})">Approve</button>
            <button class="btn btn-sm btn-outline-danger me-1" onclick="rejectPendingAdminActivity(${Number(log.id)})">Reject</button>
            ${deleteLogButton}
        `;
    }
    if (['opposeAdminActivity', 'deleteAdminActivityItem', 'undoMyAdminActivityItem'].includes(log.action)) {
        return `<span class="text-muted me-2">Recorded</span>${deleteLogButton}`;
    }
    const deleteButton = canDeleteActivityItem(log)
        ? `<button class="btn btn-sm btn-outline-danger me-1" onclick="deleteActivityItemFromLog(${Number(log.id)})">Delete Item</button>`
        : '';
    return `
        ${deleteButton}
        <button class="btn btn-sm btn-outline-warning me-1" onclick="opposeAdminActivity(${Number(log.id)})">Oppose</button>
        ${deleteLogButton}
    `;
}
