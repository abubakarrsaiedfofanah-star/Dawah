// Runtime slice from daawah.js: getActivities.
function getActivities() {
    const savedActivities = readList('adminActivities').map(activity => ({
        ...activity,
        source: activity.source || 'local',
        period: normalizeActivityPeriod(activity.period)
    }));
    return [...databaseActivities, ...savedActivities, ...defaultActivities].filter((activity, index, list) => {
        const key = `${activity.period}-${activity.id || activity.title}`;
        return index === list.findIndex(item => `${item.period}-${item.id || item.title}` === key);
    });
}
