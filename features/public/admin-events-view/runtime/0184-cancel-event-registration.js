// Runtime slice from daawah.js: cancelEventRegistration.
function cancelEventRegistration(eventId) {
    registeredEvents = registeredEvents.filter(e => e.eventId !== eventId);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    updateRegisteredEventsList();
    showNotification('Event registration cancelled.', 'info');
}
