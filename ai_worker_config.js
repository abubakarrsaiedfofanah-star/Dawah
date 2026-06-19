(function () {
    const aiAllowedHosts = [
        'localhost',
        '127.0.0.1',
        'vercel.app'
    ];
    const isAllowedHost = aiAllowedHosts.some(host => location.hostname === host || location.hostname.endsWith(`.${host}`));
    if (location.protocol === 'https:' && !isAllowedHost) {
        return;
    }
    window.DAWAH_AI_WORKER_URL = 'https://umma-dawah-groq-ai.abubakarrsaiedfofanah.workers.dev'; // Supabase: AI Worker URL
})();
