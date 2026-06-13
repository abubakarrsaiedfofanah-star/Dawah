// Runtime slice from admin.js: saveRolePermissionEditor.
function saveRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || '';
    if (!role || !currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can edit role permissions.', 'warning');
        return;
    }
    const permissions = Array.from(document.querySelectorAll('.role-permission-checkbox:checked')).map(input => input.value);
    const next = getRolePermissionOverrides().filter(item => item.role !== role);
    next.push({ role, permissions, updatedAt: new Date().toISOString(), updatedBy: currentAdmin?.username || currentAdmin?.email || '' });
    writeStore(ROLE_PERMISSION_OVERRIDES_KEY, next);
    logLocalAdminActivity('updateRolePermissions', { role, permissions });
    showNotification('Role permissions saved.', 'success');
}
