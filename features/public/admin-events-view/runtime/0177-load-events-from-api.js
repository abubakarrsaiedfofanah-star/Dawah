// Runtime slice from daawah.js: loadEventsFromApi.
function loadEventsFromApi() {
    const eventsRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getEvents'))
        : fetch('admin_firestore-disabled-endpoint?action=getEvents&limit=100').then(response => parseJsonResponse(response));

    return eventsRequest
        .then(result => {
            if (result.success && Array.isArray(result.data)) {
                mergeEvents(result.data);
            }
            return allEvents;
        })
        .catch(() => {
            return allEvents;
        });
}
