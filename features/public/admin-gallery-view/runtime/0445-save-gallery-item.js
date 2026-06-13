// Runtime slice from daawah.js: saveGalleryItem.
function saveGalleryItem() {
    const title = document.getElementById('galleryTitle').value.trim();
    const description = document.getElementById('galleryDescription').value.trim();
    const icon = document.getElementById('galleryIcon').value.trim() || 'fas fa-images';
    const imageInput = document.getElementById('galleryImage');

    if (!title || !description || !imageInput || !imageInput.files || imageInput.files.length === 0) {
        showNotification('Please fill in all media fields and choose an image or video.', 'warning');
        return;
    }

    const file = imageInput.files[0];
    if (!validateUploadFile(file, getGalleryUploadLimitKey(file))) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        const mediaType = getGalleryMediaType(imageData, file);

        if (!frontendOnly) {
            fetch('supabase-required-endpoint?action=addGalleryItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    image_url: imageData,
                    media_type: mediaType,
                    uploaded_by: currentUser?.id || 0
                })
            })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Error saving gallery item');
                }

                clearGalleryForm(imageInput);
                bootstrap.Modal.getInstance(document.getElementById('addGalleryModal')).hide();
                loadAdminGallery();
                loadGalleryContent();
                showNotification('Media item added successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification(error.message || 'Error saving media item', 'danger');
            });
            return;
        }

        let galleryItems = readList('galleryItems');

        galleryItems.push({
            title: title,
            description: description,
            icon: icon,
            imageData: imageData,
            imageUrl: imageData,
            media_type: mediaType
        });

        localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
        logLocalRoleActivity('addGalleryItem', { title, media_type: mediaType });

        clearGalleryForm(imageInput);

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('addGalleryModal')).hide();

        // Refresh gallery display
        loadAdminGallery();
        loadGalleryContent(); // Refresh landing page gallery

        showNotification('Media item added successfully!', 'success');
    };
    reader.readAsDataURL(file);
}
