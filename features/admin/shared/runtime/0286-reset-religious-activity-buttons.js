// Runtime slice from admin.js: resetReligiousActivityButtons.
function resetReligiousActivityButtons() {
    const jummahBtn = document.getElementById('jummahSaveBtn');
    const ramadanBtn = document.getElementById('ramadanSaveBtn');
    const lectureBtn = document.getElementById('lectureSaveBtn');
    if (jummahBtn) jummahBtn.innerHTML = '<i class="fas fa-save"></i> Add Jumu\'ah Reminder';
    if (ramadanBtn) ramadanBtn.innerHTML = '<i class="fas fa-save"></i> Add Ramadan Item';
    if (lectureBtn) lectureBtn.innerHTML = '<i class="fas fa-save"></i> Add Lecture';
}
