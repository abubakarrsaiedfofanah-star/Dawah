// Runtime slice from daawah.js: getActivityPeriodIcon.
function getActivityPeriodIcon(period) {
    if (period === 'daily') return 'fa-sun';
    if (period === 'weekly') return 'fa-calendar-week';
    return 'fa-calendar-days';
}
