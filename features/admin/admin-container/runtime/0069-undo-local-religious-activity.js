// Runtime slice from admin.js: undoLocalReligiousActivity.
function undoLocalReligiousActivity(actionName, details) {
    if (!['saveReligiousActivity', 'deleteReligiousActivity'].includes(actionName)) {
        return false;
    }
    const request = details.request || details;
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return false;

    const data = getReligiousActivities();
    const item = request.item || null;
    const previousItem = request.previous_item || null;

    if (actionName === 'deleteReligiousActivity' && previousItem) {
        data[key] = upsertReligiousActivity(data[key] || [], previousItem, previousItem.id);
    } else if (previousItem) {
        data[key] = upsertReligiousActivity(data[key] || [], previousItem, previousItem.id);
    } else if (item?.id) {
        data[key] = (data[key] || []).filter(existing => Number(existing.id) !== Number(item.id));
    } else {
        return false;
    }

    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
    return true;
}
