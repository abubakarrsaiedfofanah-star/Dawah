// Runtime slice from admin.js: renderBackupStatus.
function renderBackupStatus() {
    const element = document.getElementById('backupStatusSummary');
    if (!element) return;
    const status = getBackupStatus();
    const badge = status.status === 'ok' ? 'success' : 'warning text-dark';
    element.innerHTML = `<span class="badge bg-${badge} me-1">${status.status === 'ok' ? 'Backup OK' : 'Backup Due'}</span>${escapeAdminText(status.detail)}`;
}
