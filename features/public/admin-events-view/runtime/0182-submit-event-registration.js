// Runtime slice from daawah.js: submitEventRegistration.
function submitEventRegistration() {
    const eventSelect = document.getElementById('eventSelect').value;
    const attendeeCount = document.getElementById('attendeeCount').value;
    const requirements = document.getElementById('eventRequirements').value;

    if (!eventSelect) {
        showNotification('Please select an event', 'warning');
        return;
    }

    const selectedEvent = getAvailableEvents().find(event =>
        String(event.id || event.eventId || event.title || event.name) === String(eventSelect)
    );
    const eventName = selectedEvent ? (selectedEvent.title || selectedEvent.name) : eventSelect;

    const registration = {
        id: Date.now(),
        eventName: eventName,
        eventId: eventSelect,
        attendees: attendeeCount,
        requirements: requirements,
        date: selectedEvent ? (selectedEvent.event_date || selectedEvent.date || new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
        registrationDate: new Date().toLocaleDateString(),
        status: 'Registered'
    };

    if (!frontendOnly && selectedEvent && selectedEvent.id) {
        getCurrentStudentId()
        .then(studentId => fetch('firestore-disabled-endpoint?action=registerEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_id: selectedEvent.id,
                student_id: studentId
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not register for event in the database');
            }
            saveEventRegistrationLocally(registration);
        })
        .catch(error => {
            console.error('Event registration database error:', error);
            alert(error.message || 'Event registration could not be saved to the database.');
        });
        return;
    }

    saveEventRegistrationLocally(registration);
}
