// Runtime slice from daawah.js: handleRegistration.
function showRegistrationNotice(message, type = 'danger') {
    const notice = document.getElementById('registrationNotice');
    if (!notice) {
        alert(message);
        return;
    }
    notice.className = `alert alert-${type}`;
    notice.textContent = message;
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleRegistration(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const studentId = normalizeStudentId(document.getElementById('studentId').value);
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const role = 'student';

    if (password !== confirmPassword) {
        showRegistrationNotice('Passwords do not match.');
        return;
    }

    if (!isValidStudentId(studentId)) {
        showRegistrationNotice('Enter a valid Student ID like BSCS/2025/53736.');
        return;
    }

    const passwordError = getPasswordRequirementError(password);
    if (passwordError) {
        showRegistrationNotice(passwordError);
        return;
    }

    const supabaseRegistration = Boolean(frontendOnly && window.SupabaseBackend?.enabled);

    if (frontendOnly && !supabaseRegistration && location.protocol !== 'file:'
        && !['localhost', '127.0.0.1'].includes(location.hostname)) {
        showRegistrationNotice('Secure registration is unavailable right now. Please try again later or contact the main admin.');
        return;
    }

    if (!supabaseRegistration && (getRegisteredUser(studentId) || getRegisteredUser(email))) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, reason: 'registered user match' });
        showRegistrationNotice('A user with this Student ID or email is already registered. Please login or use forgot password.');
        return;
    }

    if (!supabaseRegistration && allMembers.some(member => normalizeStudentId(member.studentId || member.username) === studentId || String(member.email || '').toLowerCase() === email || (phone && String(member.phone || '').trim() === phone))) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, phone, reason: 'student/email/phone match' });
        showRegistrationNotice('This Student ID, email, or phone number is already registered. Please login or contact admin.');
        return;
    }

    const existingRoleHolder = getExistingRoleHolder(role);
    if (existingRoleHolder) {
        showRegistrationNotice(`${role.charAt(0).toUpperCase() + role.slice(1)} role is already requested or assigned. Contact the main admin.`);
        return;
    }

    const passportPhotoInput = document.getElementById('passportPhoto');
    const passportPhotoFile = passportPhotoInput?.files?.[0];
    if (passportPhotoFile && !validateUploadFile(passportPhotoFile, 'profilePhoto')) {
        return;
    }

    const notice = document.getElementById('registrationNotice');
    if (notice) { notice.className = 'alert d-none'; notice.textContent = ''; }

    const newUser = {
        username: studentId,
        fullName: fullName,
        studentId: studentId,
        role: role,
        school: document.getElementById('school').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        semester: document.getElementById('semester').value,
        gender: document.getElementById('gender')?.value || '',
        phone: phone,
        email: email,
        nationality: document.getElementById('nationality')?.value || '',
        homeAddress: document.getElementById('homeAddress')?.value || '',
        emergencyContact: document.getElementById('emergencyContact')?.value || '',
        localGuardian: document.getElementById('localGuardian')?.value || '',
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
                showRegistrationNotice('Could not read the selected passport photo. Please choose another image.');
            });
        return;
    }

    continueRegistration(newUser, fullName, password);
}
