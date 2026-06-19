// Assembled from feature runtime files. Edit features/**/runtime/*.js, then run npm run runtime:assemble.
// Runtime slice from officer.js: bootstrap.
const OFFICER_ROLES = ['chairlady', 'vice_chairlady_1', 'vice_chairlady_2', 'secretary', 'vice_secretary', 'treasurer', 'vice_treasurer', 'media', 'organizer', 'amir_director'];
const OFFICER_STATIC_HOSTS = [
    'localhost',
    '127.0.0.1',
    'github.io',
    'netlify.app',
    'vercel.app',
    'pages.dev',
    '66ghz.com',
    'www.66ghz.com'
];
const frontendOnly = location.protocol === 'file:' || OFFICER_STATIC_HOSTS.some(host =>
    location.hostname === host || location.hostname.endsWith(`.${host}`)
);
const blockStaticOfficerAccess = location.protocol === 'file:' || location.hostname === 'github.io' || location.hostname.endsWith('.github.io');
let officerCloudReadyPromise = Promise.resolve();
let officerResetEmail = '';
const OFFICER_RESET_CODE_STORE = 'dawaahPasswordResetCodes';
const OFFICER_RESET_CODE_TTL_MS = 15 * 60 * 1000;
const PORTAL_AUDIENCE_KEY = 'dawaahPortalAudience';
const OFFICER_LOCAL_API_BASES = ['http://localhost/dawaah/', 'http://127.0.0.1:8000/'];
const FALLBACK_ACADEMIC_CATALOG = {
    'School of Business & Technology': [
        'Bachelor of Business Management (BBM)',
        'Bachelor of Commerce (BCom)',
        'Bachelor of Business Information Technology',
        'Bachelor of Science in Computer Science',
        'Bachelor of Science in Information Technology',
        'Master of Business Administration (MBA)',
        'Diploma in ICT',
        'Diploma in Business Management',
        'Diploma in Business IT & Business Management',
        'Diploma in Human Resource Management',
        'Diploma in Supply Chain Management',
        'Diploma in Islamic Banking and Finance',
        'Certificate in ICT',
        'Certificate in Business Management',
        'Certificate in Human Resource Management',
        'Certificate in Supply Chain Management',
        'Certificate in Business Information Technology',
        'Electrical Engineering',
        'ICT',
        'CISCO Networking',
        'ICDL Courses'
    ],
    'School of Sharia & Islamic Studies': [
        'Bachelor of Arts in Islamic Studies',
        'Bachelor of Arts in Sharia',
        'Master of Arts in Islamic Studies',
        'Diploma in Arabic Language and Islamic Studies',
        'Diploma in Islamic Banking and Finance',
        'Certificate in Arabic Language and Islamic Studies'
    ],
    'School of Law and Shariâ€™a': [
        'Bachelor of Laws (LL.B) with Sharia & Law',
        'Diploma in Islamic Law and Legal Studies'
    ],
    'School of Education & Social Sciences': [
        'Bachelor of Education (B.Ed.)',
        'Bachelor of Education (Arts)',
        'Diploma in Early Childhood Education',
        'Clothing & Textile',
        'Business & Liberal Studies'
    ],
    'School of Nursing & Midwifery': [
        'Bachelor of Science in Nursing'
    ]
};
let academicCatalog = FALLBACK_ACADEMIC_CATALOG;

document.addEventListener('DOMContentLoaded', () => {
    officerCloudReadyPromise = loadOfficerSharedMembers();
    if (blockStaticOfficerAccess && !window.SupabaseBackend?.enabled) {
        blockOfficerStaticPreview();
        return;
    }
    document.getElementById('officerLoginForm')?.addEventListener('submit', handleOfficerLogin);
    document.getElementById('officerRegisterForm')?.addEventListener('submit', handleOfficerRegistration);
    document.getElementById('officerForgotPasswordForm')?.addEventListener('submit', handleOfficerForgotPassword);
    document.getElementById('officerResetPasswordForm')?.addEventListener('submit', handleOfficerResetPassword);
    document.getElementById('officerSchool')?.addEventListener('change', renderOfficerCourses);
    document.querySelectorAll('[data-password-toggle]').forEach(button => {
        button.addEventListener('click', () => toggleOfficerPassword(button.dataset.passwordToggle, button));
    });
    loadAcademicCatalog();
});

