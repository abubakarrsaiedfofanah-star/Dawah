// Runtime slice from daawah.js: getUserCsrfToken.
function getUserCsrfToken() {
    return currentUser?.csrf_token || getStoredCurrentUser()?.csrf_token || '';
}
