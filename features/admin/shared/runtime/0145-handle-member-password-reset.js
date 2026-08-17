// Runtime slice from admin.js: handleMemberPasswordReset.
function handleMemberPasswordReset(event) {
    event.preventDefault();
    const select = document.getElementById('memberPasswordUser');
    const email = select?.selectedOptions?.[0]?.dataset?.email || '';
    const button = document.getElementById('memberPasswordResetButton');
    if (!email) {
        showNotification('Please choose a member with a registered email address.', 'warning');
        return;
    }
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.sendPasswordResetEmail) {
        showNotification('Hosted password reset is not available on this page.', 'danger');
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    window.SupabaseBackend.sendPasswordResetEmail(email)
    .then(() => {
        document.getElementById('memberPasswordResetForm')?.reset();
        showNotification(`Password reset email sent to ${email}.`, 'success');
    })
    .catch(error => showNotification(error.message || 'Could not send password reset email', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-envelope"></i> Send Reset Email';
        }
    });
}
