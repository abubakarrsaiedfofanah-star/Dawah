// Runtime slice from admin.js: createEvent.
function createEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const category = document.getElementById('eventCategory').value.trim() || 'general';
    const capacity = parseInt(document.getElementById('eventCapacity').value, 10) || 100;
    
    if (!title || !description || !eventDate) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const data = {
        title: title,
        description: description,
        event_date: eventDate.replace('T', ' '),
        location: location,
        organizer_id: currentAdmin.id || 1,
        category: category,
        status: 'upcoming',
        max_participants: capacity
    };
    
    fetch(`${API_URL}?action=createEvent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Event created successfully!', 'success');
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDescription').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventLocation').value = '';
            document.getElementById('eventCategory').value = '';
            document.getElementById('eventCapacity').value = '';
            loadEvents();
            loadEventCount();
        } else {
            showNotification('Error creating event: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error creating event', 'danger');
    });
}
