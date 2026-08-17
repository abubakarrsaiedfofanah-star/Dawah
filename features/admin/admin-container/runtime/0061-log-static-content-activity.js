// Runtime slice from admin.js: logStaticContentActivity.
function logStaticContentActivity(action, method, payload, result) {
    const trackedActions = [
        'createAnnouncement',
        'deleteAnnouncement',
        'createEvent',
        'deleteEvent',
        'addLeader',
        'deleteLeader',
        'addGalleryItem',
        'deleteGalleryItem',
        'addHadith',
        'deleteHadith',
        'updateWelfareStatus',
        'setPrayerTimes',
        'saveReligiousActivity',
        'deleteReligiousActivity',
        'addResource',
        'deleteResource',
        'approvePayment',
        'approveDonation',
        'rejectPayment',
        'rejectDonation',
        'reversePayment',
        'reverseDonation'
    ];
    if (!result?.success || !trackedActions.includes(action) || !['POST', 'PUT', 'DELETE'].includes(method)) {
        return;
    }
    logLocalAdminActivity(action, {
        method,
        message: result.message || 'Saved locally',
        request: payload,
        response: result.data || {}
    });
}
