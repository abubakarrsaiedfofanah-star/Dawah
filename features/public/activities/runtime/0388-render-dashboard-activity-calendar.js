// Runtime slice from daawah.js: renderDashboardActivityCalendar.
function renderDashboardActivityCalendar() {
    const container = document.getElementById('dashboardActivityCalendar');
    if (!container) return;
    const activities = getActivities();
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return date;
    });
    container.innerHTML = days.map(day => {
        const key = day.toISOString().slice(0, 10);
        const dayActivities = activities.filter(activity => activity.date === key).slice(0, 3);
        return `
            <div class="activity-calendar__day">
                <div class="activity-calendar__date">${day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
                ${dayActivities.length ? dayActivities.map(activity => `<span class="activity-calendar__event">${escapeHtml(activity.title)}</span>`).join('') : '<span class="text-muted small">No activity</span>'}
            </div>
        `;
    }).join('');
}
