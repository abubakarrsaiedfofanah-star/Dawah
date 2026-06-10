// Runtime slice from daawah.js: configureRoleMenus.
function configureRoleMenus() {
    const roleAdminMenu = document.getElementById('roleAdminMenu');
    const roleToolLinks = document.querySelectorAll('.role-tool-link');
    let visibleRoleTools = 0;

    roleToolLinks.forEach(link => {
        const permission = link.dataset.permission;
        const canUse = permission && hasPermission(permission);
        link.style.display = canUse ? '' : 'none';
        if (canUse) {
            visibleRoleTools++;
        }
    });

    if (roleAdminMenu) {
        roleAdminMenu.style.display = visibleRoleTools > 0 ? '' : 'none';
    }
}
