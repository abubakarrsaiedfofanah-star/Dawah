// Runtime slice from admin.js: renderRoleAssignableMembers.
function renderRoleAssignableMembers(members) {
    const select = document.getElementById('memberRoleUser');
    const passwordSelect = document.getElementById('memberPasswordUser');
    if (!select && !passwordSelect) return;
    if (!members.length) {
        if (select) select.innerHTML = '<option value="" disabled selected>No registered members found</option>';
        if (passwordSelect) passwordSelect.innerHTML = '<option value="" disabled selected>No registered members found</option>';
        return;
    }

    const memberOptions = '<option value="" disabled selected>Select member</option>' + members.map(member => {
        const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username || member.student_id || 'Member';
        const role = formatAdminRoleName(member.role || 'student');
        const status = member.status || 'active';
        return `<option value="${escapeAdminText(member.id)}" data-email="${escapeAdminText(member.email || '')}">${escapeAdminText(name)} - ${escapeAdminText(role)} (${escapeAdminText(status)})</option>`;
    }).join('');
    if (select) select.innerHTML = memberOptions;
    if (passwordSelect) passwordSelect.innerHTML = memberOptions;
}
