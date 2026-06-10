// Runtime slice from admin.js: renderUndoActivityControls.
function renderUndoActivityControls(log) {
    const deleteLogButton = `<button class="btn btn-sm btn-outline-danger" onclick="deleteMyAdminActivityLog(${Number(log.id)})">Delete Log</button>`;
    if (['opposeAdminActivity', 'deleteAdminActivityItem', 'undoMyAdminActivityItem'].includes(log.action)) {
        return `<span class="text-muted me-2">Recorded</span>${deleteLogButton}`;
    }
    if (!canDeleteActivityItem(log)) {
        return `<span class="text-muted me-2">Not undoable</span>${deleteLogButton}`;
    }
    return `
        <button class="btn btn-sm btn-outline-warning me-1" onclick="undoMyAdminActivity(${Number(log.id)})">Undo</button>
        ${deleteLogButton}
    `;
}
