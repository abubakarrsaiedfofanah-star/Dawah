// Runtime slice from daawah.js: saveActivityToDatabase.
function saveActivityToDatabase(activity) {
    return fetch('supabase-required-endpoint?action=createActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({
            title: activity.title,
            period: activity.period,
            date: activity.date,
            time: activity.time,
            schedule: activity.schedule,
            location: activity.location,
            description: activity.description,
            created_by: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0
        }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not save activity');
        }
        return result.data || {};
    });
}
