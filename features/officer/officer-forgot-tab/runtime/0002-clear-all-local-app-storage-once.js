// Runtime slice from officer.js: clearAllLocalAppStorageOnce.
function clearAllLocalAppStorageOnce() {
    if (localStorage.getItem('DawaahFullLocalStorageResetVersion') === FULL_LOCAL_STORAGE_RESET_VERSION) return;
    [
        'currentOfficerUser',
        'officerUser',
        'officerSession',
        'currentAdminUser',
        'DawaahAdminSession'
    ].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.setItem('DawaahFullLocalStorageResetVersion', FULL_LOCAL_STORAGE_RESET_VERSION);
}

clearAllLocalAppStorageOnce();

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
