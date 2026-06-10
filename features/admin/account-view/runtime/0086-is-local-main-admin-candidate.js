// Runtime slice from admin.js: isLocalMainAdminCandidate.
function isLocalMainAdminCandidate(adminLike) {
    if (!adminLike) return false;
    const accounts = getLocalAdminAccounts();
    if (accounts.length <= 1) return true;
    return Number(adminLike.id) === getLocalMainAdminId();
}
