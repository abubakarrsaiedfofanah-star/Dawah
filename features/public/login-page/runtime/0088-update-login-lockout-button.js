// Runtime slice from daawah.js: updateLoginLockoutButton.
function updateLoginLockoutButton() {
    const button = document.getElementById('loginSubmitBtn');
    if (!button) return;

    const remaining = Math.ceil((loginLockedUntil - Date.now()) / 1000);
    if (remaining <= 0) {
        button.disabled = false;
        button.textContent = 'Login';
        return;
    }

    button.disabled = true;
    button.textContent = `Wait ${remaining}s`;
    setTimeout(updateLoginLockoutButton, 250);
}
