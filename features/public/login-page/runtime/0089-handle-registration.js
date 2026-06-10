// Runtime slice from daawah.js: handleRegistration.
async function handleRegistration(e) {
    e.preventDefault();
    await cloudStoresReadyPromise;

    const fullName = document.getElementById('fullName').value.trim();
    const studentId = normalizeStudentId(document.getElementById('studentId').value);
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const role = 'student';

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (!isValidStudentId(studentId)) {
        alert('Enter a valid Student ID like BSCS/2025/53736.');
        return;
    }

    const passwordError = getPasswordRequirementError(password);
    if (passwordError) {
        alert(passwordError);
        return;
    }

    if (getRegisteredUser(studentId) || getRegisteredUser(email)) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, reason: 'registered user match' });
        alert('A user with this Student ID or email is already registered. Please login or use forgot password.');
        return;
    }

    if (allMembers.some(member => normalizeStudentId(member.studentId || member.username) === studentId || String(member.email || '').toLowerCase() === email || (phone && String(member.phone || '').trim() === phone))) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, phone, reason: 'student/email/phone match' });
        alert('This Student ID, email, or phone number is already registered. Please login or contact admin.');
        return;
    }

    if (frontendOnly && allMembers.some(member => member.password && member.password === password)) {
        alert('Please choose a different password. Each student must use a unique password.');
        return;
    }

    const existingRoleHolder = getExistingRoleHolder(role);
    if (existingRoleHolder) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} role is already requested or assigned. Main admin must approve/reject or remove the existing holder first.`);
        return;
    }

    const passportPhotoInput = document.getElementById('passportPhoto');
    const passportPhotoFile = passportPhotoInput?.files?.[0];
    if (passportPhotoFile && !validateUploadFile(passportPhotoFile, 'profilePhoto')) {
        return;
    }

    const newUser = {
        username: studentId,
        fullName: fullName,
        studentId: studentId,
        role: role,
        school: document.getElementById('school').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        semester: document.getElementById('semester').value,
        gender: document.getElementById('gender').value,
        phone: phone,
        email: email,
        nationality: document.getElementById('nationality').value,
        homeAddress: document.getElementById('homeAddress').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        localGuardian: document.getElementById('localGuardian').value,
        passportPhoto: passportPhotoFile ? passportPhotoFile.name : '',
        passportPhotoData: '',
        passportPhotoFile: passportPhotoFile || null
    };

    if (passportPhotoFile) {
        readImageAsDataUrl(passportPhotoFile)
            .then(photoData => {
                newUser.passportPhotoData = photoData;
                continueRegistration(newUser, fullName, password);
            })
            .catch(() => {
                alert('Could not read the selected passport photo. Please choose another image.');
            });
        return;
    }

    continueRegistration(newUser, fullName, password);
}
