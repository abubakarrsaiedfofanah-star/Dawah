// Runtime slice from admin.js: removeAdminPhoto.
function removeAdminPhoto() {
    const formData = new FormData();
    formData.append('remove_photo', '1');
    fetch(`${API_URL}?action=updateAdminPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not remove admin photo');
        setAdminUser(result.data);
        showNotification('Admin photo removed.', 'info');
    })
    .catch(error => showNotification(error.message || 'Could not remove admin photo', 'danger'));
}
