// Runtime slice from admin.js: loadAdminAccounts.
function loadAdminAccounts() {
    fetch(`${API_URL}?action=listAdminAccounts`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load admin accounts');
        }

        const payload = result.data || {};
        const admins = payload.admins || [];
        const limit = payload.admin_limit || ADMIN_ACCOUNT_LIMIT;
        const count = payload.admin_count ?? admins.length;
        const badge = document.getElementById('adminAccountLimitBadge');
        const createButton = document.getElementById('managedAdminCreateButton');
        const container = document.getElementById('adminAccountsList');

        if (badge) badge.textContent = `${count} / ${limit} admins`;
        if (createButton) createButton.disabled = count >= limit;

        if (!container) return;
        if (!admins.length) {
            container.innerHTML = '<p class="text-muted">No admin accounts found.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${admins.map(admin => `
                            <tr>
                                <td>${escapeAdminText(admin.username)} ${admin.is_current ? '<span class="badge bg-success ms-1">You</span>' : ''}</td>
                                <td>${escapeAdminText(admin.email)}</td>
                                <td><span class="badge bg-${admin.status === 'active' ? 'success' : 'secondary'}">${escapeAdminText(admin.status || 'active')}</span></td>
                                <td>${admin.created_at ? new Date(admin.created_at).toLocaleString() : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="resetManagedAdminPassword(${JSON.stringify(String(admin.id || admin.uid || ''))}, ${JSON.stringify(String(admin.email || ''))})">
                                        <i class="fas fa-key"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" ${admin.is_current ? 'disabled' : ''} onclick="removeManagedAdmin(${JSON.stringify(String(admin.id || admin.uid || ''))})">
                                        <i class="fas fa-trash"></i> Remove
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading admin accounts:', error);
        showNotification(error.message || 'Error loading admin accounts', 'danger');
    });
}
