// Runtime slice from daawah.js: handlePassportPhotoFileChange.
function handlePassportPhotoFileChange(event) {
    const file = event.target.files?.[0];
    if (file && !validateUploadFile(file, 'profilePhoto')) {
        event.target.value = '';
    }
}
