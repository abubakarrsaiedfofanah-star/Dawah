// Runtime slice from daawah.js: saveProfileChanges.
function saveProfileChanges() {
    const fullName = document.getElementById('editFullName').value.trim();
    const studentId = document.getElementById('editStudentId').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const school = document.getElementById('editSchool').value;
    const course = document.getElementById('editCourse').value;
    const yearOfStudy = document.getElementById('editYearOfStudy').value;
    const semester = document.getElementById('editSemester').value;
    const editPhotoFile = document.getElementById('editPassportPhoto')?.files?.[0] || null;
    const removePhoto = document.getElementById('removeProfilePhoto')?.checked || false;

    if (!fullName || !studentId || !email || !phone || !school || !course || !yearOfStudy || !semester) {
        alert('Please fill in full name, student ID, email, phone, school, course, year of study, and semester.');
        return;
    }

    const updatedProfile = {
        ...currentUser,
        name: fullName,
        fullName: fullName,
        studentId: studentId,
        username: currentUser?.username || studentId,
        email: email,
        phone: phone,
        school: school,
        course: course,
        yearOfStudy: yearOfStudy,
        semester: semester,
        gender: document.getElementById('editGender').value,
        nationality: document.getElementById('editNationality').value.trim(),
        emergencyContact: document.getElementById('editEmergencyContact').value.trim(),
        localGuardian: document.getElementById('editLocalGuardian').value.trim(),
        homeAddress: document.getElementById('editHomeAddress').value.trim(),
        passportPhotoFile: editPhotoFile,
        removePhoto: removePhoto
    };

    const saveUpdatedProfile = () => {
        if (!frontendOnly) {
            saveProfileToDatabase(updatedProfile)
                .then(savedProfile => completeProfileSave({
                    ...updatedProfile,
                    ...savedProfile,
                    passportPhotoData: savedProfile.passport_photo || updatedProfile.removePhoto ? '' : updatedProfile.passportPhotoData,
                    passport_photo: updatedProfile.removePhoto ? '' : (savedProfile.passport_photo || updatedProfile.passport_photo || '')
                }))
                .catch(error => {
                    console.error('Profile update error:', error);
                    alert(error.message || 'Profile could not be saved to the database.');
                });
            return;
        }

        completeProfileSave(updatedProfile);
    };

    if (editPhotoFile) {
        readImageAsDataUrl(editPhotoFile)
            .then(photoData => {
                updatedProfile.passportPhoto = editPhotoFile.name;
                updatedProfile.passportPhotoData = photoData;
                updatedProfile.removePhoto = false;
                saveUpdatedProfile();
            })
            .catch(() => alert('Could not read the selected profile photo. Please choose another image.'));
        return;
    }

    if (removePhoto) {
        updatedProfile.passportPhoto = '';
        updatedProfile.passportPhotoData = '';
        updatedProfile.passport_photo = '';
    }

    saveUpdatedProfile();
}
