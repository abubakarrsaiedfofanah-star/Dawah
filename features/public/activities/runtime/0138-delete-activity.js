// Runtime slice from daawah.js: deleteActivity.
function deleteActivity(activityId) {
    if (!hasPermission('manage_activities')) {
        showNotification('Only the Organizer can remove activities.', 'warning');
        return;
    }
    if (!confirm('Remove this activity?')) return;

    const activity = getActivities().find(item => String(item.id) === String(activityId));
    if (activity?.source === 'database' && activity.dbActivityId) {
        fetch(`firestore-disabled-endpoint?action=deleteActivity&id=${encodeURIComponent(activity.dbActivityId)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(authPayload({ activity_id: activity.dbActivityId }))
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not delete activity');
            logLocalRoleActivity('deleteActivity', { activity_id: activity.dbActivityId });
            return loadActivitiesFromApi();
        })
        .then(() => {
            loadActivitiesData();
            renderPublicActivitiesPreview();
            renderDashboardActivityCalendar();
            showNotification('Activity deleted from the database.', 'success');
        })
        .catch(error => showNotification(error.message || 'Could not delete activity', 'danger'));
        return;
    }

    const savedActivities = readList('adminActivities').filter(activity => activity.id !== activityId);
    localStorage.setItem('adminActivities', JSON.stringify(savedActivities));
    logLocalRoleActivity('deleteActivity', { activity_id: activityId });
    loadActivitiesData();
    renderPublicActivitiesPreview();
    showNotification('Activity removed.', 'success');
}

// PROFILE
