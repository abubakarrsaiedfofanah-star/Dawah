// Runtime slice from daawah.js: renderPublicActivitiesPreview.
function renderPublicActivitiesPreview() {
    const container = document.getElementById('publicActivitiesPreview');
    if (!container) return;

    const periods = ['daily', 'weekly', 'monthly'];
    container.innerHTML = periods.map(period => {
        const activities = getActivities().filter(item => item.period === period);
        if (!activities.length) return '';
        const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
        return `
            <section class="activity-preview-group activity-preview-group--${period}">
                <div class="activity-preview-group__header">
                    <span class="activity-preview-group__icon"><i class="fas ${getActivityPeriodIcon(period)}"></i></span>
                    <div>
                        <h3>${periodLabel}</h3>
                        <p>${activities.length} ${activities.length === 1 ? 'activity' : 'activities'} available</p>
                    </div>
                </div>
                <div class="activity-preview-group__list">
                    ${activities.map(activity => renderActivityCard(activity, true)).join('')}
                </div>
            </section>
        `;
    }).join('') || '<div class="text-center text-muted">Activities will be updated soon.</div>';
}
