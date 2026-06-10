// Runtime slice from daawah.js: clearCachedStudentAccountsOnce.
function clearCachedStudentAccountsOnce() {
    if (window.DawaahCloud?.enabled) return;
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
