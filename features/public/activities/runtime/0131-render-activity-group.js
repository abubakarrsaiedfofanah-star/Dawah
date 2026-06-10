// Runtime slice from daawah.js: renderActivityGroup.
function renderActivityGroup(period, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const activities = getActivities().filter(activity => activity.period === period);
    if (!activities.length) {
        container.innerHTML = renderEmptyState('fa-calendar-plus', 'No activities yet', 'Organizer can add activities for this period.');
        return;
    }

    container.innerHTML = activities.map(activity => renderActivityCard(activity, false)).join('');
}
