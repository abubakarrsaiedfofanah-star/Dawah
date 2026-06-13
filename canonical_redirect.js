(function () {
    var canonicalHost = 'umma-university-dawah-team.web.app';
    var localHosts = ['localhost', '127.0.0.1', 'vercel.app'];
    var isLocal = localHosts.some(host => location.hostname === host || location.hostname.endsWith('.' + host));

    if (location.protocol === 'https:' && !isLocal && location.hostname !== canonicalHost) {
        location.replace('https://' + canonicalHost + location.pathname + location.search + location.hash);
    }
})();
