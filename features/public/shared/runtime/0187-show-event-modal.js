// Runtime slice from daawah.js: showEventModal.
function showEventModal() {
    populateEventSelect();
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}
