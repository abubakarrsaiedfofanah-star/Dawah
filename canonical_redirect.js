(function () {
    var canonicalHost = window.DAWAH_CANONICAL_HOST || '';
    var localHosts = ['localhost', '127.0.0.1', 'vercel.app'];
    var isLocal = localHosts.some(host => location.hostname === host || location.hostname.endsWith('.' + host));

    if (canonicalHost && location.protocol === 'https:' && !isLocal && location.hostname !== canonicalHost) {
        location.replace('https://' + canonicalHost + location.pathname + location.search + location.hash);
    }
})();
