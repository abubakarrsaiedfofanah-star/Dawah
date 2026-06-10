// Runtime slice from officer.js: loginOfficerLocally.
function loginOfficerLocally(username, password, options = {}) {
    const user = findLocalMember(username);
    if (!user) {
        throw new Error('No registered officer account found. Please register first.');
    }
    if (!options.authenticatedByFirebase && user.password !== password) {
        throw new Error('Incorrect password. Please try again.');
    }
    const role = String(user.role || '').toLowerCase();
    if (!OFFICER_ROLES.includes(role)) {
        throw new Error(role === 'student'
            ? 'Student accounts login from index.html.'
            : 'Admin and sub-admin accounts login from admin.html.');
    }
    if (String(user.status || '').toLowerCase() !== 'active') {
        throw new Error('This officer account is waiting for main admin approval.');
    }
    return {
        ...user,
        username: user.username || user.studentId || username,
        studentId: user.studentId || user.username || username,
        role
    };
}
