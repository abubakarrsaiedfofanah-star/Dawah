// Runtime slice from officer.js: parseJsonResponse.
function parseJsonResponse(response) {
    return response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (error) {
            if (/src=["']\/aes\.js["']/i.test(text) && /document\.cookie=["']__test=/i.test(text)) {
                throw new Error('The free hosting security check interrupted this request. Please refresh the website once, wait for it to finish loading, then try again.');
            }
            throw new Error(text || 'Invalid server response');
        }
    });
}
