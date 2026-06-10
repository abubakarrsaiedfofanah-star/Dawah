// Runtime slice from daawah.js: removeGalleryItem.
function removeGalleryItem(index) {
    if (!confirm('Are you sure you want to remove this gallery item?')) return;

    if (!frontendOnly) {
        fetch('firestore-disabled-endpoint?action=deleteGalleryItem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gallery_id: index })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Error removing gallery item');
            }
            loadAdminGallery();
            loadGalleryContent();
            showNotification('Gallery item removed!', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification(error.message || 'Error removing gallery item', 'danger');
        });
        return;
    }

    let galleryItems = readList('galleryItems');
    galleryItems.splice(index, 1);
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    logLocalRoleActivity('deleteGalleryItem', { gallery_id: index });

    loadAdminGallery();
    loadGalleryContent(); // Refresh landing page gallery
    showNotification('Gallery item removed!', 'success');
}
