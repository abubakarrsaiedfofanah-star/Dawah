// Runtime slice from daawah.js: getCurrentStudentId.
function getCurrentStudentId() {
    if (currentUser?.dbStudentId) {
        return Promise.resolve(currentUser.dbStudentId);
    }

    const identifier = currentUser?.studentId || currentUser?.email || currentUser?.username;
    if (!identifier) {
        return Promise.reject(new Error('Student record is missing. Please register/login again.'));
    }

    return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.id) {
                return ensureCurrentUserStudentRecord();
            }
            currentUser.dbStudentId = result.data.id;
            currentUser.dbUserId = result.data.user_id;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return result.data.id;
        });
}
