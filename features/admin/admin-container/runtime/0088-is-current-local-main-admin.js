// Runtime slice from admin.js: isCurrentLocalMainAdmin.
function isCurrentLocalMainAdmin() {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    return isLocalMainAdminCandidate(sessionAdmin);
}
