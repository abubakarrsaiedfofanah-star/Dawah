// Runtime slice from daawah.js: authQuery.
function authQuery() {
    const params = new URLSearchParams({
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    });
    return params.toString();
}
