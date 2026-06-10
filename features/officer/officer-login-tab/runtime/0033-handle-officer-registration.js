// Runtime slice from officer.js: handleOfficerRegistration.
async function handleOfficerRegistration(event) {
    event.preventDefault();
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'officer');
    clearOfficerAlert();
    await officerCloudReadyPromise;
    const data = getOfficerRegistrationData();
    const validationMessage = validateOfficerRegistration(data);
    if (validationMessage) {
        showOfficerAlert(validationMessage, 'warning');
        return;
    }

    const button = document.getElementById('officerRegisterButton');
    setButtonLoading(button, true, 'Submitting...');

    if (frontendOnly) {
        try {
            if (window.DawaahCloud?.enabled) {
                await window.DawaahCloud.registerEmail(data.email, data.password);
                await window.DawaahCloud.ensureRealtimeAuth?.(data.email, data.password).catch(error => {
                    console.warn('Realtime auth unavailable after officer registration:', error);
                });
                await loadOfficerSharedMembers();
            }
            const member = registerOfficerLocally(data);
            if (window.DawaahCloud?.enabled) {
                await window.DawaahCloud.saveMember(member);
            }
            showOfficerAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
            document.getElementById('officerRegisterForm').reset();
            document.getElementById('officerCourse').disabled = true;
            document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
            document.getElementById('officerLoginTabBtn')?.click();
        } catch (error) {
            showOfficerAlert(error.message || 'Officer registration failed.', 'danger');
        } finally {
            setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration');
        }
        return;
    }

    fetch('firestore-disabled-endpoint?action=registerUser', {
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
        showOfficerAlert('Officer registration submitted. The main admin must approve this role before login.', 'success');
        document.getElementById('officerRegisterForm').reset();
        document.getElementById('officerCourse').disabled = true;
        document.getElementById('officerCourse').innerHTML = '<option value="" disabled selected>Select school first</option>';
        document.getElementById('officerLoginTabBtn')?.click();
    })
    .catch(error => {
        showOfficerAlert(error.message || 'Officer registration failed.', 'danger');
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-user-plus"></i> Submit Officer Registration'));
}
