// Runtime slice from officer.js: fetchOfficerApi.
function fetchOfficerApi(endpoint, options = {}) {
    const urls = officerApiUrls(endpoint);
    let lastError = null;
    const tryNext = index => {
        if (index >= urls.length) {
            throw new Error(lastError?.message && lastError.message !== 'Failed to fetch' // Supabase: Changed from Supabase backend to generic.
                ? lastError.message
                : 'Could not reach the backend service. Please check your connection or try again later.');
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
