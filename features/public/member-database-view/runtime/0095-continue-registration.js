// Runtime slice from daawah.js: continueRegistration.
function continueRegistration(newUser, fullName, password) {
    if (frontendOnly && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.registerEmail(newUser.email, password)
            .then(async () => {
                const cloudMembers = await window.SupabaseBackend.listMembers?.().catch(error => {
                    console.warn('Could not verify cloud duplicate members before profile save:', error);
                    return null;
                });
                if (Array.isArray(cloudMembers)) {
                    const studentId = normalizeStudentId(newUser.studentId || newUser.username);
                    const email = String(newUser.email || '').trim().toLowerCase();
                    const currentUid = window.SupabaseBackend.currentUid?.() || '';
                    const duplicate = cloudMembers.find(member => {
                        const sameCurrentUser = currentUid && String(member.authUid || member.uid || '').trim() === currentUid;
                        if (sameCurrentUser) return false;
                        return normalizeStudentId(member.studentId || member.username) === studentId
                            || String(member.email || member.authEmail || '').trim().toLowerCase() === email;
                    });
                    if (duplicate) {
                        throw new Error('A user with this Student ID or email is already registered.');
                    }
                }
                return completeLocalRegistration(newUser);
            })
            .catch(error => {
                console.error('Supabase Auth registration error:', error);
                alert(getFriendlyRegistrationError(error));
            });
        return;
    }

    if (!frontendOnly) {
        saveRegistrationToDatabase(newUser, fullName, password)
            .then(savedUser => completeLocalRegistration(savedUser))
            .catch(error => {
                console.error('Registration database error:', error);
                alert(getFriendlyRegistrationError(error));
            });
        return;
    }

    completeLocalRegistration({ ...newUser, password });
}
