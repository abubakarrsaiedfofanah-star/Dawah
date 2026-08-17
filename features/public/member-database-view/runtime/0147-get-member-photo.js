// Runtime slice from daawah.js: getMemberPhoto.
function getMemberPhoto(member) {
    return resolveAppAsset(member?.passportPhotoData || member?.photoData || member?.photo_url || member?.passport_photo || '');
}
