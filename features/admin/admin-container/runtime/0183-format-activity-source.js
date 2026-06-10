// Runtime slice from admin.js: formatActivitySource.
function formatActivitySource(source) {
    if (source === 'member_dashboard') return 'Role dashboard';
    if (source === 'admin_panel') return 'Admin panel';
    return source || 'System';
}
