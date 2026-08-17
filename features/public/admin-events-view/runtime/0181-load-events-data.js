// Runtime slice from daawah.js: loadEventsData.
function loadEventsData() {
    loadEventsFromApi().finally(() => {
        renderAvailableEvents();
        populateEventSelect();
        updateRegisteredEventsList();
        const eventsList = document.getElementById('eventsList');
        if (eventsList) {
            eventsList.style.display = '';
        }
    });
}
