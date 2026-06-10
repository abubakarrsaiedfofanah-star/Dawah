// Runtime slice from daawah.js: research photo controls.
function getResearchPhotoFile() {
    return document.getElementById('researchPhotoUpload')?.files?.[0] || null;
}

function getResearchPhotoContext() {
    const file = getResearchPhotoFile();
    if (!file) return '';
    return `\n\nPhoto attached for research context: ${file.name || 'camera photo'} (${file.type || 'image'}, ${Math.max(1, Math.round(file.size / 1024))} KB). Describe what should be checked from the photo in the question.`;
}

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

function clearResearchPhoto() {
    const input = document.getElementById('researchPhotoUpload');
    const preview = document.getElementById('researchPhotoPreview');
    const image = document.getElementById('researchPhotoPreviewImage');
    if (input) input.value = '';
    if (image) image.src = '';
    preview?.classList.add('d-none');
}

function clearResearchResult() {
    latestResearchItem = null;
    const result = document.getElementById('researchResult');
    if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    const status = document.getElementById('researchStatus');
    if (status) status.textContent = 'Result cleared. You can run a new research question.';
    showNotification('Research result cleared.', 'success');
}
