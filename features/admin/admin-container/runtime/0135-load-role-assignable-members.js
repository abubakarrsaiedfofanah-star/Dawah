// Runtime slice from admin.js: loadRoleAssignableMembers.
function loadRoleAssignableMembers() {
    const select = document.getElementById('memberRoleUser');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Loading members...</option>';

    fetch(`${API_URL}?action=getRoleAssignableMembers`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load members');
        }
        renderRoleAssignableMembers(result.data || []);
    })
    .catch(error => {
        select.innerHTML = `<option value="" disabled selected>${escapeAdminText(error.message || 'Could not load members')}</option>`;
    });
}
