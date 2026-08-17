// Runtime slice from daawah.js: getAvailableEvents.
function getAvailableEvents() {
    return [...allEvents, ...readList('adminEvents')].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}
