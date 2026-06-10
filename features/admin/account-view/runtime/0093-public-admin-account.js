// Runtime slice from admin.js: publicAdminAccount.
function publicAdminAccount(admin) {
    const {
        passwordHash,
        passwordSalt,
        passwordIterations,
        passwordAlgorithm,
        ...publicAdmin
    } = admin;
    return {
        ...publicAdmin,
        isMainAdmin: Number(admin.id) === getLocalMainAdminId()
    };
}
