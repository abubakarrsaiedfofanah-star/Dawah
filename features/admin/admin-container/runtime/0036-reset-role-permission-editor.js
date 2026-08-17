// Runtime slice from admin.js: resetRolePermissionEditor.
function resetRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || '';
    if (!role || !currentAdmin?.isMainAdmin) return;
    const next = getRolePermissionOverrides().filter(item => item.role !== role);
    writeStore(ROLE_PERMISSION_OVERRIDES_KEY, next);
    renderRolePermissionEditor();
    logLocalAdminActivity('resetRolePermissions', { role });
    showNotification('Role permissions reset to default.', 'success');
}
