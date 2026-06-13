// Runtime slice from officer.js: showOfficerAlert.
function showOfficerAlert(message, type = 'info') {
    const alertBox = document.getElementById('officerAlert');
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}
