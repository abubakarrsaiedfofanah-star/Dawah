// Runtime slice from daawah.js: getStoredCurrentUser.
function getStoredCurrentUser() {
    return safeJsonParse(localStorage.getItem('currentUser'), null, 'currentUser');
}