// Runtime slice from officer.js: blockOfficerStaticPreview.
function blockOfficerStaticPreview() {
    showOfficerAlert(
        'Official access is blocked on this GitHub/static preview link. Use the real hosted Supabase/Postgres link for officer registration, approval, login, and password reset.',
        'warning'
    );
    document.querySelectorAll('.nav-tabs, #officerLoginTab, #officerRegisterTab, #officerForgotTab').forEach(element => {
        element.classList.add('d-none');
    });
    document.querySelectorAll('form input, form select, form textarea, form button').forEach(control => {
        control.disabled = true;
    });
}

// Runtime slice from officer.js: showOfficerAlert.
function showOfficerAlert(message, type = 'info') {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}

// Runtime slice from officer.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Runtime slice from officer.js: clearOfficerAlert.
function clearOfficerAlert() {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.classList.add('d-none');
    alertBox.textContent = '';
}

// Runtime slice from officer.js: parseJsonResponse.
function parseJsonResponse(response) {
    return response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (error) {
            if (/src=["']\/aes\.js["']/i.test(text) && /document\.cookie=["']__test=/i.test(text)) {
                throw new Error('The free hosting security check interrupted this request. Please refresh the website once, wait for it to finish loading, then try again.');
            }
            throw new Error(text || 'Invalid server response');
        }
    });
}

// Runtime slice from officer.js: toggleOfficerPassword.
function toggleOfficerPassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input || !button) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.innerHTML = showing ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

// Runtime slice from officer.js: officerApiUrls.
function officerApiUrls(endpoint) {
    const cleanEndpoint = String(endpoint).replace(/^\/+/, '');
    if (location.protocol === 'file:') {
        return OFFICER_LOCAL_API_BASES.map(base => base + cleanEndpoint);
    }
    return [cleanEndpoint];
}

// Runtime slice from officer.js: fetchOfficerApi.
function fetchOfficerApi(endpoint, options = {}) {
    const urls = officerApiUrls(endpoint);
    let lastError = null;
    const tryNext = index => {
        if (index >= urls.length) {
            throw new Error(lastError?.message && lastError.message !== 'Failed to fetch' // Supabase: Changed from Supabase backend to generic.
                ? lastError.message
                : 'Could not reach the backend service. Please check your connection or try again later.');
        }
        return fetch(urls[index], options)
            .then(response => parseJsonResponse(response))
            .catch(error => {
                lastError = error;
                return tryNext(index + 1);
            });
    };
    return tryNext(0);
}

// Runtime slice from officer.js: readLocalMembers.
function readLocalMembers() {
    try {
        return JSON.parse(localStorage.getItem('allMembers') || '[]');
    } catch (error) {
        return [];
    }
}

// Runtime slice from officer.js: writeLocalMembers.
function writeLocalMembers(members) {
    localStorage.setItem('allMembers', JSON.stringify(members));
}

// Runtime slice from officer.js: readLocalResetCodes.
function readLocalResetCodes() {
    try {
        return JSON.parse(localStorage.getItem(OFFICER_RESET_CODE_STORE) || '{}');
    } catch (error) {
        return {};
    }
}

// Runtime slice from officer.js: writeLocalResetCodes.
function writeLocalResetCodes(codes) {
    localStorage.setItem(OFFICER_RESET_CODE_STORE, JSON.stringify(codes || {}));
}

