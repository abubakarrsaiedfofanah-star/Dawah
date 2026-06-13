// Runtime slice from admin.js: handleMemberRoleAssign.
function handleMemberRoleAssign(event) {
    event.preventDefault();
    const userId = document.getElementById('memberRoleUser')?.value;
    const role = document.getElementById('memberRoleValue')?.value;
    const status = document.getElementById('memberRoleStatus')?.value || 'active';
    const button = document.getElementById('memberRoleAssignButton');
    if (!userId || !role) {
        showNotification('Please choose a member and role.', 'warning');
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    fetch(`${API_URL}?action=assignMemberRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, status })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not assign role');
        showNotification('Member role updated.', 'success');
        loadRoleAssignableMembers();
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not assign role', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Save Role';
        }
    });
}
