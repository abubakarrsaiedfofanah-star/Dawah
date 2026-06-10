// Runtime slice from daawah.js: loadProfileData.
function loadProfileData() {
    const storedProfile = readStoredObject('profileData', {});
    const profileData = currentUser || storedProfile || {};
    const profilePhoto = getMemberPhoto(profileData);
    const profilePhotoImage = document.getElementById('profilePhotoImage');
    const profilePhotoIcon = document.getElementById('profilePhotoIcon');

    if (profilePhoto && profilePhotoImage) {
        profilePhotoImage.src = profilePhoto;
        profilePhotoImage.classList.remove('d-none');
        profilePhotoIcon?.classList.add('d-none');
    } else if (profilePhotoImage) {
        profilePhotoImage.src = '';
        profilePhotoImage.classList.add('d-none');
        profilePhotoIcon?.classList.remove('d-none');
    }

    document.getElementById('profileName').textContent = profileData.fullName || profileData.name || 'Student Name';
    document.getElementById('profileFullName').textContent = profileData.fullName || profileData.name || '-';
    document.getElementById('profileStudentId').textContent = profileData.studentId || profileData.username || '-';
    document.getElementById('profileStudentIdDetail').textContent = profileData.studentId || profileData.username || '-';
    document.getElementById('profileSchool').textContent = profileData.school || '-';
    document.getElementById('profileDepartment').textContent = profileData.course || '-';
    document.getElementById('profileYear').textContent = profileData.yearOfStudy || '-';
    document.getElementById('profileSemester').textContent = profileData.semester || '-';
    document.getElementById('profileGender').textContent = profileData.gender || '-';
    document.getElementById('profileEmail').textContent = profileData.email || '-';
    document.getElementById('profilePhone').textContent = profileData.phone || '-';
    document.getElementById('profileAddress').textContent = profileData.homeAddress || '-';
    document.getElementById('profileNationality').textContent = profileData.nationality || '-';
    document.getElementById('profileEmergencyContact').textContent = profileData.emergencyContact || '-';
    document.getElementById('profileLocalGuardian').textContent = profileData.localGuardian || '-';
}
