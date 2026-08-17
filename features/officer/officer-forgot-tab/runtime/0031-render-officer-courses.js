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
