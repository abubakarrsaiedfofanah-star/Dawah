// Runtime slice from officer.js: clearOfficerAlert.
function clearOfficerAlert() {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.classList.add('d-none');
    alertBox.textContent = '';
}
