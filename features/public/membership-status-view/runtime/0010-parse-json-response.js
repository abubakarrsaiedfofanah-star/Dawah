// Runtime slice from daawah.js: parseJsonResponse.
function parseJsonResponse(response) {
    if (response && typeof response.text === 'function') {
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (error) {
                if (isHostingSecurityChallenge(text)) {
                    throw new Error('The free hosting security check interrupted this request. Please refresh the website once, wait for it to finish loading, then try registration again.');
                }
                const preview = text.trim().slice(0, 120) || 'empty response';
                const url = response.url || 'API request';
                const status = response.status ? `HTTP ${response.status}` : 'Invalid response';
                throw new Error(`${status} from ${url}: expected JSON but received ${preview}`);
            }
        });
    }
    if (response && typeof response.json === 'function') {
        return response.json();
    }
    return Promise.reject(new Error('Invalid API response'));
}
