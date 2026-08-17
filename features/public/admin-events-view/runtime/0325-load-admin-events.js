// Runtime slice from daawah.js: loadAdminEvents.
function loadAdminEvents() {
    loadEventsFromApi().finally(() => renderAdminEventsTable());
}
