// Runtime slice from daawah.js: renderProfileCompletion.
function renderProfileCompletion() {
    const fields = ['fullName', 'studentId', 'email', 'phone', 'school', 'course', 'yearOfStudy', 'semester', 'emergencyContact', 'localGuardian'];
    const completed = fields.filter(field => currentUser?.[field]).length;
    const percent = Math.round((completed / fields.length) * 100);
    const value = document.getElementById('profileCompletionValue');
    const text = document.getElementById('profileCompletionText');
    const ring = document.querySelector('.profile-meter__ring');
    if (value) value.textContent = `${percent}%`;
    if (text) text.textContent = percent >= 90 ? 'Your member record looks complete.' : 'Add missing details for a complete record.';
    if (ring) ring.style.background = `conic-gradient(var(--primary-color) ${percent * 3.6}deg, rgba(15, 81, 50, 0.12) 0deg)`;
}
