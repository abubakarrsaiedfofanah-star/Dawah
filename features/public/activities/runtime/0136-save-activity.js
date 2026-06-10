// Runtime slice from daawah.js: saveActivity.
function saveActivity(event) {
    event.preventDefault();
    if (!hasPermission('manage_activities')) {
        showNotification('Only the Organizer can add activities.', 'warning');
        return;
    }

    const activity = {
        id: `custom-${Date.now()}`,
        title: document.getElementById('activityTitle').value.trim(),
        period: document.getElementById('activityPeriod').value,
        date: document.getElementById('activityDate').value,
        time: document.getElementById('activityTime').value,
        schedule: document.getElementById('activitySchedule').value.trim(),
        location: document.getElementById('activityLocation').value.trim(),
        description: document.getElementById('activityDescription').value.trim()
    };

    if (!activity.title || !activity.period || !activity.date || !activity.time || !activity.location || !activity.description) {
        showNotification('Please fill in all activity fields.', 'warning');
        return;
    }

    if (!frontendOnly) {
        saveActivityToDatabase(activity)
            .then(() => {
                document.getElementById('activityForm').reset();
                logLocalRoleActivity('saveActivity', { title: activity.title, period: activity.period, date: activity.date, time: activity.time, schedule: activity.schedule });
                return loadActivitiesFromApi();
            })
            .then(() => {
                loadActivitiesData();
                renderPublicActivitiesPreview();
                renderDashboardActivityCalendar();
                showNotification('Activity saved to the database.', 'success');
            })
            .catch(error => {
                console.error('Activity database save error:', error);
                showNotification(error.message || 'Could not save activity to database.', 'danger');
            });
        return;
    }

    const savedActivities = readList('adminActivities');
    savedActivities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(savedActivities));
    document.getElementById('activityForm').reset();
    logLocalRoleActivity('saveActivity', { title: activity.title, period: activity.period, date: activity.date, time: activity.time, schedule: activity.schedule });
    loadActivitiesData();
    renderPublicActivitiesPreview();
    showNotification('Activity added successfully.', 'success');
}
