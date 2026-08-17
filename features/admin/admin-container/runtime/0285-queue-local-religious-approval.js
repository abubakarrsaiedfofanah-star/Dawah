// Runtime slice from admin.js: queueLocalReligiousApproval.
function queueLocalReligiousApproval(type, item, previousItem, editId) {
    logLocalAdminActivity('pendingAdminApproval', {
        requested_action: 'saveReligiousActivity',
        method: 'POST',
        request: {
            type,
            item,
            previous_item: previousItem || null,
            mode: editId ? 'update' : 'create'
        }
    });
    editingReligiousActivity = null;
    resetReligiousActivityButtons();
    showNotification('Sent to main admin for approval.', 'info');
}
