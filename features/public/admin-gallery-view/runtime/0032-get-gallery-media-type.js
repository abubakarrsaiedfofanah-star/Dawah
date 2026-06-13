// Runtime slice from daawah.js: getGalleryMediaType.
function getGalleryMediaType(url, file = null) {
    const fileType = (file?.type || '').toLowerCase();
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('image/')) return 'image';
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') || /^data:video\//i.test(url || '') ? 'video' : 'image';
}
