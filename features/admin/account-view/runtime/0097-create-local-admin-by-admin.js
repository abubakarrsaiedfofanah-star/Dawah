// Runtime slice from admin.js: createLocalAdminByAdmin.
async function createLocalAdminByAdmin(payload) {
    const username = String(payload.username || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    if (!username || !email || !password) {
        return { success: false, message: 'All admin fields are required.' };
    }
    if (!isStrongAdminPassword(password)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (accounts.length >= ADMIN_ACCOUNT_LIMIT) {
        return { success: false, message: 'This admin can only add two other admins.' };
    }
    if (accounts.some(account => account.username.toLowerCase() === username.toLowerCase() || account.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'This admin username or email already exists.' };
    }

    const passwordRecord = await hashAdminPassword(password);
    const admin = {
        id: Date.now(),
        username,
        email,
        ...passwordRecord,
        role: 'admin',
        status: 'active',
        fullName: username,
        created_at: new Date().toISOString()
    };
    accounts.push(admin);
    saveLocalAdminAccounts(accounts);
    logLocalAdminActivity('createAdminAccount', { username, email });
    return { success: true, message: 'Admin account added', data: publicAdminAccount(admin) };
}
