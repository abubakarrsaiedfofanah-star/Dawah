// Runtime slice from daawah.js: completeProfileSave.
function completeProfileSave(updatedProfile) {
    const { passportPhotoFile, removePhoto, ...storableProfile } = updatedProfile;
    currentUser = storableProfile;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('profileData', JSON.stringify(currentUser));

    allMembers = allMembers.map(member => {
        const sameMember = member.studentId === storableProfile.studentId ||
            member.username === storableProfile.username ||
            member.email === storableProfile.email ||
            member.dbStudentId === storableProfile.dbStudentId;
        return sameMember ? { ...member, ...storableProfile } : member;
    });
    localStorage.setItem('allMembers', JSON.stringify(allMembers));

    loadProfileData();
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) {
        nameDisplay.textContent = currentUser.name || currentUser.fullName || currentUser.username;
    }
    updateDashboardStats();
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
    showNotification('Profile updated successfully.', 'success');
}

// MEMBERSHIP
