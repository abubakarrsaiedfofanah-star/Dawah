// Runtime slice from admin.js: loadPendingRoleRequests.
function loadPendingRoleRequests() {
    const containers = [
        document.getElementById('pendingRoleRequestsList'),
        document.getElementById('dashboardPendingRoleRequestsList')
    ].filter(Boolean);
    if (!containers.length) return;
    renderPendingRoleRequests(getLocalPendingRoleRequests());

    const cloudMembers = window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()
        ? window.SupabaseBackend.listMembers()
        : Promise.resolve(null);
    Promise.race([
        cloudMembers,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud role requests timed out. Tap Refresh to try again.')), 10000))
    ])
    .then(members => {
        if (Array.isArray(members)) {
            localStorage.setItem('allMembers', JSON.stringify(members));
        }
        renderPendingRoleRequests(getLocalPendingRoleRequests());
    })
    .catch(error => {
        console.error('Pending role request refresh failed:', error);
        if (!getLocalPendingRoleRequests().length) {
            containers.forEach(container => {
                container.innerHTML = `<div class="admin-empty-state"><i class="fas fa-triangle-exclamation"></i><h5>Could not refresh role requests</h5><p class="text-muted mb-0">${escapeAdminText(error.message || 'Please try again.')}</p></div>`;
            });
        }
    });
}
