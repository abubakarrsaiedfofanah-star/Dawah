// Runtime slice from daawah.js: updateSemesterAvailability.
function updateSemesterAvailability(yearSelectId, semesterSelectId) {
    const yearSelect = document.getElementById(yearSelectId);
    const semesterSelect = document.getElementById(semesterSelectId);
    if (!yearSelect || !semesterSelect) return;

    const hasYear = Boolean(yearSelect.value);
    semesterSelect.disabled = !hasYear;
    if (!hasYear) {
        semesterSelect.value = '';
    }
}
