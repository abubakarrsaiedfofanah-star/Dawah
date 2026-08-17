// Runtime slice from admin.js: runApprovedLocalAction.
function runApprovedLocalAction(actionName, request) {
    if (actionName === 'createAnnouncement') {
        const item = addStoreItem('adminAnnouncements', request);
        return { success: true, data: { announcement_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteAnnouncement') {
        deleteStoreItem('adminAnnouncements', request.announcement_id);
        return { success: true };
    }
    if (actionName === 'createEvent') {
        const item = addStoreItem('adminEvents', request);
        return { success: true, data: { event_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteEvent') {
        deleteStoreItem('adminEvents', request.event_id);
        return { success: true };
    }
    if (actionName === 'addLeader') {
        const item = addStoreItem('publicLeaders', request);
        return { success: true, data: { leader_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteLeader') {
        deleteStoreItem('publicLeaders', request.leader_id);
        return { success: true };
    }
    if (actionName === 'addGalleryItem') {
        const item = addStoreItem('galleryItems', { ...request, imageData: request.image_url, imageUrl: request.image_url });
        return { success: true, data: { gallery_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteGalleryItem') {
        deleteStoreItem('galleryItems', request.gallery_id);
        return { success: true };
    }
    if (actionName === 'addHadith') {
        const item = addStoreItem('adminHadiths', request);
        return { success: true, data: { hadith_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteHadith') {
        deleteStoreItem('adminHadiths', request.hadith_id);
        return { success: true };
    }
    if (actionName === 'addResource') {
        const item = addStoreItem('adminResources', request);
        return { success: true, data: { resource_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteResource') {
        deleteStoreItem('adminResources', request.resource_id);
        return { success: true };
    }
    if (actionName === 'approvePayment') {
        updateLocalTransaction('payments', request.payment_id, approveFinancePatch('payments', request.payment_id));
        return { success: true };
    }
    if (actionName === 'approveDonation') {
        updateLocalTransaction('donations', request.donation_id, approveFinancePatch('donations', request.donation_id));
        return { success: true };
    }
    if (actionName === 'rejectPayment') {
        updateLocalTransaction('payments', request.payment_id, rejectFinancePatch('payments', request.payment_id, request.notes || 'Rejected by admin/treasurer'));
        return { success: true };
    }
    if (actionName === 'rejectDonation') {
        updateLocalTransaction('donations', request.donation_id, rejectFinancePatch('donations', request.donation_id, request.notes || 'Rejected by admin/treasurer'));
        return { success: true };
    }
    if (actionName === 'reversePayment') {
        updateLocalTransaction('payments', request.payment_id, reverseFinancePatch('payments', request.payment_id, request.reason || 'Reversed by main admin'));
        return { success: true };
    }
    if (actionName === 'reverseDonation') {
        updateLocalTransaction('donations', request.donation_id, reverseFinancePatch('donations', request.donation_id, request.reason || 'Reversed by main admin'));
        return { success: true };
    }
    if (actionName === 'setPrayerTimes') {
        localStorage.setItem('adminPrayerTimes', JSON.stringify(request));
        return { success: true };
    }
    if (actionName === 'saveReligiousActivity') {
        applyReligiousActivityRequest(request);
        return { success: true };
    }
    if (actionName === 'deleteReligiousActivity') {
        applyReligiousDeleteRequest(request);
        return { success: true };
    }
    return { success: false, message: 'This pending action cannot be approved automatically.' };
}
