// Runtime slice from daawah.js: attachEventListeners.
function attachEventListeners() {
    initializeAcademicSelectors();
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', handleForgotPassword);
    document.getElementById('contactForm')?.addEventListener('submit', submitContactVoiceMessage);
    document.getElementById('startVoiceRecording')?.addEventListener('click', startContactVoiceRecording);
    document.getElementById('stopVoiceRecording')?.addEventListener('click', stopContactVoiceRecording);
    document.getElementById('clearVoiceRecording')?.addEventListener('click', clearContactVoiceRecording);
    document.getElementById('contactVoiceFile')?.addEventListener('change', handleContactVoiceFileChange);
    document.getElementById('passportPhoto')?.addEventListener('change', handlePassportPhotoFileChange);
    document.getElementById('togglePassword')?.addEventListener('click', togglePasswordVisibility);
    document.getElementById('toggleRegPassword')?.addEventListener('click', () => togglePasswordField('regPassword', 'toggleRegPassword'));
    document.getElementById('toggleConfirmPassword')?.addEventListener('click', () => togglePasswordField('confirmPassword', 'toggleConfirmPassword'));
    document.getElementById('loginUsername')?.addEventListener('blur', populateLoginRoleFromUsername);
    document.getElementById('school')?.addEventListener('change', () => renderCourseOptions('course', document.getElementById('school').value));
    document.getElementById('editSchool')?.addEventListener('change', () => renderCourseOptions('editCourse', document.getElementById('editSchool').value));
    document.getElementById('yearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('yearOfStudy', 'semester'));
    document.getElementById('editYearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('editYearOfStudy', 'editSemester'));
    document.getElementById('regPassword')?.addEventListener('input', updatePasswordStrengthMeter);
    updateSemesterAvailability('yearOfStudy', 'semester');
    updatePasswordStrengthMeter();
}
