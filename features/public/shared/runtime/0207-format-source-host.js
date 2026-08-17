// Runtime slice from daawah.js: formatSourceHost.
function formatSourceHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
        return 'source';
    }
}
