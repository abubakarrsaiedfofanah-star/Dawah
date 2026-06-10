// Runtime slice from daawah.js: renderActivityCard.
function renderActivityCard(activity, compact = false) {
    const periodLabel = activity.period ? activity.period.charAt(0).toUpperCase() + activity.period.slice(1) : 'Activity';
    const dateTimeLabel = formatActivityDateTime(activity);
    const scheduleNote = activity.schedule && activity.schedule !== dateTimeLabel ? activity.schedule : '';
    const canDelete = !compact && hasPermission('manage_activities') && (activity.source === 'database' || String(activity.id || '').startsWith('custom-'));
    return `
        <div class="activity-card ${compact ? 'activity-card--public' : ''}">
            <div class="activity-card__top">
                <span class="activity-badge">${escapeHtml(periodLabel)}</span>
                <span class="activity-card__schedule"><i class="fas fa-calendar-days"></i> ${escapeHtml(dateTimeLabel)}</span>
            </div>
            <h5>${escapeHtml(activity.title || "UMMA University Da'awah Team Activity")}</h5>
            <p>${escapeHtml(activity.description || 'Activity details will be shared soon.')}</p>
            <div class="activity-card__meta">
                <span><i class="fas fa-location-dot"></i> ${escapeHtml(activity.location || 'Location will be announced')}</span>
                ${scheduleNote ? `<span><i class="fas fa-clock"></i> ${escapeHtml(scheduleNote)}</span>` : ''}
                ${canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteActivity('${escapeHtml(activity.id)}')"><i class="fas fa-trash"></i> Remove</button>` : ''}
            </div>
        </div>
    `;
}
