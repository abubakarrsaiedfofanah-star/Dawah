// Runtime slice from daawah.js: isReceiptSignatureImage.
function isReceiptSignatureImage(value) {
    return /^data:image\/(png|jpeg|webp);base64,/i.test(String(value || ''));
}
