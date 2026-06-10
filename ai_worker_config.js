(function () {
    const aiAllowedHosts = [
        'umma-university-da-awah-team.web.app',
        'localhost',
        '127.0.0.1'
    ];
    const canonicalHost = 'umma-university-da-awah-team.web.app';
    if (location.protocol === 'https:' && !aiAllowedHosts.includes(location.hostname)) {
        location.replace(`https://${canonicalHost}${location.pathname}${location.search}${location.hash}`);
        return;
    }
    window.DAWAAH_AI_WORKER_URL = 'https://umma-dawaah-groq-ai.abubakarrsaiedfofanah.workers.dev';
})();
