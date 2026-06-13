// Runtime slice from daawah.js: updateWelfareRequestsList.
function updateWelfareRequestsList() {
    const tbody = document.getElementById('welfareRequestsTableBody');
    if (!tbody) return;

    welfareRequests = readList('welfareRequests');
    const userKey = getCurrentWelfareUserKey();
    const userRequests = welfareRequests.filter(request => {
        if (!userKey) return true;
        return request.submittedByKey === userKey ||
            request.submittedByStudentId === currentUser?.studentId ||
            request.submittedByStudentId === currentUser?.username ||
            request.submittedByEmail === currentUser?.email ||
            request.submittedBy === currentUser?.fullName ||
            request.submittedBy === currentUser?.name ||
            request.submittedBy === currentUser?.username;
    });

    if (!userRequests.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No welfare requests submitted yet.</td></tr>';
        return;
    }

    tbody.innerHTML = userRequests.map(request => `
        <tr>
            <td>${request.type || request.category || 'Welfare Request'}</td>
            <td>${request.dateSubmitted || request.created_at || '-'}</td>
            <td><span class="badge bg-${getWelfareStatusColor(request.status)}"><i class="fas ${getWelfareStatusIcon(request.status)} me-1"></i>${formatWelfareStatus(request.status)}</span></td>
            <td>${formatWelfareAmount(request.amount || request.amount_needed)}</td>
        </tr>
    `).join('');
}
