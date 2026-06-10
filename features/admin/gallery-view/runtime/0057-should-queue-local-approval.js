// Runtime slice from admin.js: shouldQueueLocalApproval.
function shouldQueueLocalApproval(action, method) {
    return ['POST', 'PUT', 'DELETE'].includes(method) && [
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
    ].includes(action);
}
