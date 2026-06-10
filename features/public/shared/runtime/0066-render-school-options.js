// Runtime slice from daawah.js: renderSchoolOptions.
function renderSchoolOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Select School</option>' +
        schoolOptions.map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`).join('');
}
