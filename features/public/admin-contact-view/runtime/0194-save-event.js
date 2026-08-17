// Runtime slice from daawah.js: saveEvent.
function saveEvent() {
    const eventName = document.getElementById('createEventName').value;
    const eventDate = document.getElementById('createEventDate').value;
    const eventTime = document.getElementById('createEventTime').value;
    const eventLocation = document.getElementById('createEventLocation').value;
    const eventDescription = document.getElementById('createEventDescription').value;

    const eventData = {
        name: eventName,
        title: eventName,
        date: eventDate,
        time: eventTime,
        event_date: eventTime ? `${eventDate} ${eventTime}` : eventDate,
        location: eventLocation,
        description: eventDescription,
        createdDate: new Date().toLocaleDateString(),
        status: 'Upcoming'
    };

    if (!frontendOnly) {
        fetch('admin_supabase-required-endpoint?action=createEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: eventName,
                description: eventDescription,
                event_date: eventData.event_date,
                location: eventLocation,
                category: 'general',
                status: 'upcoming',
                max_participants: 100
            })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Error creating event');
            }
            mergeEvents([eventData]);
            loadEventsData();
            alert('Event created successfully!');
            bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error creating event. Please try again.', 'danger');
        });
        return;
    }

    allEvents.push(eventData);

    localStorage.setItem('allEvents', JSON.stringify(allEvents));
    alert('Event created successfully!');
    bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
}
