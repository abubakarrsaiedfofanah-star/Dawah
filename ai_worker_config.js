(function () {
    const aiAllowedHosts = [
        'umma-university-dawah-team.web.app', // Supabase: AI allowed hosts
        'localhost',
        '127.0.0.1',
        'vercel.app'
    ];
    const canonicalHost = 'umma-university-dawah-team.web.app';
    if (location.protocol === 'https:' && !aiAllowedHosts.includes(location.hostname)) {
        location.replace(`https://${canonicalHost}${location.pathname}${location.search}${location.hash}`);
        return;
    }
    window.DAWAH_AI_WORKER_URL = 'https://umma-dawah-groq-ai.abubakarrsaiedfofanah.workers.dev'; // Supabase: AI Worker URL
})();
