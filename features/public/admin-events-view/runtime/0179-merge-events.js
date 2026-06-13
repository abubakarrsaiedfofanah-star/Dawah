// Runtime slice from daawah.js: mergeEvents.
function mergeEvents(events) {
    allEvents = [...allEvents, ...events].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}
