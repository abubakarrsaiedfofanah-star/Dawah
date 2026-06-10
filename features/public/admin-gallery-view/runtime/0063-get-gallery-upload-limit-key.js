// Runtime slice from daawah.js: getGalleryUploadLimitKey.
function getGalleryUploadLimitKey(file) {
    return file?.type?.startsWith('video/') ? 'galleryVideo' : 'galleryImage';
}
