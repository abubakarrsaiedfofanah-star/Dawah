// Runtime slice from daawah.js: loadAdminWelfare.
function loadAdminWelfare() {
    const tbody = document.getElementById('adminWelfareList');
    if (!tbody) return;

    if (welfareRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No welfare requests have been submitted yet.</td></tr>';
        return;
    }

    tbody.innerHTML = welfareRequests.map(request => `
        <tr>
            <td>
                <strong>${request.submittedByName || request.submittedBy || request.name || currentUser?.name || currentUser?.username || 'Member'}</strong>
                <div class="small text-muted"><i class="fas fa-id-card"></i> ${request.submittedByStudentId || 'No student ID'}</div>
                <div class="small text-muted"><i class="fas fa-envelope"></i> ${request.submittedByEmail || 'No email'}</div>
                <div class="small text-muted"><i class="fas fa-phone"></i> ${request.submittedByPhone || 'No phone'}</div>
            </td>
            <td>${request.type || request.category || 'Support request'}</td>
            <td>${request.amount || 'Not specified'}</td>
            <td>${request.date || request.submittedDate || 'Recently'}</td>
            <td><span class="badge bg-${getWelfareStatusColor(request.status)}"><i class="fas ${getWelfareStatusIcon(request.status)} me-1"></i>${formatWelfareStatus(request.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveWelfare()"><i class="fas fa-circle-check"></i> Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectWelfare()"><i class="fas fa-circle-xmark"></i> Reject</button>
            </td>
        </tr>
    `).join('');
}
