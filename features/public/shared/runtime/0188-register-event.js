// Runtime slice from daawah.js: registerEvent.
function registerEvent(eventId) {
    document.getElementById('eventSelect').value = eventId;
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}