// Runtime slice from officer.js: createLocalResetCode.
function createLocalResetCode(email) {
    const member = findLocalMember(email);
    if (!member) {
        throw new Error('No local account was found for this email.');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = readLocalResetCodes();
    codes[String(email).trim().toLowerCase()] = {
        code,
        expiresAt: Date.now() + OFFICER_RESET_CODE_TTL_MS
    };
    writeLocalResetCodes(codes);
    return { success: true, data: { mail_sent: false, dev_code: code } };
}

// Runtime slice from officer.js: resetLocalPasswordWithCode.
function resetLocalPasswordWithCode(email, code, password) {
    const lookup = String(email || '').trim().toLowerCase();
    const codes = readLocalResetCodes();
    const request = codes[lookup];
    if (!request || request.code !== code) {
        throw new Error('Invalid reset code. Request a new 6-digit code and try again.');
    }
    if (Date.now() > Number(request.expiresAt || 0)) {
        delete codes[lookup];
        writeLocalResetCodes(codes);
        throw new Error('Reset code expired. Request a new 6-digit code.');
    }
    const members = readLocalMembers();
    const updated = members.map(member =>
        String(member.email || '').trim().toLowerCase() === lookup
            ? { ...member, password, updated_at: new Date().toISOString() }
            : member
    );
    writeLocalMembers(updated);
    delete codes[lookup];
    writeLocalResetCodes(codes);
    return { success: true };
}

// Runtime slice from officer.js: memberIdentityKeys.
function memberIdentityKeys(member) {
    return [
        member?.uid,
        member?.studentId,
        member?.username,
        member?.email,
        member?.authEmail
    ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
}

// Runtime slice from officer.js: mergeMemberIntoList.
function mergeMemberIntoList(members, member) {
    const list = Array.isArray(members) ? [...members] : [];
    const identities = memberIdentityKeys(member);
    if (!identities.length) return list;
    const index = list.findIndex(item =>
        memberIdentityKeys(item).some(key => identities.includes(key))
    );
    if (index >= 0) {
        list[index] = { ...list[index], ...member };
    } else {
        list.push(member);
    }
    return list;
}

// Runtime slice from officer.js: loadOfficerSharedMembers.
async function loadOfficerSharedMembers() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    const member = await window.SupabaseBackend.loadMyMember().catch(() => null);
    if (member) {
        writeLocalMembers(mergeMemberIntoList(readLocalMembers(), member));
    }
}

// Runtime slice from officer.js: findLocalMember.
function findLocalMember(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return readLocalMembers().find(member =>
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup
    );
}

// Runtime slice from officer.js: registerOfficerLocally.
function registerOfficerLocally(data) {
    const members = readLocalMembers();
    if (findLocalMember(data.student_id) || findLocalMember(data.email)) {
        throw new Error('This Student ID or email is already registered. Please login or contact admin.');
    }
    const existingRoleHolder = members.find(member =>
        String(member.role || '').toLowerCase() === String(data.role).toLowerCase() &&
        !['rejected', 'suspended'].includes(String(member.status || '').toLowerCase())
    );
    if (existingRoleHolder) {
        throw new Error(`${data.role.charAt(0).toUpperCase() + data.role.slice(1)} role is already requested or assigned. Main admin must approve/reject or remove the existing holder first.`);
    }

    const member = {
        id: Date.now(),
        uid: window.SupabaseBackend?.currentUid?.() || '',
        authEmail: window.SupabaseBackend?.currentEmail?.() || data.email,
        username: data.student_id,
        fullName: data.fullName,
        studentId: data.student_id,
        password: data.password,
        role: data.role,
        status: 'Pending',
        school: data.school,
        course: data.course,
        yearOfStudy: data.year_of_study,
        semester: data.semester,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        created_at: new Date().toISOString()
    };
    members.push(member);
    writeLocalMembers(members);
    return member;
}

// Runtime slice from officer.js: loginOfficerLocally.
function loginOfficerLocally(username, password, options = {}) {
    const user = findLocalMember(username);
    if (!user) {
        throw new Error('No registered officer account found. Please register first.');
    }
    if (!options.authenticatedBySupabase && user.password !== password) {
        throw new Error('Incorrect password. Please try again.');
    }
    const role = String(user.role || '').toLowerCase();
    if (!OFFICER_ROLES.includes(role)) {
        throw new Error(role === 'student'
            ? 'Student accounts login from index.html.'
            : 'Admin and sub-admin accounts login from admin.html.');
    }
    if (String(user.status || '').toLowerCase() !== 'active') {
        throw new Error('This officer account is waiting for main admin approval.');
    }
    return {
        ...user,
        username: user.username || user.studentId || username,
        studentId: user.studentId || user.username || username,
        role
    };
}

// Runtime slice from officer.js: showOfficerForgotPassword.
function showOfficerForgotPassword() {
    document.getElementById('officerForgotTabBtn')?.click();
}

// Runtime slice from officer.js: showOfficerResetStep.
function showOfficerResetStep(email) {
    officerResetEmail = email;
    const resetForm = document.getElementById('officerResetPasswordForm');
    if (resetForm) resetForm.classList.remove('d-none');
    const resetCode = document.getElementById('officerResetCode');
    if (resetCode) resetCode.value = '';
    document.getElementById('officerResetCode')?.focus();
}

// Runtime slice from officer.js: requestOfficerResetCode.
function requestOfficerResetCode(email, button) {
    if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
        return window.SupabaseBackend.sendPasswordResetEmail(email)
            .then(result => {
                showOfficerAlert('Password reset email sent. Open your email link to set a new password.', 'success');
                document.getElementById('officerResetPasswordForm')?.classList.add('d-none');
                officerResetEmail = '';
                return { success: true, data: result };
            })
            .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
    }

    if (frontendOnly) {
        return Promise.resolve(createLocalResetCode(email))
            .then(result => {
                showOfficerAlert(`Local reset code created. Test code: ${result.data.dev_code}. It expires in 15 minutes.`, 'warning');
                showOfficerResetStep(email);
                return result;
            })
            .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
    }

    return fetchOfficerApi('supabase-required-endpoint?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not send reset code.');
        }
        const mailSent = result.data?.mail_sent !== false;
        const devCode = result.data?.dev_code ? ` Local test code: ${result.data.dev_code}` : '';
        showOfficerAlert(mailSent
            ? 'Reset code sent to your registered email.'
            : `Reset code was created, but email delivery is not configured on this server.${devCode}`,
            mailSent ? 'success' : 'warning'
        );
        showOfficerResetStep(email);
        return result;
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
}

