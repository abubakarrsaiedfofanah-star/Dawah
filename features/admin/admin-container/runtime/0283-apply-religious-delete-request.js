// Runtime slice from admin.js: applyReligiousDeleteRequest.
function applyReligiousDeleteRequest(request) {
    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return;
    data[key] = (data[key] || []).filter(item => Number(item.id) !== Number(request.item_id));
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}
