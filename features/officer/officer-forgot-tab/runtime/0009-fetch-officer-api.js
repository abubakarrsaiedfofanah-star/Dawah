// Runtime slice from officer.js: fetchOfficerApi.
function fetchOfficerApi(endpoint, options = {}) {
    const urls = officerApiUrls(endpoint);
    let lastError = null;
    const tryNext = index => {
        if (index >= urls.length) {
            throw new Error(lastError?.message && lastError.message !== 'Failed to fetch'
                ? lastError.message
                : 'Could not reach the Firebase backend. Open the site through XAMPP/PHP or start the local PHP server, then request the reset code again.');
        }
        return fetch(urls[index], options)
            .then(response => parseJsonResponse(response))
            .catch(error => {
                lastError = error;
                return tryNext(index + 1);
            });
    };
    return tryNext(0);
}
