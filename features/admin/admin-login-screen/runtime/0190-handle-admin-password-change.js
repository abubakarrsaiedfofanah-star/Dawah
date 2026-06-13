// Runtime slice from admin.js: handleAdminPasswordChange.
async function handleAdminPasswordChange(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('adminCurrentPassword').value;
    const newPassword = document.getElementById('adminNewPassword').value;
    const confirmPassword = document.getElementById('adminConfirmNewPassword').value;
    const button = document.getElementById('adminChangePasswordButton');

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'warning');
        return;
    }
    if (!isStrongAdminPassword(newPassword)) {
        showNotification('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.', 'warning');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        if (window.SupabaseBackend?.enabled && currentAdmin?.email) {
            await window.SupabaseBackend.loginEmail(currentAdmin.email, currentPassword);
        }
        const response = await fetch(`${API_URL}?action=changeAdminPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            throw new Error(result.message || 'Could not change password');
        }
        document.getElementById('adminChangePasswordForm').reset();
        showNotification('Password changed successfully', 'success');
    } catch (error) {
        showNotification(error.message || 'Could not change password', 'danger');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-key"></i> Change Password';
    }
}
