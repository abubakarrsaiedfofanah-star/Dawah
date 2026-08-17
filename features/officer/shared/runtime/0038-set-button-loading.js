// Runtime slice from officer.js: setButtonLoading.
function setButtonLoading(button, loading, label) {
    if (!button) return;
    button.disabled = loading;
    button.innerHTML = loading ? `<i class="fas fa-spinner fa-spin"></i> ${label}` : label;
}
