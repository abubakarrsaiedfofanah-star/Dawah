// Runtime slice from admin.js: renderPendingRoleRequests.
function renderPendingRoleRequests(requests) {
    const container = document.getElementById('pendingRoleRequestsList');
    if (!container) return;

    if (!requests.length) {
        container.innerHTML = '<div class="admin-empty-state"><i class="fas fa-circle-check"></i><h5>No pending role requests</h5><p class="text-muted mb-0">Special role approvals will appear here.</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="pending-role-grid">
            ${requests.map(request => {
                const name = [request.first_name, request.last_name].filter(Boolean).join(' ') || request.username || request.student_id || 'Member';
                const userId = request.id || request.user_id || request.username || request.student_id;
                const roleLabel = formatAdminRoleName(request.role || '-');
                const roleSummary = getOfficerApprovalSummary(request.role);
                return `
                    <article class="pending-role-card">
                        <div class="pending-role-card__icon"><i class="fas fa-user-shield"></i></div>
                        <div class="pending-role-card__body">
                            <div class="d-flex justify-content-between gap-2 flex-wrap">
                                <div>
                                    <h5>${escapeAdminText(name)}</h5>
                                    ${request.student_id ? `<p class="text-muted mb-1">${escapeAdminText(request.student_id)}</p>` : ''}
                                    <p class="text-muted mb-0">${escapeAdminText(request.email || '-')}</p>
                                </div>
                                <div class="text-end">
                                    <span class="badge bg-primary">${escapeAdminText(roleLabel)}</span>
                                    <span class="badge bg-warning text-dark">${escapeAdminText(request.status || 'pending')}</span>
                                </div>
                            </div>
                            <p class="text-muted mt-3 mb-0">${escapeAdminText(roleSummary)}</p>
                            <div class="pending-role-card__footer">
                                <small class="text-muted">${request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</small>
                                <div>
                                    <button class="btn btn-sm btn-success me-1" onclick="approveRoleRequest('${encodeURIComponent(userId)}')">
                                        <i class="fas fa-circle-check"></i> Approve
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="rejectRoleRequest('${encodeURIComponent(userId)}')">
                                        <i class="fas fa-circle-xmark"></i> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
}
