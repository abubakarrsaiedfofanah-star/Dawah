// Runtime slice from admin.js: applyReligiousActivityRequest.
function applyReligiousActivityRequest(request) {
    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    if (!['jummah', 'ramadan', 'lectures'].includes(key) || !request.item) return;
    data[key] = upsertReligiousActivity(data[key] || [], request.item, request.item.id);
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}
