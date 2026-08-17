// Runtime slice from daawah.js: renderCourseOptions.
function renderCourseOptions(selectId, school, selectedCourse = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const catalog = schoolCourseCatalog[school];
    if (!catalog) {
        select.innerHTML = '<option value="" disabled selected>Select a school first</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = '<option value="">Select Course</option>' + Object.entries(catalog).map(([group, courses]) => `
        <optgroup label="${escapeHtml(group)}">
            ${courses.map(course => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join('')}
        </optgroup>
    `).join('');
    select.value = selectedCourse;
}
