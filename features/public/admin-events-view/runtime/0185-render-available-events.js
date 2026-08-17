// Runtime slice from daawah.js: renderAvailableEvents.
function renderAvailableEvents() {
    const container = document.getElementById('eventsList');
    if (!container) return;

    const events = getAvailableEvents();
    if (events.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No events have been added yet.</div>';
        return;
    }

    container.innerHTML = events.map(event => {
        const id = event.id || event.eventId || Date.now();
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || 'Date not set';
        const location = event.location || 'Location not set';
        const description = event.description || '';

        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card event-card">
                    <div class="card-header event-header">
                        <h6 class="mb-0">${title}</h6>
                        <small>${date}</small>
                    </div>
                    <div class="card-body">
                        <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                        <p class="text-muted">${description}</p>
                        <button class="btn btn-sm btn-primary" onclick="registerEvent('${id}')">Register</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
