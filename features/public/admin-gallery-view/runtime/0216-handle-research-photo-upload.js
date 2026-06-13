// Runtime slice from daawah.js: handleResearchPhotoUpload.
function handleResearchPhotoUpload() {
    const file = getResearchPhotoFile();
    const preview = document.getElementById('researchPhotoPreview');
    const image = document.getElementById('researchPhotoPreviewImage');
    const name = document.getElementById('researchPhotoName');
    if (!file || !preview || !image) return;
    if (!String(file.type || '').startsWith('image/')) {
        showNotification('Please choose an image from camera or gallery.', 'warning');
        clearResearchPhoto();
        return;
    }
    if (file.size > uploadLimits.galleryImage.bytes) {
        showNotification(`Photo must be ${uploadLimits.galleryImage.label} or smaller.`, 'warning');
        clearResearchPhoto();
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        image.src = event.target?.result || '';
        if (name) name.textContent = file.name || 'Camera photo attached';
        preview.classList.remove('d-none');
        const status = document.getElementById('researchStatus');
        if (status) status.textContent = 'Photo attached. Type what you want the Research AI to check, then click Research.';
    };
    reader.onerror = () => showNotification('Could not read the selected photo.', 'danger');
    reader.readAsDataURL(file);
}
