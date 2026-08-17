// Runtime slice from daawah.js: clearGalleryForm.
function clearGalleryForm(imageInput) {
    document.getElementById('galleryTitle').value = '';
    document.getElementById('galleryDescription').value = '';
    document.getElementById('galleryIcon').value = '';
    imageInput.value = '';
    const preview = document.getElementById('galleryImagePreview');
    const videoPreview = document.getElementById('galleryVideoPreview');
    preview.src = '';
    preview.classList.add('d-none');
    if (videoPreview) {
        videoPreview.pause();
        videoPreview.removeAttribute('src');
        videoPreview.load();
        videoPreview.classList.add('d-none');
    }
}
