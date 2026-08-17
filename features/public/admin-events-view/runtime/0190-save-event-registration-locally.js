// Runtime slice from daawah.js: saveEventRegistrationLocally.
function saveEventRegistrationLocally(registration) {
    registeredEvents.push(registration);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    saveOwnedCloudRecord('eventRegistrations', registration, 'registeredEvents');

    showNotification('Event registration successful! ' + registration.eventName, 'success');

    document.getElementById('eventForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
    updateRegisteredEventsList();
}
