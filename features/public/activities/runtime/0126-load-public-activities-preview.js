// Runtime slice from daawah.js: loadPublicActivitiesPreview.
function loadPublicActivitiesPreview() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(renderPublicActivitiesPreview);
}
