// Runtime slice from daawah.js: updateVolunteerStatus.
function updateVolunteerStatus(registrationId, status) {
    const hours = status === 'completed' ? prompt('Hours completed?', '1') : '';
    fetch('firestore-disabled-endpoint?action=updateVolunteerRegistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({
            registration_id: registrationId,
            status,
            hours_completed: hours === '' ? undefined : Number(hours)
        }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update volunteer status');
        showNotification('Volunteer status updated.', 'success');
        return loadVolunteerData();
    })
    .catch(error => showNotification(error.message || 'Could not update volunteer status', 'danger'));
}
