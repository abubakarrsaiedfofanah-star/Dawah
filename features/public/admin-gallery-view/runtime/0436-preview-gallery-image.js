// Runtime slice from daawah.js: previewGalleryImage.
function previewGalleryImage() {
    const imageInput = document.getElementById('galleryImage');
    const preview = document.getElementById('galleryImagePreview');
    const videoPreview = document.getElementById('galleryVideoPreview');

    if (imageInput && imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        if (!validateUploadFile(file, getGalleryUploadLimitKey(file))) {
            imageInput.value = '';
            preview.src = '';
            preview.classList.add('d-none');
            if (videoPreview) {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
            }
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaType = getGalleryMediaType(e.target.result, file);
            if (mediaType === 'video') {
                preview.src = '';
                preview.classList.add('d-none');
                videoPreview.src = e.target.result;
                videoPreview.classList.remove('d-none');
            } else {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            }
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.classList.add('d-none');
        videoPreview.pause();
        videoPreview.removeAttribute('src');
        videoPreview.load();
        videoPreview.classList.add('d-none');
    }
}
