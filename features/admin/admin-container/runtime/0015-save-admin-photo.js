// Runtime slice from admin.js: saveAdminPhoto.
function saveAdminPhoto() {
    const input = document.getElementById('adminPhotoInput');
    const file = input?.files?.[0];
    if (!file) {
        showNotification('Choose a photo first.', 'warning');
        return;
    }
    if (!file.type.startsWith('image/')) {
        showNotification('Please choose a valid image file.', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('admin_photo', file);
    fetch(`${API_URL}?action=updateAdminPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save admin photo');
        setAdminUser(result.data);
        if (input) input.value = '';
        showNotification('Admin photo saved.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not save admin photo', 'danger'));
}
