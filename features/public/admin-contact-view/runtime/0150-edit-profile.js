// Runtime slice from daawah.js: editProfile.
function editProfile() {
    const profileData = currentUser || {};
    document.getElementById('editFullName').value = profileData.fullName || profileData.name || '';
    document.getElementById('editStudentId').value = profileData.studentId || profileData.username || '';
    document.getElementById('editEmail').value = profileData.email || '';
    document.getElementById('editPhone').value = profileData.phone || '';
    document.getElementById('editSchool').value = profileData.school || '';
    renderCourseOptions('editCourse', profileData.school || '', profileData.course || '');
    document.getElementById('editYearOfStudy').value = profileData.yearOfStudy || '';
    updateSemesterAvailability('editYearOfStudy', 'editSemester');
    document.getElementById('editSemester').value = profileData.semester || '';
    document.getElementById('editGender').value = profileData.gender || 'male';
    document.getElementById('editNationality').value = profileData.nationality || '';
    document.getElementById('editEmergencyContact').value = profileData.emergencyContact || '';
    document.getElementById('editLocalGuardian').value = profileData.localGuardian || '';
    document.getElementById('editHomeAddress').value = profileData.homeAddress || '';
    const editPhotoInput = document.getElementById('editPassportPhoto');
    if (editPhotoInput) {
        editPhotoInput.value = '';
    }
    const removePhotoInput = document.getElementById('removeProfilePhoto');
    if (removePhotoInput) {
        removePhotoInput.checked = false;
    }

    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
}
