// Runtime slice from daawah.js: populateEventSelect.
function populateEventSelect() {
    const select = document.getElementById('eventSelect');
    if (!select) return;

    const events = getAvailableEvents();
    select.innerHTML = '<option value="">Choose an event</option>' + events.map(event => {
        const id = event.id || event.eventId || event.title || event.name;
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || '';
        return `<option value="${id}">${title}${date ? ' - ' + date : ''}</option>`;
    }).join('');
}
