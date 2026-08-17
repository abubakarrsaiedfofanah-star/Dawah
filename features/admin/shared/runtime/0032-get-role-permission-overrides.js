// Runtime slice from admin.js: getRolePermissionOverrides.
function getRolePermissionOverrides() {
    const stored = readStore(ROLE_PERMISSION_OVERRIDES_KEY);
    return Array.isArray(stored) ? stored : [];
}
