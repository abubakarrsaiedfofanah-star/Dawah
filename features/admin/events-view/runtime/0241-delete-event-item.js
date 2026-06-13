// Runtime slice from admin.js: deleteEventItem.
function deleteEventItem(eventId) {
    if (!confirm('Delete this event?')) return;
    
    fetch(`${API_URL}?action=deleteEvent`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event_id: eventId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Event deleted!', 'success');
            loadEvents();
            loadEventCount();
        } else {
            showNotification('Error deleting event', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting event', 'danger');
    });
}
