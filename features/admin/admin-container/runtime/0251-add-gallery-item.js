// Runtime slice from admin.js: addGalleryItem.
function addGalleryItem() {
    const title = document.getElementById('galleryTitle').value.trim();
    const description = document.getElementById('galleryDescription').value.trim();
    const imageUrl = document.getElementById('galleryImageUrl').value.trim();
    const imageInput = document.getElementById('galleryImageUpload');
    
    if (!title || (!imageUrl && (!imageInput || !imageInput.files || imageInput.files.length === 0))) {
        showNotification('Title and an uploaded image or image URL are required', 'warning');
        return;
    }

    if (imageInput && imageInput.files && imageInput.files.length > 0) {
        if (!useStaticAdminApi) {
            saveGalleryItemData(title, description, '', getGalleryMediaType('', imageInput.files[0]), imageInput.files[0]);
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            saveGalleryItemData(title, description, e.target.result, getGalleryMediaType(e.target.result, imageInput.files[0]));
        };
        reader.readAsDataURL(imageInput.files[0]);
        return;
    }

    saveGalleryItemData(title, description, imageUrl, getGalleryMediaType(imageUrl));
}
