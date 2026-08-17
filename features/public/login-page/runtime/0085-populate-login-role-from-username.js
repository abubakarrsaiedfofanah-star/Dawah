// Runtime slice from daawah.js: populateLoginRoleFromUsername.
function populateLoginRoleFromUsername() {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const user = getRegisteredUser(username);
    const roleSelect = document.getElementById('userRole');
    if (user && roleSelect) {
        roleSelect.value = user.role;
    }
}

// AUTHENTICATION
