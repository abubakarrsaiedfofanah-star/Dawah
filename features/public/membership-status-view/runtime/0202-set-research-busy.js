// Runtime slice from daawah.js: setResearchBusy.
function setResearchBusy(isBusy, message) {
    const button = document.getElementById('researchRunBtn');
    const status = document.getElementById('researchStatus');
    if (button) {
        button.disabled = isBusy;
        button.innerHTML = isBusy ? '<i class="fas fa-spinner fa-spin"></i> Researching...' : '<i class="fas fa-magnifying-glass"></i> Research';
    }
    if (status && message) status.textContent = message;
}
