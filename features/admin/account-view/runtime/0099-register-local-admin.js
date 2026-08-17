// Runtime slice from admin.js: registerLocalAdmin.
async function registerLocalAdmin(payload) {
    const username = String(payload.username || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    if (!username || !email || !password) {
        return { success: false, message: 'All admin registration fields are required.' };
    }
    if (!isStrongAdminPassword(password)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (accounts.length > 0) {
        return { success: false, message: 'Only the first admin can register here. Other admins must be added inside the admin panel.' };
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
        fullName: username,
        created_at: new Date().toISOString()
    };
    accounts.push(admin);
    saveLocalAdminAccounts(accounts);

    const publicAdmin = publicAdminAccount(admin);
    sessionStorage.setItem('currentAdminUser', JSON.stringify(publicAdmin));
    logLocalAdminActivity('registerAdmin', { message: 'First admin registered' });
    return { success: true, message: 'Admin account created', data: publicAdmin };
}
