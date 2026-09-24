// Runtime slice from daawah.js: continueRegistration.
async function continueRegistration(newUser, fullName, password) {
    const button = document.getElementById('registrationSubmitButton');
    if (button?.disabled) return;
    if (button) {
        button.disabled = true;
        button.dataset.originalText ||= button.textContent.trim();
        button.textContent = 'Creating your account…';
    }

    try {
        if (frontendOnly && window.SupabaseBackend?.enabled) {
            let authResult;
            try {
                authResult = await window.SupabaseBackend.registerEmail(newUser.email, password, fullName);
            } catch (error) {
                if (!/already registered|already exists|user already/i.test(error.message || '')) throw error;
                authResult = await window.SupabaseBackend.loginEmail(newUser.email, password);
            }

            if (authResult?.requiresEmailConfirmation || !window.SupabaseBackend.hasAuthSession?.()) {
                throw new Error('Check your email and confirm your account. Then return here, enter the same details, and submit again to finish registration.');
            }

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
                if (duplicate) throw new Error('A user with this Student ID or email is already registered.');
            }

            await completeLocalRegistration(newUser);
            return;
        }

        if (!frontendOnly) {
            const savedUser = await saveRegistrationToDatabase(newUser, fullName, password);
            await completeLocalRegistration(savedUser);
            return;
        }

        await completeLocalRegistration({ ...newUser, password });
    } catch (error) {
        console.error('Registration could not be completed:', error);
        showRegistrationNotice(getFriendlyRegistrationError(error));
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Create student account';
        }
    }
}
