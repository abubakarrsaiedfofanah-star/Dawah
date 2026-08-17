// Runtime slice from daawah.js: formatActivityDateTime.
function formatActivityDateTime(activity = {}) {
    const dateText = activity.date ? formatDisplayDate(activity.date) : '';
    const timeText = activity.time ? formatDisplayTime(activity.time) : '';
    const dateTimeText = [dateText, timeText].filter(Boolean).join(' at ');
    return dateTimeText || activity.schedule || 'Schedule will be announced';
}
