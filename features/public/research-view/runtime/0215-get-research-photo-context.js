// Runtime slice from daawah.js: getResearchPhotoContext.
function getResearchPhotoContext() {
    const file = getResearchPhotoFile();
    if (!file) return '';
    return `\n\nPhoto attached for research context: ${file.name || 'camera photo'} (${file.type || 'image'}, ${Math.max(1, Math.round(file.size / 1024))} KB). Describe what should be checked from the photo in the question.`;
}
