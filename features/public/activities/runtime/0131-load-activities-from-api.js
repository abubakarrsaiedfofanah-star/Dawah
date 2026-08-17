// Runtime slice from daawah.js: loadActivitiesFromApi.
function loadActivitiesFromApi() {
    if (frontendOnly) {
        databaseActivities = [];
        return Promise.resolve([]);
    }
    if (databaseActivities.length && Date.now() - activitiesLoadedAt < 5 * 60 * 1000) {
        return Promise.resolve(databaseActivities);
    }

    return fetch('supabase-required-endpoint?action=getActivities', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not load activities');
            }
            databaseActivities = (result.data || []).map(normalizeDatabaseActivity);
            activitiesLoadedAt = Date.now();
            return databaseActivities;
        })
        .catch(error => {
            console.warn('Database activities unavailable:', error);
            databaseActivities = [];
            return [];
        });
}