// Runtime slice from officer.js: handleOfficerForgotPassword.
function handleOfficerForgotPassword(event) {
    event.preventDefault();
    clearOfficerAlert();
    const email = document.getElementById('officerForgotEmail')?.value.trim() || '';
    const button = document.getElementById('officerForgotButton');
    if (!email) {
        showOfficerAlert('Please enter the email you registered with.', 'warning');
        return;
    }

    setButtonLoading(button, true, 'Sending...');
    try {
        requestOfficerResetCode(email, button).catch(error => {
            showOfficerAlert(error.message || 'Could not send reset code.', 'danger');
            setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
        });
    } catch (error) {
        showOfficerAlert(error.message || 'Could not send reset code.', 'danger');
        setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
    }
}

// Runtime slice from officer.js: resendOfficerResetCode.
function resendOfficerResetCode() {
    const email = officerResetEmail || document.getElementById('officerForgotEmail')?.value.trim() || '';
    const button = document.getElementById('officerForgotButton');
    if (!email) {
        showOfficerAlert('Please enter your registered email first.', 'warning');
        return;
    }
    setButtonLoading(button, true, 'Sending...');
    try {
        requestOfficerResetCode(email, button).catch(error => {
            showOfficerAlert(error.message || 'Could not resend reset code.', 'danger');
            setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
        });
    } catch (error) {
        showOfficerAlert(error.message || 'Could not resend reset code.', 'danger');
        setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
    }
}

