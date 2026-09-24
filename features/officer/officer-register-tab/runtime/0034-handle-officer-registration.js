// Runtime slice from officer.js: handleOfficerRegistration.
function showOfficerRegistrationAlert(message, type = 'info') {
    const notice = document.getElementById('officerRegistrationNotice');
    showOfficerAlert(message, type);
    if (!notice) return;
    notice.className = `alert alert-${type}`;
    notice.textContent = message;
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleOfficerRegistration(event) {
    event.preventDefault();
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'officer');
    clearOfficerAlert();
    const registrationNotice = document.getElementById('officerRegistrationNotice');
    if (registrationNotice) { registrationNotice.className = 'alert d-none'; registrationNotice.textContent = ''; }
    await officerCloudReadyPromise;
    const data = getOfficerRegistrationData();
    const validationMessage = validateOfficerRegistration(data);
    if (validationMessage) {
        showOfficerRegistrationAlert(validationMessage, 'warning');
        return;
    }

    const button = document.getElementById('officerRegisterButton');
    setButtonLoading(button, true, 'Submitting...');

    if (frontendOnly) {
        try {
            if (window.SupabaseBackend?.enabled) {
                let authResult;
                try {
                    authResult = await window.SupabaseBackend.registerEmail(data.email, data.password, data.fullName);
                } catch (error) {
                    if (!/already registered|already exists|user already/i.test(error.message || '')) throw error;
                    authResult = await window.SupabaseBackend.loginEmail(data.email, data.password);
                }
                if (authResult?.requiresEmailConfirmation || !window.SupabaseBackend.hasAuthSession?.()) {
                    throw new Error('Check your email and confirm your account. Then return here, enter the same details, and submit again to finish your officer request.');
                }
                await window.SupabaseBackend.ensureRealtimeAuth?.(data.email, data.password).catch(error => {
                    console.warn('Realtime auth unavailable after officer registration:', error);
                });
                const member = registerOfficerLocally(data, { persist: false });
                const savedMember = await window.SupabaseBackend.saveMember(member);
                writeLocalMembers(mergeMemberIntoList(readLocalMembers(), { ...member, ...(savedMember || {}), password: undefined }));
                showOfficerRegistrationAlert('Officer request submitted. The main admin must approve it before this account can open the officer dashboard.', 'success');
                document.getElementById('officerRegisterForm').reset();
                document.getElementById('officerCourse').disabled = true;
                document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
                document.getElementById('officerLoginTabBtn')?.click();
                return;
            }
            if (!['localhost', '127.0.0.1'].includes(location.hostname)) {
                throw new Error('Secure registration is unavailable right now. Please try again later or contact the main admin.');
            }
            registerOfficerLocally(data, { keepLocalPassword: true });
            showOfficerRegistrationAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
            document.getElementById('officerRegisterForm').reset();
            document.getElementById('officerCourse').disabled = true;
            document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
            document.getElementById('officerLoginTabBtn')?.click();
        } catch (error) {
            showOfficerRegistrationAlert(error.message || 'Officer registration failed.', 'danger');
        } finally {
            setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration');
        }
        return;
    }

    fetch('supabase-required-endpoint?action=registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: data.student_id,
            email: data.email,
            password: data.password,
            role: data.role
        })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data?.user_id) {
            throw new Error(result.message || 'Could not create officer account');
        }
        return registerOfficerStudentRecord(result.data.user_id, data);
    })
    .then(() => {
        showOfficerRegistrationAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
        document.getElementById('officerRegisterForm').reset();
        document.getElementById('officerCourse').disabled = true;
        document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
        document.getElementById('officerLoginTabBtn')?.click();
    })
    .catch(error => {
        showOfficerRegistrationAlert(error.message || 'Officer registration failed.', 'danger');
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration'));
}
