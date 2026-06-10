// Runtime slice from daawah.js: loadActivitiesData.
function loadActivitiesData() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(() => {
        const managerPanel = document.getElementById('activityManagerPanel');
        managerPanel?.classList.toggle('d-none', !hasPermission('manage_activities'));
        renderActivityGroup('daily', 'dailyActivitiesList');
        renderActivityGroup('weekly', 'weeklyActivitiesList');
        renderActivityGroup('monthly', 'monthlyActivitiesList');
    });
}
