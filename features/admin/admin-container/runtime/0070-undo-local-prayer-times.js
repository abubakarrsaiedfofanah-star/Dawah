// Runtime slice from admin.js: undoLocalPrayerTimes.
function undoLocalPrayerTimes(actionName, details) {
    if (actionName !== 'setPrayerTimes') return false;
    const request = details.request || details;
    const previous = request._previous_prayer_times;
    if (!previous || !previous.date) return false;
    localStorage.setItem('adminPrayerTimes', JSON.stringify(previous));
    renderPrayerPreview(previous);
    return true;
}
