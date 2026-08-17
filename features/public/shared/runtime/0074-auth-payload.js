// Runtime slice from daawah.js: authPayload.
function authPayload(extra = {}) {
    return {
        ...extra,
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    };
}
