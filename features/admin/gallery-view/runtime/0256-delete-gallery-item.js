// Runtime slice from admin.js: deleteGalleryItem.
function deleteGalleryItem(galleryId) {
    if (!confirm('Delete this gallery item?')) return;
    
    fetch(`${API_URL}?action=deleteGalleryItem`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gallery_id: galleryId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Gallery item deleted!', 'success');
            loadGallery();
            loadGalleryCount();
        } else {
            showNotification('Error deleting gallery item', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting gallery item', 'danger');
    });
}
