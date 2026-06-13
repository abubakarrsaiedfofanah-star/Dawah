// Runtime slice from admin.js: verifyLocalAdminPassword.
async function verifyLocalAdminPassword(account, password) {
    if (account.passwordSalt && account.passwordAlgorithm === ADMIN_HASH_ALGORITHM) {
        const passwordRecord = await hashAdminPassword(password, account.passwordSalt);
        return account.passwordHash === passwordRecord.passwordHash;
    }
    if (account.passwordSalt && account.passwordAlgorithm === 'SHA-256-FALLBACK') {
        return account.passwordHash === await legacyHashAdminPassword(`${account.passwordSalt}:${password}`);
    }
    return account.passwordHash === await legacyHashAdminPassword(password);
}
