// Runtime slice from admin.js: removeManagedAdmin.
function removeManagedAdmin(adminId) {
    if (!isBackupCurrentEnoughForDanger()) return;
    if (!confirm('Remove this admin from admin-panel access?')) return;
    fetch(`${API_URL}?action=deleteAdminAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not remove admin account');
        showNotification('Admin account removed', 'success');
        loadAdminAccounts();
    })
    .catch(error => showNotification(error.message || 'Could not remove admin account', 'danger'));
}
