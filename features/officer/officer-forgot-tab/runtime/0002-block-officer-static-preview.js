// Runtime slice from officer.js: blockOfficerStaticPreview.
function blockOfficerStaticPreview() {
    showOfficerAlert(
        'Official access is blocked on this GitHub/static preview link. Use the real hosted Supabase/Postgres link for officer registration, approval, login, and password reset.',
        'warning'
    );
    document.querySelectorAll('.nav-tabs, #officerLoginTab, #officerRegisterTab, #officerForgotTab').forEach(element => {
        element.classList.add('d-none');
    });
    document.querySelectorAll('form input, form select, form textarea, form button').forEach(control => {
        control.disabled = true;
    });
}
