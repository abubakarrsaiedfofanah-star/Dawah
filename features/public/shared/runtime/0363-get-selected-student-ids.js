// Runtime slice from daawah.js: getSelectedStudentIds.
function getSelectedStudentIds() {
    return Array.from(document.querySelectorAll('.student-select-checkbox:checked')).map(input => input.value).filter(Boolean);
}
