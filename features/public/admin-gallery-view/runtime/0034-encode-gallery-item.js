// Runtime slice from daawah.js: encodeGalleryItem.
function encodeGalleryItem(item) {
    const mediaUrl = item.image_url || item.imageData || item.imageUrl || '';
    return encodeURIComponent(JSON.stringify({
        title: item.title || '',
        description: item.description || '',
        media_url: mediaUrl,
        media_type: item.media_type || getGalleryMediaType(mediaUrl)
    }));
}
