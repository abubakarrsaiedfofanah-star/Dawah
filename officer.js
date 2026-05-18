const OFFICER_ROLES = ['chairman', 'chairlady', 'secretary', 'treasurer', 'media', 'organizer', 'imam'];
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
    'School of Law and Shari’a': [
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
    document.getElementById('officerLoginForm')?.addEventListener('submit', handleOfficerLogin);
    document.getElementById('officerRegisterForm')?.addEventListener('submit', handleOfficerRegistration);
    document.getElementById('officerSchool')?.addEventListener('change', renderOfficerCourses);
    loadAcademicCatalog();
});

function showOfficerAlert(message, type = 'info') {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}

function clearOfficerAlert() {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.classList.add('d-none');
    alertBox.textContent = '';
}

function parseJsonResponse(response) {
    return response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error(text || 'Invalid server response');
        }
    });
}

function loadAcademicCatalog() {
    renderOfficerSchools();

    fetch('api.php?action=getAcademicCatalog')
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

function renderOfficerSchools() {
    const schoolSelect = document.getElementById('officerSchool');
    if (!schoolSelect) return;
    const schools = Object.keys(academicCatalog);
    schoolSelect.innerHTML = '<option value="" disabled selected>Select school</option>' + schools
        .map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`)
        .join('');
}

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

function getOfficerRegistrationData() {
    const fullName = document.getElementById('officerFullName').value.trim();
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    return {
        fullName,
        first_name: firstName || fullName,
        last_name: lastNameParts.join(' ') || '-',
        student_id: document.getElementById('officerId').value.trim(),
        email: document.getElementById('officerEmail').value.trim(),
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

function handleOfficerRegistration(event) {
    event.preventDefault();
    clearOfficerAlert();
    const data = getOfficerRegistrationData();
    const validationMessage = validateOfficerRegistration(data);
    if (validationMessage) {
        showOfficerAlert(validationMessage, 'warning');
        return;
    }

    const button = document.getElementById('officerRegisterButton');
    setButtonLoading(button, true, 'Submitting...');

    fetch('api.php?action=registerUser', {
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

    return fetch('api.php?action=registerStudent', {
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

function handleOfficerLogin(event) {
    event.preventDefault();
    clearOfficerAlert();
    const username = document.getElementById('officerLoginUsername').value.trim();
    const password = document.getElementById('officerLoginPassword').value;
    const button = document.getElementById('officerLoginButton');

    if (!username || !password) {
        showOfficerAlert('Please enter your email/ID and password.', 'warning');
        return;
    }

    setButtonLoading(button, true, 'Logging in...');

    fetch('api.php?action=loginUser', {
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

function hydrateOfficerDashboardUser(identifier, serverUser) {
    return fetch(`api.php?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`, {
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

function setButtonLoading(button, loading, label) {
    if (!button) return;
    button.disabled = loading;
    button.innerHTML = loading ? `<i class="fas fa-spinner fa-spin"></i> ${label}` : label;
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}
