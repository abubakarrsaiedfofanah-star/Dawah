// Runtime slice from daawah.js: updateStoredMembershipCardState.
function updateStoredMembershipCardState(patch = {}) {
    if (!currentUser) return;
    currentUser = {
        ...currentUser,
        ...patch,
        membershipCardPaymentStatus: getMembershipCardPaymentStatus(),
        membershipCardPaymentUpdatedAt: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('profileData', JSON.stringify(currentUser));
    saveSharedMemberStore(currentUser);
}
