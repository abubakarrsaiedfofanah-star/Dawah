// Runtime slice from admin.js: loginLocalAdmin.
async function loginLocalAdmin(payload) {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    const accountIndex = accounts.findIndex(admin =>
        admin.username.toLowerCase() === username.toLowerCase() ||
        admin.email.toLowerCase() === username.toLowerCase()
    );
    const account = accountIndex >= 0 ? accounts[accountIndex] : null;

    if (!account) {
        return { success: false, message: 'Invalid admin username or password.' };
    }

    let passwordMatches = false;
    if (account.passwordSalt && account.passwordAlgorithm === ADMIN_HASH_ALGORITHM) {
        const passwordRecord = await hashAdminPassword(password, account.passwordSalt);
        passwordMatches = account.passwordHash === passwordRecord.passwordHash;
    } else if (account.passwordSalt && account.passwordAlgorithm === 'SHA-256-FALLBACK') {
        passwordMatches = account.passwordHash === await legacyHashAdminPassword(`${account.passwordSalt}:${password}`);
        if (passwordMatches && window.crypto?.subtle) {
            accounts[accountIndex] = {
                ...account,
                ...(await hashAdminPassword(password))
            };
            saveLocalAdminAccounts(accounts);
        }
    } else {
        passwordMatches = account.passwordHash === await legacyHashAdminPassword(password);
        if (passwordMatches) {
            accounts[accountIndex] = {
                ...account,
                ...(await hashAdminPassword(password))
            };
            saveLocalAdminAccounts(accounts);
        }
    }

    if (!passwordMatches) {
        return { success: false, message: 'Invalid admin username or password.' };
    }

    const publicAdmin = publicAdminAccount(accounts[accountIndex]);
    sessionStorage.setItem('currentAdminUser', JSON.stringify(publicAdmin));
    logLocalAdminActivity('loginAdmin', { message: 'Admin logged in' });
    return { success: true, message: 'Admin login successful', data: publicAdmin };
}
