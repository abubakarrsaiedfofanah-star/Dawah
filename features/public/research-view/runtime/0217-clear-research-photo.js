// Runtime slice from daawah.js: clearResearchPhoto.
function clearResearchPhoto() {
    const input = document.getElementById('researchPhotoUpload');
    const preview = document.getElementById('researchPhotoPreview');
    const image = document.getElementById('researchPhotoPreviewImage');
    if (input) input.value = '';
    if (image) image.src = '';
    preview?.classList.add('d-none');
}