// Runtime slice from officer.js: handleOfficerResetPassword.
function handleOfficerResetPassword(event) {
    event.preventDefault();
    clearOfficerAlert();
    const email = officerResetEmail || document.getElementById('officerForgotEmail')?.value.trim() || '';
    const code = document.getElementById('officerResetCode')?.value.trim() || '';
    const password = document.getElementById('officerResetPassword')?.value || '';
    const confirmPassword = document.getElementById('officerResetConfirmPassword')?.value || '';
    const button = document.getElementById('officerResetButton');

    if (!email) {
        showOfficerAlert('Please request a reset code with your registered email first.', 'warning');
        return;
    }
    if (!/^\d{6}$/.test(code)) {
        showOfficerAlert('Enter the 6-digit code sent to your email.', 'warning');
        return;
    }
    if (password !== confirmPassword) {
        showOfficerAlert('Passwords do not match.', 'warning');
        return;
    }
    if (password.length < 6) {
        showOfficerAlert('Password must be at least 6 characters.', 'warning');
        return;
    }
    setButtonLoading(button, true, 'Resetting...');
    const resetRequest = frontendOnly
        ? Promise.resolve(resetLocalPasswordWithCode(email, code, password))
        : fetchOfficerApi('supabase-required-endpoint?action=resetPasswordWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password })
    });

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not reset password.');
        }
        showOfficerAlert('Password reset successfully. Login with your new password.', 'success');
        document.getElementById('officerForgotPasswordForm')?.reset();
        document.getElementById('officerResetPasswordForm')?.reset();
        document.getElementById('officerResetPasswordForm')?.classList.add('d-none');
        officerResetEmail = '';
        document.getElementById('officerLoginTabBtn')?.click();
    })
    .catch(error => showOfficerAlert(error.message || 'Could not reset password.', 'danger'))
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-key"></i> Set New Password'));
}

// Runtime slice from officer.js: loadAcademicCatalog.
function loadAcademicCatalog() {
    renderOfficerSchools();
    if (frontendOnly || !window.DAWAAH_LEGACY_PHP_BASE_URL) {
        academicCatalog = FALLBACK_ACADEMIC_CATALOG;
        renderOfficerSchools();
        return;
    }

    fetch('supabase-required-endpoint?action=getAcademicCatalog')
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Could not load schools');
        }
        academicCatalog = result.data;
        renderOfficerSchools();
    })
    .catch(error => {
        console.warn('Using fallback academic catalog:', error);
        academicCatalog = FALLBACK_ACADEMIC_CATALOG;
        renderOfficerSchools();
    });
}

