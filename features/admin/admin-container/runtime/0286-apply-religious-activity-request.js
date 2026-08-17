// Runtime slice from admin.js: applyReligiousActivityRequest.
function applyReligiousActivityRequest(request) {
    if (!request || !request.type || !request.item) return;

    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;

    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return;

    data[key] = upsertReligiousActivity(data[key] || [], request.item, request.item.id);
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}

/**
 * Exports all religious activities to CSV within a date range.
 */
