// Runtime slice from admin.js: runSystemHealthCheck.
async function runSystemHealthCheck(options = {}) {
    const list = document.getElementById('systemHealthList');
    if (!list) return;

    const checkingItems = [
        { name: 'App Version', icon: 'fa-code-branch', status: 'checking', detail: 'Reading deployed version file.' },
        { name: 'Install App Files', icon: 'fa-mobile-screen-button', status: 'checking', detail: 'Checking manifest and service worker.' },
        { name: 'Supabase Data', icon: 'fa-database', status: 'checking', detail: 'Checking shared database access.' },
        { name: 'Security Setup', icon: 'fa-shield-halved', status: 'checking', detail: 'Checking hosted auth and browser configuration.' },
        { name: 'Backup Status', icon: 'fa-file-shield', status: 'checking', detail: 'Checking recent database backup record.' },
        { name: 'Audit Trail', icon: 'fa-clipboard-list', status: 'checking', detail: 'Checking immutable audit logging.' },
        { name: 'Research AI', icon: 'fa-robot', status: 'checking', detail: 'Checking Cloudflare Worker health.' },
        { name: 'Receipt Verify', icon: 'fa-receipt', status: 'checking', detail: 'Checking public receipt verification page.' },
        { name: 'Member Verify', icon: 'fa-id-card', status: 'checking', detail: 'Checking public member verification page.' }
    ];
    renderSystemHealth(checkingItems, true);

    const results = await Promise.all([
        fetchHealthJson('version.json?v=' + Date.now())
            .then(version => ({
                name: 'App Version',
                icon: 'fa-code-branch',
                status: 'ok',
                detail: `${version.version || 'Unknown version'} - ${version.message || 'version file loaded'}`
            }))
            .catch(error => ({ name: 'App Version', icon: 'fa-code-branch', status: 'fail', detail: error.message || 'Version file not reachable.' })),
        Promise.all([
            fetchHealthJson('manifest.webmanifest?v=' + Date.now()),
            fetchHealthText('service-worker.js?v=' + Date.now())
        ])
            .then(([manifest, worker]) => ({
                name: 'Install App Files',
                icon: 'fa-mobile-screen-button',
                status: manifest.name && worker.includes('DAWAAH_CACHE') ? 'ok' : 'warn',
                detail: manifest.name ? `${manifest.name} install files are reachable.` : 'Manifest loaded but app name is missing.'
            }))
            .catch(error => ({ name: 'Install App Files', icon: 'fa-mobile-screen-button', status: 'fail', detail: error.message || 'Manifest or service worker missing.' })),
        Promise.resolve()
            .then(async () => {
                if (!window.SupabaseBackend?.enabled) {
                    return { name: 'Supabase Data', icon: 'fa-database', status: 'warn', detail: 'Supabase mode is not enabled on this host.' };
                }
                if (!window.SupabaseBackend.hasAuthSession()) {
                    return { name: 'Supabase Data', icon: 'fa-database', status: 'warn', detail: 'Supabase is configured. Login once to test private data access.' };
                }
                const stores = await window.SupabaseBackend.loadStores(['adminAnnouncements', 'adminEvents']);
                return {
                    name: 'Supabase Data',
                    icon: 'fa-database',
                    status: 'ok',
                    detail: `Private Supabase read worked (${Object.keys(stores).length} store group(s)).`
                };
            })
            .catch(error => ({ name: 'Supabase Data', icon: 'fa-database', status: 'fail', detail: error.message || 'Supabase check failed.' })),
        Promise.resolve()
            .then(() => ({
                name: 'Security Setup',
                icon: 'fa-shield-halved',
                status: window.SupabaseBackend?.enabled ? 'ok' : 'warn',
                detail: window.SupabaseBackend?.enabled
                    ? 'Supabase client and hosted security helpers are loaded in this browser.'
                    : 'Supabase client is not active on this host.'
            })),
        Promise.resolve()
            .then(() => {
                const backup = getBackupStatus();
                return {
                    name: 'Backup Status',
                    icon: 'fa-file-shield',
                    status: backup.status,
                    detail: backup.detail
                };
            }),
        Promise.resolve()
            .then(async () => {
                if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) {
                    return { name: 'Audit Trail', icon: 'fa-clipboard-list', status: 'warn', detail: 'Login as admin to test cloud audit logging.' };
                }
                await window.SupabaseBackend.createAuditLog('systemHealthCheck', { silent: Boolean(options.silent) });
                return { name: 'Audit Trail', icon: 'fa-clipboard-list', status: 'ok', detail: 'Immutable Supabase audit log accepted a health-check entry.' };
            })
            .catch(error => ({ name: 'Audit Trail', icon: 'fa-clipboard-list', status: 'fail', detail: error.message || 'Audit logging failed.' })),
        fetchHealthJson(`${window.DAWAAH_AI_WORKER_URL || ''}/health`)
            .then(result => ({
                name: 'Research AI',
                icon: 'fa-robot',
                status: result?.data?.ok ? 'ok' : 'warn',
                detail: result?.data?.model ? `Worker online using ${result.data.model}.` : 'Worker replied, but health details were incomplete.'
            }))
            .catch(error => ({ name: 'Research AI', icon: 'fa-robot', status: 'fail', detail: error.message || 'Research AI Worker is not reachable.' })),
        fetchHealthText('verify-receipt.html?v=' + Date.now())
            .then(text => ({
                name: 'Receipt Verify',
                icon: 'fa-receipt',
                status: text.includes('receipt') || text.includes('Receipt') ? 'ok' : 'warn',
                detail: 'Public receipt verification page is reachable.'
            }))
            .catch(error => ({ name: 'Receipt Verify', icon: 'fa-receipt', status: 'fail', detail: error.message || 'Receipt verification page failed.' })),
        fetchHealthText('verify-member.html?v=' + Date.now())
            .then(text => ({
                name: 'Member Verify',
                icon: 'fa-id-card',
                status: text.includes('member') || text.includes('Member') ? 'ok' : 'warn',
                detail: 'Public member verification page is reachable.'
            }))
            .catch(error => ({ name: 'Member Verify', icon: 'fa-id-card', status: 'fail', detail: error.message || 'Member verification page failed.' }))
    ]);

    renderSystemHealth(results, false);
    if (!options.silent) {
        const failed = results.filter(item => item.status === 'fail').length;
        showNotification(failed ? 'System health check found an issue.' : 'System health check completed.', failed ? 'warning' : 'success');
    }
}
