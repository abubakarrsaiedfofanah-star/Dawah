// Runtime slice from admin.js: renderRolePermissionEditor.
function renderRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || 'chairlady';
    const container = document.getElementById('rolePermissionEditorList');
    if (!container) return;
    const override = getRolePermissionOverrides().find(item => item.role === role);
    const activePermissions = new Set(override?.permissions || defaultPermissionsForRole(role));
    container.innerHTML = EDITABLE_ROLE_PERMISSIONS.map(permission => `
        <div class="col-md-4">
            <label class="border rounded p-2 w-100 bg-white text-dark">
                <input class="form-check-input me-1 role-permission-checkbox" type="checkbox" value="${escapeAdminText(permission)}" ${activePermissions.has(permission) ? 'checked' : ''}>
                ${escapeAdminText(permission.replaceAll('_', ' '))}
            </label>
        </div>
    `).join('');
}
