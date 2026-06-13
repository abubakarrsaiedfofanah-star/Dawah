// Runtime slice from daawah.js: toggleAllStudentSelection.
function toggleAllStudentSelection() {
    const boxes = Array.from(document.querySelectorAll('.student-select-checkbox'));
    const shouldCheck = boxes.some(box => !box.checked);
    boxes.forEach(box => { box.checked = shouldCheck; });
}
