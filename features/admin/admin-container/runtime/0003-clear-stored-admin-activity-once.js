// Runtime slice from admin.js: clearStoredAdminActivityOnce.
function clearStoredAdminActivityOnce() {
    if (localStorage.getItem(LOCAL_ADMIN_ACTIVITY_CLEAR_KEY) === '1') return;
    localStorage.removeItem('adminActivityLogs');
    localStorage.setItem(LOCAL_ADMIN_ACTIVITY_CLEAR_KEY, '1');
}

clearStoredAdminActivityOnce();
