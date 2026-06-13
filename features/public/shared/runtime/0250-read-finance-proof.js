// Runtime slice from daawah.js: readFinanceProof.
function readFinanceProof(inputId) {
    const input = document.getElementById(inputId);
    const file = input?.files?.[0];
    if (!file) return Promise.resolve('');
    if (!validateUploadFile(file, 'financeProof')) {
        input.value = '';
        return Promise.reject(new Error('Payment proof must be a JPG, PNG, WebP, or PDF file and 3MB or smaller.'));
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read payment proof file.'));
        reader.readAsDataURL(file);
    });
}