// Runtime slice from officer.js: renderOfficerSchools.
function renderOfficerSchools() {
    const schoolSelect = document.getElementById('officerSchool');
    if (!schoolSelect) return;
    const schools = Object.keys(academicCatalog);
    schoolSelect.innerHTML = '<option value="" disabled selected>Select school</option>' + schools
        .map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`)
        .join('');
}

// Runtime slice from officer.js: renderOfficerCourses.
function renderOfficerCourses() {
    const school = document.getElementById('officerSchool')?.value || '';
    const courseSelect = document.getElementById('officerCourse');
    if (!courseSelect) return;
    const courses = academicCatalog[school] || [];
    courseSelect.disabled = courses.length === 0;
    courseSelect.innerHTML = courses.length
        ? '<option value="" disabled selected>Select course</option>' + courses.map(course => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join('')
        : '<option value="" disabled selected>Select school first</option>';
}

// Runtime slice from officer.js: getOfficerRegistrationData.
function getOfficerRegistrationData() {
    const fullName = document.getElementById('officerFullName').value.trim();
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    return {
        fullName,
        first_name: firstName || fullName,
        last_name: lastNameParts.join(' ') || '-',
        student_id: document.getElementById('officerId').value.trim(),
        email: document.getElementById('officerEmail').value.trim().toLowerCase(),
        phone: document.getElementById('officerPhone').value.trim(),
        role: document.getElementById('officerRole').value,
        gender: document.getElementById('officerGender').value,
        school: document.getElementById('officerSchool').value,
        course: document.getElementById('officerCourse').value,
        year_of_study: document.getElementById('officerYear').value,
        semester: document.getElementById('officerSemester').value,
        password: document.getElementById('officerPassword').value,
        confirmPassword: document.getElementById('officerConfirmPassword').value,
        nationality: '',
        home_address: '',
        emergency_contact: '',
        emergency_contact_phone: '',
        local_guardian: '',
        local_guardian_phone: '',
        degree_type: 'degree'
    };
}

// Runtime slice from officer.js: validateOfficerRegistration.
function validateOfficerRegistration(data) {
    if (!OFFICER_ROLES.includes(data.role)) {
        return 'Please select a valid officer role.';
    }
    if (data.password !== data.confirmPassword) {
        return 'Passwords do not match.';
    }
    if (data.password.length < 6) {
        return 'Password must be at least 6 characters.';
    }
    if (!data.fullName || !data.student_id || !data.email || !data.phone || !data.school || !data.course || !data.year_of_study || !data.semester) {
        return 'Please fill in all required fields.';
    }
    return '';
}

// Runtime slice from officer.js: handleOfficerRegistration.
async function handleOfficerRegistration(event) {
    event.preventDefault();
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'officer');
    clearOfficerAlert();
    await officerCloudReadyPromise;
    const data = getOfficerRegistrationData();
    const validationMessage = validateOfficerRegistration(data);
    if (validationMessage) {
        showOfficerAlert(validationMessage, 'warning');
        return;
    }

    const button = document.getElementById('officerRegisterButton');
    setButtonLoading(button, true, 'Submitting...');

    if (frontendOnly) {
        try {
            if (window.SupabaseBackend?.enabled) {
                await window.SupabaseBackend.registerEmail(data.email, data.password);
                await window.SupabaseBackend.ensureRealtimeAuth?.(data.email, data.password).catch(error => {
                    console.warn('Realtime auth unavailable after officer registration:', error);
                });
                await loadOfficerSharedMembers();
            }
            const member = registerOfficerLocally(data);
            if (window.SupabaseBackend?.enabled) {
                await window.SupabaseBackend.saveMember(member);
            }
            showOfficerAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
            document.getElementById('officerRegisterForm').reset();
            document.getElementById('officerCourse').disabled = true;
            document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
            document.getElementById('officerLoginTabBtn')?.click();
        } catch (error) {
            showOfficerAlert(error.message || 'Officer registration failed.', 'danger');
        } finally {
            setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration');
        }
        return;
    }

    fetch('supabase-required-endpoint?action=registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: data.student_id,
            email: data.email,
            password: data.password,
            role: data.role
        })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data?.user_id) {
            throw new Error(result.message || 'Could not create officer account');
        }
        return registerOfficerStudentRecord(result.data.user_id, data);
    })
    .then(() => {
        showOfficerAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
        document.getElementById('officerRegisterForm').reset();
        document.getElementById('officerCourse').disabled = true;
        document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
        document.getElementById('officerLoginTabBtn')?.click();
    })
    .catch(error => {
        showOfficerAlert(error.message || 'Officer registration failed.', 'danger');
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration'));
}

// Runtime slice from officer.js: registerOfficerStudentRecord.
function registerOfficerStudentRecord(userId, data) {
    const formData = new FormData();
    Object.entries({
        user_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: data.student_id,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        nationality: data.nationality,
        school: data.school,
        course: data.course,
        year_of_study: data.year_of_study,
        semester: data.semester,
        degree_type: data.degree_type,
        home_address: data.home_address,
        emergency_contact: data.emergency_contact,
        emergency_contact_phone: data.emergency_contact_phone,
        local_guardian: data.local_guardian,
        local_guardian_phone: data.local_guardian_phone
    }).forEach(([key, value]) => formData.append(key, value));

    return fetch('supabase-required-endpoint?action=registerStudent', {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Officer profile could not be saved');
        }
        return result;
    });
}

// Runtime slice from officer.js: handleOfficerLogin.
async function handleOfficerLogin(event) {
    event.preventDefault();
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'officer');
    clearOfficerAlert();
    const username = document.getElementById('officerLoginUsername').value.trim().toLowerCase();
    const password = document.getElementById('officerLoginPassword').value;
    const button = document.getElementById('officerLoginButton');

    if (!username || !password) {
        showOfficerAlert('Please enter your email and password.', 'warning');
        return;
    }
    if (!isEmailLoginIdentifier(username)) {
        showOfficerAlert('Please login with your registered email address only.', 'warning');
        return;
    }

    setButtonLoading(button, true, 'Logging in...');

    if (frontendOnly) {
        try {
            if (window.SupabaseBackend?.enabled) {
                await window.SupabaseBackend.loginEmail(username, password);
                await window.SupabaseBackend.ensureRealtimeAuth?.(username, password).catch(error => {
                    console.warn('Realtime auth unavailable for officer dashboard:', error);
                });
                await loadOfficerSharedMembers();
            } else {
                await officerCloudReadyPromise;
            }
            const user = loginOfficerLocally(username, password, { authenticatedBySupabase: Boolean(window.SupabaseBackend?.enabled) });
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('currentRole', user.role);
            localStorage.setItem('DawaahAccountClearVersion', '20260526-Supabase-reset-v1');
            window.location.href = 'index.html?dashboard=1';
        } catch (error) {
            showOfficerAlert(error.message || 'Officer login failed.', 'danger');
        } finally {
            setButtonLoading(button, false, '<i class="fas fa-right-to-bracket"></i> Login as Officer');
        }
        return;
    }

    fetch('supabase-required-endpoint?action=loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Invalid officer login.');
        }
        const user = result.data;
        const role = String(user.role || '').toLowerCase();
        if (!OFFICER_ROLES.includes(role)) {
            throw new Error(role === 'student'
                ? 'Student accounts login from index.html.'
                : 'Admin and sub-admin accounts login from admin.html.');
        }
        if (String(user.status || '').toLowerCase() !== 'active') {
            throw new Error('This officer account is waiting for main admin approval.');
        }
        return hydrateOfficerDashboardUser(username, user);
    })
    .then(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        window.location.href = 'index.html';
    })
    .catch(error => {
        showOfficerAlert(error.message || 'Officer login failed.', 'danger');
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-right-to-bracket"></i> Login as Officer'));
}

// Runtime slice from officer.js: hydrateOfficerDashboardUser.
function hydrateOfficerDashboardUser(identifier, serverUser) {
    return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`, {
        credentials: 'same-origin'
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        const student = result.success ? result.data : {};
        return {
            dbUserId: serverUser.id || student.user_id,
            dbStudentId: student.id,
            username: serverUser.username || identifier,
            email: serverUser.email || student.email,
            role: serverUser.role,
            status: serverUser.status,
            csrf_token: serverUser.csrf_token || '',
            fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || serverUser.username,
            studentId: student.student_id || serverUser.username,
            phone: student.phone || '',
            gender: student.gender || '',
            school: student.school || '',
            course: student.course || '',
            yearOfStudy: student.year_of_study || '',
            semester: student.semester || '',
            passport_photo: student.passport_photo || ''
        };
    });
}

// Runtime slice from officer.js: setButtonLoading.
function setButtonLoading(button, loading, label) {
    if (!button) return;
    button.disabled = loading;
    button.innerHTML = loading ? `<i class="fas fa-spinner fa-spin"></i> ${label}` : label;
}

// Runtime slice from officer.js: escapeHtml.
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}
