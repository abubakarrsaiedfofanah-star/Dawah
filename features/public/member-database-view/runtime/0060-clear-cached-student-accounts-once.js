// Runtime slice from daawah.js: clearCachedStudentAccountsOnce.
function clearCachedStudentAccountsOnce() {
    if (window.SupabaseBackend?.enabled) {
        if (localStorage.getItem('DawaahSupabaseLocalMemberResetVersion') === ACCOUNT_CLEAR_VERSION) {
            return;
        }
        [
            'allMembers',
            'currentUser',
            'currentRole',
            'profileData',
            LOCAL_RESET_CODE_STORE
        ].forEach(key => localStorage.removeItem(key));
        allMembers = [];
        currentUser = null;
        currentRole = null;
        localStorage.setItem('DawaahSupabaseLocalMemberResetVersion', ACCOUNT_CLEAR_VERSION);
        localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
        return;
    }
    if (localStorage.getItem('localStudentClearVersion') === localStudentClearVersion) {
        return;
    }

    allMembers = allMembers.filter(member => (member.role || 'student') !== 'student');
    localStorage.setItem('allMembers', JSON.stringify(allMembers));

    const cachedUser = getStoredCurrentUser();
    if (cachedUser && (cachedUser.role || 'student') === 'student') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        currentUser = null;
        currentRole = null;
    }

    localStorage.setItem('localStudentClearVersion', localStudentClearVersion);
}
