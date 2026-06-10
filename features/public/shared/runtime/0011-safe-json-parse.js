// Runtime slice from daawah.js: safeJsonParse.
function safeJsonParse(rawValue, fallback = null, label = 'stored value') {
    if (rawValue === null || rawValue === undefined || rawValue === '') return fallback;
    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.error(`Could not parse ${label}; using fallback.`, error);
        return fallback;
    }
}
