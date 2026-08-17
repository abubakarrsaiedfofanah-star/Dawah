// Runtime slice from admin.js: resetManagedAdminPassword.
function resetManagedAdminPassword(adminId, email = '') {
    if (!email) {
        showNotification('This admin has no email for password reset.', 'warning');
        return;
    }
    if (!confirm(`Send a password reset email to ${email}?`)) return;

    fetch(`${API_URL}?action=resetAdminPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, email })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not send password reset email');
        showNotification('Password reset email sent to this admin.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not send password reset email', 'danger'));
}
