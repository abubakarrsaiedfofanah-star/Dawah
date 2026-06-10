(function() {
    function createDawaahSupabaseClient() {
        const url = String(window.DAWAAH_SUPABASE_URL || '').trim();
        const anonKey = String(window.DAWAAH_SUPABASE_ANON_KEY || '').trim();
        let currentSession = null;

        if (!window.supabase || !url || !anonKey || /YOUR_/.test(`${url} ${anonKey}`)) {
            return {
                enabled: false,
                message: 'Supabase is not configured yet.',
                hasAuthSession: () => false,
                currentUid: () => '',
                currentEmail: () => ''
            };
        }

        const client = window.supabase.createClient(url, anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        client.auth.getSession()
            .then(({ data }) => {
                currentSession = data?.session || null;
            })
            .catch(() => {
                currentSession = null;
            });

        client.auth.onAuthStateChange((_event, session) => {
            currentSession = session || null;
            window.dispatchEvent(new CustomEvent('dawaah:supabase-auth-changed', {
                detail: { signedIn: Boolean(currentSession) }
            }));
        });

        return {
            enabled: true,
            client,
            auth: client.auth,
            from: table => client.from(table),
            storage: client.storage,
            hasAuthSession: () => Boolean(currentSession?.user),
            currentUid: () => currentSession?.user?.id || '',
            currentEmail: () => currentSession?.user?.email || ''
        };
    }

    window.DawaahSupabase = createDawaahSupabaseClient();
})();
