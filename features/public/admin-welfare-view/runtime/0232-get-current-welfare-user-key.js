// Runtime slice from daawah.js: getCurrentWelfareUserKey.
function getCurrentWelfareUserKey() {
    return currentUser?.username || currentUser?.studentId || currentUser?.email || currentUser?.fullName || currentUser?.name || '';
}
