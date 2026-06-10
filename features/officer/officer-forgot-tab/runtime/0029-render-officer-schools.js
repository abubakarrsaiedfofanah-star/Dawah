// Runtime slice from officer.js: renderOfficerSchools.
function renderOfficerSchools() {
    const schoolSelect = document.getElementById('officerSchool');
    if (!schoolSelect) return;
    const schools = Object.keys(academicCatalog);
    schoolSelect.innerHTML = '<option value="" disabled selected>Select school</option>' + schools
        .map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`)
        .join('');
}
