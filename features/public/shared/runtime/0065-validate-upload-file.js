// Runtime slice from daawah.js: validateUploadFile.
function validateUploadFile(file, limitKey) {
    if (!file || !uploadLimits[limitKey]) return true;
    const limit = uploadLimits[limitKey];
    const allowed = limit.types.some(type => type.endsWith('/') ? file.type.startsWith(type) : file.type === type);
    if (!allowed) {
        showNotification('Please choose a supported file type.', 'warning');
        return false;
    }
    if (file.size > limit.bytes) {
        showNotification(`File is too large. Maximum allowed size is ${limit.label}.`, 'warning');
        return false;
    }
    return true;
}
