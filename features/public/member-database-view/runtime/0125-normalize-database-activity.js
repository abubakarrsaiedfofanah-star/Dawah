// Runtime slice from daawah.js: normalizeDatabaseActivity.
function normalizeDatabaseActivity(activity) {
    return {
        id: `db-${activity.id}`,
        dbActivityId: Number(activity.id),
        source: 'database',
        title: activity.title || "UMMA University Da'awah Team Activity",
        period: normalizeActivityPeriod(activity.period),
        date: activity.activity_date || activity.date || '',
        time: activity.activity_time || activity.time || '',
        schedule: activity.schedule_note || activity.schedule || '',
        location: activity.location || 'Location will be announced',
        description: activity.description || 'Activity details will be shared soon.',
        createdBy: activity.created_by_name || ''
    };
}
