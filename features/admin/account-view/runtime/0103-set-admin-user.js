// Runtime slice from admin.js: setAdminUser.
function setAdminUser(user) {
    const storedAdmin = useStaticAdminApi ? findLocalAdminAccount(user) : null;
    const resolvedUser = storedAdmin ? publicAdminAccount(storedAdmin) : user;
    const inferredMainAdmin = Boolean(resolvedUser.isMainAdmin) ||
        (useStaticAdminApi && isLocalMainAdminCandidate(resolvedUser));
    currentAdmin = {
        id: resolvedUser.id,
        username: resolvedUser.username,
        email: resolvedUser.email || '',
        fullName: resolvedUser.fullName || resolvedUser.full_name || resolvedUser.username,
        role: resolvedUser.role,
        profile_photo: resolvedUser.profile_photo || '',
        csrf_token: resolvedUser.csrf_token || '',
        isMainAdmin: inferredMainAdmin
    };
    sessionStorage.setItem('currentAdminUser', JSON.stringify(currentAdmin));
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'admin');
    if (currentAdmin.isMainAdmin) {
        closePublicAdminPortal();
    }
    document.getElementById('adminName').textContent = currentAdmin.fullName || currentAdmin.username;
    updateAdminPhotoUi();
    updateAdminAccessUi();
}
