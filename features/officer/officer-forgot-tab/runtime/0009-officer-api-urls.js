// Runtime slice from officer.js: officerApiUrls.
function officerApiUrls(endpoint) {
    const cleanEndpoint = String(endpoint).replace(/^\/+/, '');
    if (location.protocol === 'file:') {
        return OFFICER_LOCAL_API_BASES.map(base => base + cleanEndpoint);
    }
    return [cleanEndpoint];
}
