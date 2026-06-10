(function () {
    var canonicalHost = 'umma-university-da-awah-team.web.app';
    var localHosts = ['localhost', '127.0.0.1'];
    var isLocal = localHosts.indexOf(location.hostname) !== -1;

    if (location.protocol === 'https:' && !isLocal && location.hostname !== canonicalHost) {
        location.replace('https://' + canonicalHost + location.pathname + location.search + location.hash);
    }
})();
