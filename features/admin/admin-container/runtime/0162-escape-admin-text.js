// Runtime slice from admin.js: escapeAdminText.
function escapeAdminText(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}
