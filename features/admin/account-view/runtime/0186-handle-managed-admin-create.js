// Runtime slice from admin.js: handleManagedAdminCreate.
async function handleManagedAdminCreate(event) {
    event.preventDefault();
    const username = document.getElementById('managedAdminUsername').value.trim();
    const email = document.getElementById('managedAdminEmail').value.trim().toLowerCase();
    const password = document.getElementById('managedAdminPassword').value;
    const button = document.getElementById('managedAdminCreateButton');

    if (!isStrongAdminPassword(password)) {
        showNotification('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.', 'warning');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    try {
        const response = await fetch(`${API_URL}?action=createAdminAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            throw new Error(result.message || 'Could not add admin account');
        }
        document.getElementById('adminCreateForm').reset();
        showNotification('Admin account added successfully', 'success');
        loadAdminAccounts();
    } catch (error) {
        showNotification(error.message || 'Could not add admin account', 'danger');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-save"></i> Add Admin';
    }
}
