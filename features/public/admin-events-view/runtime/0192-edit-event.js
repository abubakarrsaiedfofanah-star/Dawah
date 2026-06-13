// Runtime slice from daawah.js: editEvent.
function editEvent(eventName) {
    const event = allEvents.find(item => item.name === eventName || item.title === eventName);
    if (!event) {
        showNotification('Use Create New Event to add updated details.', 'info');
        return;
    }

    document.getElementById('newEventName').value = event.name || event.title || '';
    document.getElementById('newEventDate').value = event.date || '';
    document.getElementById('newEventTime').value = event.time || '';
    document.getElementById('newEventLocation').value = event.location || '';
    document.getElementById('newEventDescription').value = event.description || '';
    showCreateEventModal();
}

// ANNOUNCEMENTS
