window.DawaahCloud = (() => {
    const legacyConfig = {
        url: window.DAWAAH_SUPABASE_URL || '',
        anonKey: window.DAWAAH_SUPABASE_ANON_KEY || '',
        enabledHosts: [
            'localhost',
            '127.0.0.1',
            '66ghz.com',
            'www.66ghz.com'
        ],
        realtime: true
    };
    const config = window.DAWAAH_SUPABASE_CONFIG || legacyConfig;
    const enabledHosts = config.enabledHosts || [];
    const enabledByHost = enabledHosts.length
        ? enabledHosts.some(host => location.hostname === host || location.hostname.endsWith(`.${host}`))
        : true;
    const hasPlaceholderConfig = /YOUR_|YOUR-|PROJECT_REF|ANON_PUBLIC_KEY/i.test(`${config.url || ''} ${config.anonKey || ''}`);
    const enabled = Boolean(config.url && config.anonKey && enabledByHost && !hasPlaceholderConfig);
    const sdkUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    let sdkPromise = null;
    let clientPromise = null;

    function loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts).find(script => script.src === src);
            if (existing) {
                if (existing.dataset.loaded === '1') return resolve();
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                script.dataset.loaded = '1';
                resolve();
            };
            script.onerror = () => reject(new Error(`Could not load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function ensureSdk() {
        if (!enabled) throw new Error('Supabase is not configured for this host.');
        if (sdkPromise) return sdkPromise;
        sdkPromise = loadExternalScript(sdkUrl).then(() => {
            if (!window.supabase?.createClient) throw new Error('Supabase SDK is unavailable.');
            return window.supabase;
        });
        return sdkPromise;
    }

    async function client() {
        if (clientPromise) return clientPromise;
        clientPromise = ensureSdk().then(supabase => supabase.createClient(config.url, config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: { eventsPerSecond: 8 }
            }
        }));
        return clientPromise;
    }

    async function session() {
        if (!enabled) return null;
        const db = await client();
        const { data, error } = await db.auth.getSession();
        if (error) throw error;
        const authSession = data?.session || null;
        if (authSession) saveAuthSession(authSession);
        return authSession;
    }

    function saveAuthSession(authSession) {
        const user = authSession?.user || authSession;
        const accessToken = authSession?.access_token || '';
        const refreshToken = authSession?.refresh_token || '';
        const expiresAt = authSession?.expires_at ? String(authSession.expires_at * 1000) : '';
        const email = user?.email || '';
        const uid = user?.id || '';
        if (accessToken) {
            sessionStorage.setItem('dawaahFirebaseIdToken', accessToken);
            localStorage.setItem('dawaahFirebaseIdToken', accessToken);
        }
        if (refreshToken) {
            sessionStorage.setItem('dawaahFirebaseRefreshToken', refreshToken);
            localStorage.setItem('dawaahFirebaseRefreshToken', refreshToken);
        }
        if (expiresAt) {
            sessionStorage.setItem('dawaahFirebaseTokenExpiresAt', expiresAt);
            localStorage.setItem('dawaahFirebaseTokenExpiresAt', expiresAt);
        }
        if (email) {
            sessionStorage.setItem('dawaahFirebaseEmail', email);
            localStorage.setItem('dawaahFirebaseEmail', email);
        }
        if (uid) {
            sessionStorage.setItem('dawaahFirebaseUid', uid);
            localStorage.setItem('dawaahFirebaseUid', uid);
        }
        return authSession;
    }

    function clearAuthSession() {
        [
            'dawaahFirebaseIdToken',
            'dawaahFirebaseRefreshToken',
            'dawaahFirebaseTokenExpiresAt',
            'dawaahFirebaseEmail',
            'dawaahFirebaseUid'
        ].forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        });
    }

    function storedAuthValue(key) {
        return sessionStorage.getItem(key) || localStorage.getItem(key) || '';
    }

    function hasAuthSession() {
        return Boolean(storedAuthValue('dawaahFirebaseIdToken') || storedAuthValue('dawaahFirebaseRefreshToken'));
    }

    function currentUid() {
        return storedAuthValue('dawaahFirebaseUid');
    }

    function currentEmail() {
        return storedAuthValue('dawaahFirebaseEmail');
    }

    function requireEmail(identifier) {
        const email = String(identifier || '').trim();
        if (!email || !email.includes('@')) throw new Error('Use your registered email address.');
        return email;
    }

    function collectionName(name) {
        return String(name || '').trim();
    }

    function recordFromRow(row) {
        return {
            ...(row?.data || {}),
            id: row?.data?.id || row?.id,
            firebaseDocId: row?.id,
            supabaseId: row?.id
        };
    }

    async function registerEmail(email, password) {
        const db = await client();
        const { data, error } = await db.auth.signUp({ email: requireEmail(email), password });
        if (error) throw error;
        return saveAuthSession(data.session || data.user || {});
    }

    async function loginEmail(email, password) {
        const db = await client();
        const { data, error } = await db.auth.signInWithPassword({ email: requireEmail(email), password });
        if (error) throw error;
        return saveAuthSession(data.session);
    }

    async function ensureRealtimeAuth(email, password) {
        const authSession = await session().catch(() => null);
        if (authSession?.user?.email === email) return authSession.user;
        if (!email || !password) return authSession?.user || null;
        await loginEmail(email, password);
        return (await session())?.user || null;
    }

    async function sendPasswordResetEmail(email) {
        const db = await client();
        const { error } = await db.auth.resetPasswordForEmail(requireEmail(email));
        if (error) throw error;
        return { email };
    }

    async function logout() {
        if (enabled) {
            const db = await client().catch(() => null);
            await db?.auth.signOut().catch(() => {});
        }
        clearAuthSession();
    }

    async function updateCurrentPassword(password) {
        const db = await client();
        const { data, error } = await db.auth.updateUser({ password });
        if (error) throw error;
        return data?.user || {};
    }

    async function loadStore(key) {
        const db = await client();
        const { data, error } = await db.from('app_stores').select('data').eq('key', key).maybeSingle();
        if (error) throw error;
        const value = data?.data;
        if (value && typeof value === 'object' && 'items' in value) return value.items || [];
        if (value && typeof value === 'object' && 'settings' in value) return value.settings || {};
        return value || [];
    }

    async function saveStore(key, items) {
        const db = await client();
        const payload = { key, data: Array.isArray(items) ? { items } : items, updated_at: new Date().toISOString() };
        const { error } = await db.from('app_stores').upsert(payload, { onConflict: 'key' });
        if (error) throw error;
        return items;
    }

    async function loadStores(keys) {
        const pairs = await Promise.all((keys || []).map(async key => [key, await loadStore(key).catch(() => [])]));
        return Object.fromEntries(pairs);
    }

    async function loadSiteSettings() {
        return loadStore('siteSettings');
    }

    async function saveSiteSettings(settings) {
        const db = await client();
        const payload = { key: 'siteSettings', data: { settings }, updated_at: new Date().toISOString() };
        const { error } = await db.from('app_stores').upsert(payload, { onConflict: 'key' });
        if (error) throw error;
        return settings;
    }

    async function createRecord(collection, record) {
        const db = await client();
        const { data, error } = await db
            .from('app_records')
            .insert({ collection: collectionName(collection), data: record || {} })
            .select()
            .single();
        if (error) throw error;
        return recordFromRow(data);
    }

    async function listRecords(collection) {
        const db = await client();
        const { data, error } = await db
            .from('app_records')
            .select('*')
            .eq('collection', collectionName(collection))
            .order('created_at', { ascending: false })
            .limit(1000);
        if (error) throw error;
        return (data || []).map(recordFromRow);
    }

    async function loadRecord(collection, docId) {
        const db = await client();
        const { data, error } = await db
            .from('app_records')
            .select('*')
            .eq('collection', collectionName(collection))
            .eq('id', docId)
            .maybeSingle();
        if (error) throw error;
        return data ? recordFromRow(data) : null;
    }

    async function updateRecord(collection, docId, patch) {
        const current = (await loadRecord(collection, docId)) || {};
        const nextData = { ...current, ...(patch || {}) };
        delete nextData.firebaseDocId;
        delete nextData.supabaseId;
        const db = await client();
        const { data, error } = await db
            .from('app_records')
            .update({ data: nextData, updated_at: new Date().toISOString() })
            .eq('collection', collectionName(collection))
            .eq('id', docId)
            .select()
            .single();
        if (error) throw error;
        return recordFromRow(data);
    }

    async function watchStores(keys, onChange, onError) {
        if (!config.realtime || !Array.isArray(keys) || !keys.length) return () => {};
        const db = await client();
        const channel = db.channel(`app_stores:${keys.join(',')}`);
        keys.forEach(key => {
            channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'app_stores',
                filter: `key=eq.${key}`
            }, payload => {
                const value = payload.new?.data || {};
                onChange?.(key, value.items || value.settings || value);
            });
        });
        channel.subscribe(status => {
            if (status === 'CHANNEL_ERROR') onError?.(new Error('Supabase realtime store channel failed.'));
        });
        return () => db.removeChannel(channel);
    }

    async function watchCollection(collection, onChange, onError) {
        if (!config.realtime) return () => {};
        const db = await client();
        const name = collectionName(collection);
        const channel = db.channel(`app_records:${name}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'app_records',
                filter: `collection=eq.${name}`
            }, async () => onChange?.(await listRecords(name), name))
            .subscribe(status => {
                if (status === 'CHANNEL_ERROR') onError?.(new Error(`Supabase realtime collection failed for ${name}.`), name);
            });
        return () => db.removeChannel(channel);
    }

    async function watchDocuments(collection, docIds, onChange, onError) {
        if (!config.realtime || !Array.isArray(docIds) || !docIds.length) return () => {};
        const db = await client();
        const name = collectionName(collection);
        const channel = db.channel(`app_documents:${name}:${docIds.join(',')}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'app_records',
                filter: `collection=eq.${name}`
            }, payload => {
                if (docIds.includes(payload.new?.id)) onChange?.(recordFromRow(payload.new), name);
            })
            .subscribe(status => {
                if (status === 'CHANNEL_ERROR') onError?.(new Error(`Supabase realtime document failed for ${name}.`), name);
            });
        return () => db.removeChannel(channel);
    }

    async function createAuditLog(action, details = {}) {
        if (!enabled || !hasAuthSession()) return null;
        return createRecord('auditLogs', {
            action,
            details,
            uid: currentUid(),
            email: currentEmail(),
            createdAt: new Date().toISOString()
        });
    }

    async function saveBackupMetadata(metadata) {
        return createRecord('backupMetadata', { ...metadata, savedAt: new Date().toISOString() });
    }

    async function saveReceiptVerification(receipt) {
        return createRecord('receiptVerifications', receipt);
    }

    async function loadReceiptVerification(receiptNumber) {
        const records = await listRecords('receiptVerifications');
        return records.find(item => String(item.receiptNumber || item.receipt_number || '').toLowerCase() === String(receiptNumber || '').toLowerCase()) || null;
    }

    async function saveMemberVerification(member) {
        return createRecord('memberVerifications', member);
    }

    async function loadPublicMemberVerification(identifier) {
        const needle = String(identifier || '').toLowerCase();
        const records = await listRecords('memberVerifications');
        return records.find(item => [item.id, item.studentId, item.email, item.registrationNumber].some(value => String(value || '').toLowerCase() === needle)) || null;
    }

    async function saveMembershipCard(card) {
        return createRecord('membershipCards', card);
    }

    async function loadPublicMembershipCard(cardId) {
        return loadRecord('membershipCards', cardId);
    }

    async function saveMember(member) {
        return createRecord('members', {
            ...member,
            authUid: member?.authUid || currentUid(),
            authEmail: member?.authEmail || currentEmail()
        });
    }

    async function updateMemberProfile(uid, member) {
        const records = await listRecords('members');
        const found = records.find(item => item.authUid === uid || item.uid === uid || item.id === uid);
        return found?.firebaseDocId ? updateRecord('members', found.firebaseDocId, member) : saveMember({ ...member, authUid: uid });
    }

    async function loadMyMember() {
        const uid = currentUid();
        const email = currentEmail();
        const records = await listRecords('members');
        return records.find(item => item.authUid === uid || item.uid === uid || item.authEmail === email || item.email === email) || null;
    }

    async function listMembers() {
        return listRecords('members');
    }

    async function saveAdminRoleForUid(uid, adminRole) {
        const db = await client();
        const payload = { uid, data: { ...adminRole, uid }, updated_at: new Date().toISOString() };
        const { error } = await db.from('admin_roles').upsert(payload, { onConflict: 'uid' });
        if (error) throw error;
        return payload.data;
    }

    async function listAdminRoles() {
        const db = await client();
        const { data, error } = await db.from('admin_roles').select('*');
        if (error) throw error;
        return (data || []).map(row => ({ ...(row.data || {}), uid: row.uid, firebaseDocId: row.uid }));
    }

    async function deleteAdminRole(uid) {
        const db = await client();
        const { error } = await db.from('admin_roles').delete().eq('uid', uid);
        if (error) throw error;
        return true;
    }

    async function loadMyAdminRole() {
        const uid = currentUid();
        if (!uid) return null;
        const db = await client();
        const { data, error } = await db.from('admin_roles').select('*').eq('uid', uid).maybeSingle();
        if (error) throw error;
        return data ? { ...(data.data || {}), uid: data.uid, firebaseDocId: data.uid } : null;
    }

    async function saveAdminRole(admin) {
        return saveAdminRoleForUid(admin?.uid || currentUid(), admin);
    }

    async function createSecondaryAdminAuthUser(email, password, displayName = '') {
        const result = await registerEmail(email, password);
        return {
            uid: currentUid() || result?.user?.id || '',
            email: requireEmail(email),
            displayName
        };
    }

    return {
        enabled,
        hasAuthSession,
        currentUid,
        currentEmail,
        registerEmail,
        loginEmail,
        ensureRealtimeAuth,
        sendPasswordResetEmail,
        logout,
        createSecondaryAdminAuthUser,
        saveAdminRoleForUid,
        listAdminRoles,
        deleteAdminRole,
        updateCurrentPassword,
        loadStore,
        saveStore,
        loadStores,
        loadSiteSettings,
        saveSiteSettings,
        createRecord,
        listRecords,
        loadRecord,
        updateRecord,
        watchStores,
        watchCollection,
        watchDocuments,
        createAuditLog,
        saveBackupMetadata,
        saveReceiptVerification,
        loadReceiptVerification,
        saveMemberVerification,
        loadPublicMemberVerification,
        saveMembershipCard,
        loadPublicMembershipCard,
        saveMember,
        updateMemberProfile,
        loadMyMember,
        listMembers,
        loadMyAdminRole,
        saveAdminRole
    };
})();
