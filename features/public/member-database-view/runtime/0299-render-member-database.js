// Runtime slice from daawah.js: renderMemberDatabase.
function renderMemberDatabase() {
    const tbody = document.getElementById('membersList');
    if (!tbody) return;

    if (allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No registered students yet</td></tr>';
        return;
    }

    tbody.innerHTML = allMembers.map(member => `
        <tr>
            <td><input class="form-check-input student-select-checkbox" type="checkbox" value="${escapeHtml(member.studentId || member.username || '')}"></td>
            <td>${renderMemberPhoto(member)}</td>
            <td>${member.fullName || member.name || member.username || 'N/A'}</td>
            <td>${member.studentId || member.username || 'N/A'}</td>
            <td>${member.email || 'N/A'}</td>
            <td>${member.course || 'N/A'}</td>
            <td><span class="badge ${getMemberStatusBadgeClass(member.status)}">${formatMemberStatus(member.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewMemberDetails('${member.studentId || member.username}')">View</button>
                <button class="btn btn-sm btn-warning" onclick="editMember('${member.studentId || member.username}')">Edit</button>
                <button class="btn btn-sm btn-outline-success" onclick="setMemberStatus('${member.studentId || member.username}', 'Active')">Approve</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="setMemberStatus('${member.studentId || member.username}', 'Inactive')">Deactivate</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMember('${member.studentId || member.username}')">Delete</button>
            </td>
        </tr>
    `).join('');
}
