// Runtime slice from daawah.js: continueRegistration.
function continueRegistration(newUser, fullName, password) {
    if (frontendOnly && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.registerEmail(newUser.email, password)
            .then(() => {
                if (getRegisteredUser(newUser.studentId) || getRegisteredUser(newUser.email)) {
                    throw new Error('A user with this Student ID or email is already registered.');
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
