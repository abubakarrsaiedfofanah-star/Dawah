// Runtime slice from daawah.js: saveSharedMemberStore.
function saveSharedMemberStore(member = null, options = {}) {
    if (!window.DawaahCloud?.enabled) return Promise.resolve();
    const profile = member || currentUser || allMembers[allMembers.length - 1];
    if (!profile) return Promise.resolve();
    return window.DawaahCloud.saveMember(profile).then(savedProfile => {
        if (savedProfile) {
            allMembers = mergeMemberIntoList(allMembers, savedProfile);
            localStorage.setItem('allMembers', JSON.stringify(allMembers));
        }
        return savedProfile;
    }).catch(error => {
        console.error('Firestore member sync failed:', error);
        if (options.requireCloud) throw error;
        showNotification?.('Saved on this device, but backend member sync failed. Please try again online.', 'warning');
        return null;
    });
}
