// Runtime slice from admin.js: getGalleryMediaType.
function getGalleryMediaType(url, file = null) {
    const type = (file?.type || '').toLowerCase();
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('image/')) return 'image';
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') ? 'video' : 'image';
}
