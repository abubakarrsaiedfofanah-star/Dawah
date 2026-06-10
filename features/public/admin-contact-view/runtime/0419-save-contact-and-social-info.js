// Runtime slice from daawah.js: saveContactAndSocialInfo.
function saveContactAndSocialInfo(successMessage = 'Contact and social links updated successfully!') {
    if (!hasPermission('manage_contact')) {
        showNotification('Only media/contact officers can update contact and social links.', 'warning');
        return;
    }
    const payload = getContactSettingsPayload();
    if (frontendOnly) {
        writeLocalSiteSettings(payload);
        loadAdminContact();
        loadPublicSiteSettings();
        showNotification(successMessage, 'success');
        return;
    }

    fetch('firestore-disabled-endpoint?action=updateSiteSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload(payload))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save contact settings');
        writeLocalSiteSettings(result.data?.settings || payload);
        loadAdminContact();
        loadPublicSiteSettings();
        showNotification(successMessage, 'success');
    })
    .catch(error => showNotification(error.message || 'Could not update contact settings', 'danger'));
}
