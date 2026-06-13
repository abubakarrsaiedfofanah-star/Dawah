// Runtime slice from admin.js: deleteReligiousActivity.
function deleteReligiousActivity(type, id) {
    const data = getReligiousActivities();
    const key = type === 'lecture' ? 'lectures' : type;
    const previousItem = (data[key] || []).find(item => Number(item.id) === Number(id));
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        logLocalAdminActivity('pendingAdminApproval', {
            requested_action: 'deleteReligiousActivity',
            method: 'DELETE',
            request: {
                type,
                item_id: id,
                previous_item: previousItem || null
            }
        });
        showNotification('Sent to main admin for approval.', 'info');
        return;
    }
    data[key] = (data[key] || []).filter(item => Number(item.id) !== Number(id));
    saveReligiousActivities(data);
    logLocalAdminActivity('deleteReligiousActivity', {
        type,
        item_id: id,
        previous_item: previousItem || null
    });
    renderReligiousActivitiesAdmin();
    showNotification('Religious activity removed.', 'success');
}
