// Runtime slice from admin.js: saveGalleryItemData.
function saveGalleryItemData(title, description, imageUrl, mediaType = 'image', mediaFile = null) {
    const body = mediaFile ? new FormData() : JSON.stringify({
        title: title,
        description: description,
        image_url: imageUrl,
        media_type: mediaType,
        uploaded_by: currentAdmin.id || 0
    });
    const headers = mediaFile ? {} : { 'Content-Type': 'application/json' };

    if (mediaFile) {
        body.append('title', title);
        body.append('description', description);
        body.append('image_url', imageUrl);
        body.append('media_type', mediaType);
        body.append('uploaded_by', currentAdmin.id || 0);
        body.append('gallery_media', mediaFile);
    }
    
    fetch(`${API_URL}?action=addGalleryItem`, {
        method: 'POST',
        headers: headers,
        body: body
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Gallery item added successfully!', 'success');
            document.getElementById('galleryTitle').value = '';
            document.getElementById('galleryDescription').value = '';
            document.getElementById('galleryImageUrl').value = '';
            const imageInput = document.getElementById('galleryImageUpload');
            const preview = document.getElementById('galleryImagePreview');
            const videoPreview = document.getElementById('galleryVideoPreview');
            if (imageInput) imageInput.value = '';
            if (preview) {
                preview.src = '';
                preview.classList.add('d-none');
            }
            if (videoPreview) {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
            }
            loadGallery();
            loadGalleryCount();
        } else {
            showNotification('Error adding gallery item: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding gallery item', 'danger');
    });
}
