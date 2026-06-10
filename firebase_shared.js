window.DawaahCloud = (() => {
    const config = {
        projectId: 'umma-university-da-awah-team',
        apiKey: 'AIzaSyCNWhDeeoL9NH0d_x0xYw8rK_2Het2expY',
        appId: '1:74428554861:web:c3166ddf2388cde1ec2964',
        authDomain: 'umma-university-da-awah-team.firebaseapp.com',
        projectNumber: '74428554861',
        appCheckSiteKey: '6Lfpkv0sAAAAAFf2C1OvFQzN30_iDsmbAeKIY4Jt'
    };
    const documentsUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
    const baseUrl = `${documentsUrl}/appStores`;
    const authBaseUrl = 'https://identitytoolkit.googleapis.com/v1';
    const secureTokenBaseUrl = 'https://securetoken.googleapis.com/v1';
    const appCheckBaseUrl = 'https://firebaseappcheck.googleapis.com/v1beta';
    const enabledHosts = [
        'umma-university-da-awah-team.web.app',
        'umma-university-da-awah-team.firebaseapp.com',
        '66ghz.com',
        'www.66ghz.com'
    ];
    const enabled = enabledHosts.some(host => location.hostname === host || location.hostname.endsWith(`.${host}`));
    let appCheckScriptPromise = null;
    let appCheckTokenPromise = null;
    let appCheckToken = null;
    let appCheckTokenExpiresAt = 0;
    let firebaseSdkPromise = null;
    let realtimeAuthPromise = null;

    function encodeValue(value) {
        if (value === null || value === undefined) return { nullValue: null };
        if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
        if (typeof value === 'boolean') return { booleanValue: value };
        if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
        if (value instanceof Date) return { timestampValue: value.toISOString() };
        if (typeof value === 'object') {
            return {
                mapValue: {
                    fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)]))
                }
            };
        }
        return { stringValue: String(value) };
    }

    function decodeValue(field) {
        if (!field) return null;
        if ('stringValue' in field) return field.stringValue;
        if ('integerValue' in field) return Number(field.integerValue);
        if ('doubleValue' in field) return Number(field.doubleValue);
        if ('booleanValue' in field) return Boolean(field.booleanValue);
        if ('timestampValue' in field) return field.timestampValue;
        if ('nullValue' in field) return null;
        if ('arrayValue' in field) return (field.arrayValue.values || []).map(decodeValue);
        if ('mapValue' in field) {
            return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([key, item]) => [key, decodeValue(item)]));
        }
        return null;
    }

    function saveAuthSession(result) {
        const idToken = result?.idToken || result?.id_token || '';
        const refreshToken = result?.refreshToken || result?.refresh_token || '';
        const email = result?.email || sessionStorage.getItem('dawaahFirebaseEmail') || localStorage.getItem('dawaahFirebaseEmail') || '';
        const uid = result?.localId || result?.user_id || sessionStorage.getItem('dawaahFirebaseUid') || localStorage.getItem('dawaahFirebaseUid') || '';
        const expiresIn = Number(result?.expiresIn || result?.expires_in || 3600) || 3600;
        const expiresAt = idToken ? String(Date.now() + (expiresIn * 1000)) : '';

        if (idToken) {
            sessionStorage.setItem('dawaahFirebaseIdToken', idToken);
            localStorage.setItem('dawaahFirebaseIdToken', idToken);
            sessionStorage.setItem('dawaahFirebaseTokenExpiresAt', expiresAt);
            localStorage.setItem('dawaahFirebaseTokenExpiresAt', expiresAt);
        }
        if (refreshToken) {
            sessionStorage.setItem('dawaahFirebaseRefreshToken', refreshToken);
            localStorage.setItem('dawaahFirebaseRefreshToken', refreshToken);
        }
        if (email) {
            sessionStorage.setItem('dawaahFirebaseEmail', email);
            localStorage.setItem('dawaahFirebaseEmail', email);
        }
        if (uid) {
            sessionStorage.setItem('dawaahFirebaseUid', uid);
            localStorage.setItem('dawaahFirebaseUid', uid);
        }
        return result;
    }

    function storedAuthValue(key) {
        return sessionStorage.getItem(key) || localStorage.getItem(key) || '';
    }

    function loadAppCheckScript() {
        if (appCheckScriptPromise) return appCheckScriptPromise;
        appCheckScriptPromise = new Promise((resolve, reject) => {
            if (globalThis.grecaptcha?.enterprise) {
                resolve(globalThis.grecaptcha.enterprise);
                return;
            }
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(config.appCheckSiteKey)}`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                let attempts = 0;
                const waitForEnterprise = () => {
                    if (globalThis.grecaptcha?.enterprise?.ready && globalThis.grecaptcha.enterprise.execute) {
                        resolve(globalThis.grecaptcha.enterprise);
                        return;
                    }
                    attempts += 1;
                    if (attempts > 100) {
                        reject(new Error('App Check challenge is unavailable.'));
                        return;
                    }
                    setTimeout(waitForEnterprise, 100);
                };
                waitForEnterprise();
            };
            script.onerror = () => reject(new Error('Could not load App Check challenge.'));
            document.head.appendChild(script);
        });
        return appCheckScriptPromise;
    }

    async function getAppCheckToken() {
        if (!enabled || !config.appCheckSiteKey) return '';
        if (appCheckToken && Date.now() < appCheckTokenExpiresAt - 60000) return appCheckToken;
        if (appCheckTokenPromise) return appCheckTokenPromise;
        appCheckTokenPromise = (async () => {
            const enterprise = await loadAppCheckScript();
            if (!enterprise?.ready || !enterprise?.execute) throw new Error('App Check challenge is unavailable.');
            const recaptchaToken = await new Promise(resolve => {
                enterprise.ready(() => resolve(enterprise.execute(config.appCheckSiteKey, { action: 'firebase_app_check' })));
            });
            const appId = encodeURIComponent(config.appId);
            const response = await fetch(`${appCheckBaseUrl}/projects/${config.projectNumber}/apps/${appId}:exchangeRecaptchaEnterpriseToken?key=${config.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recaptchaEnterpriseToken: recaptchaToken })
            });
            const result = await response.json();
            if (!response.ok || !result.token) throw new Error(result.error?.message || 'Could not get App Check token.');
            appCheckToken = result.token;
            const ttlSeconds = Number(String(result.ttl || '3600s').replace('s', '')) || 3600;
            appCheckTokenExpiresAt = Date.now() + ttlSeconds * 1000;
            return appCheckToken;
        })().finally(() => {
            appCheckTokenPromise = null;
        });
        return appCheckTokenPromise;
    }

    async function appCheckHeaders() {
        const token = await getAppCheckToken().catch(error => {
            console.warn('Firebase App Check unavailable:', error);
            return '';
        });
        return token ? { 'X-Firebase-AppCheck': token } : {};
    }

    async function authRequest(endpoint, payload) {
        const response = await fetch(`${authBaseUrl}/${endpoint}?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await appCheckHeaders()) },
            body: JSON.stringify({ ...payload, returnSecureToken: true })
        });
        const result = await response.json();
        if (!response.ok || !result.idToken) {
            throw new Error(result.error?.message || 'Firebase authentication failed.');
        }
        return saveAuthSession(result);
    }

    function loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts).find(script => script.src === src);
            if (existing) {
                if (existing.dataset.loaded === '1') {
                    resolve();
                    return;
                }
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

    async function ensureFirebaseSdk() {
        if (!enabled) throw new Error('Firebase realtime is not enabled on this host.');
        if (firebaseSdkPromise) return firebaseSdkPromise;
        firebaseSdkPromise = (async () => {
            await loadExternalScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
            await loadExternalScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js');
            await loadExternalScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js');
            const firebase = globalThis.firebase;
            if (!firebase?.initializeApp || !firebase?.firestore) {
                throw new Error('Firebase realtime SDK is unavailable.');
            }
            if (!firebase.apps?.length) {
                firebase.initializeApp({
                    apiKey: config.apiKey,
                    authDomain: config.authDomain,
                    projectId: config.projectId,
                    appId: config.appId
                });
            }
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
            return firebase;
        })();
        return firebaseSdkPromise;
    }

    async function ensureRealtimeAuth(email, password) {
        if (!email || !password) return null;
        const firebase = await ensureFirebaseSdk();
        if (firebase.auth().currentUser?.email === email) return firebase.auth().currentUser;
        if (realtimeAuthPromise) return realtimeAuthPromise;
        realtimeAuthPromise = firebase.auth().signInWithEmailAndPassword(requireEmail(email), password)
            .finally(() => {
                realtimeAuthPromise = null;
            });
        return realtimeAuthPromise;
    }

    async function realtimeDb() {
        const firebase = await ensureFirebaseSdk();
        return firebase.firestore();
    }

    function normalizeStoreSnapshot(doc) {
        if (!doc.exists) return [];
        const data = doc.data() || {};
        if ('items' in data) return data.items || [];
        if ('settings' in data) return data.settings || {};
        return data || {};
    }

    async function watchStores(keys, onChange, onError) {
        if (!Array.isArray(keys) || !keys.length) return () => {};
        const db = await realtimeDb();
        const unsubs = keys.map(key => db.collection('appStores').doc(key).onSnapshot(snapshot => {
            onChange?.(key, normalizeStoreSnapshot(snapshot));
        }, error => {
            console.warn(`Realtime store listener failed for ${key}:`, error);
            onError?.(error, key);
        }));
        return () => unsubs.forEach(unsub => {
            try {
                unsub();
            } catch (error) {
                console.warn('Realtime store unsubscribe failed:', error);
            }
        });
    }

    async function watchCollection(collection, onChange, onError) {
        if (!collection) return () => {};
        const db = await realtimeDb();
        return db.collection(collection).onSnapshot(snapshot => {
            const records = snapshot.docs.map(doc => ({ ...(doc.data() || {}), firebaseDocId: doc.id }));
            onChange?.(records, collection);
        }, error => {
            console.warn(`Realtime collection listener failed for ${collection}:`, error);
            onError?.(error, collection);
        });
    }

    async function watchDocuments(collection, docIds, onChange, onError) {
        const ids = Array.from(new Set((docIds || []).filter(Boolean)));
        if (!collection || !ids.length) return () => {};
        const db = await realtimeDb();
        const unsubs = ids.map(docId => db.collection(collection).doc(docId).onSnapshot(snapshot => {
            if (!snapshot.exists) return;
            onChange?.({ ...(snapshot.data() || {}), firebaseDocId: snapshot.id }, collection);
        }, error => {
            console.warn(`Realtime document listener failed for ${collection}/${docId}:`, error);
            onError?.(error, collection, docId);
        }));
        return () => unsubs.forEach(unsub => {
            try {
                unsub();
            } catch (error) {
                console.warn('Realtime document unsubscribe failed:', error);
            }
        });
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
        if (!email.includes('@')) {
            throw new Error('Please use your email address to login on the secure Firebase app.');
        }
        return email;
    }

    async function registerEmail(email, password) {
        return authRequest('accounts:signUp', { email, password });
    }

    async function loginEmail(email, password) {
        return authRequest('accounts:signInWithPassword', { email: requireEmail(email), password });
    }

    async function sendPasswordResetEmail(email) {
        const response = await fetch(`${authBaseUrl}/accounts:sendOobCode?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await appCheckHeaders()) },
            body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: requireEmail(email) })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || 'Could not send password reset email.');
        }
        return result;
    }

    function logout() {
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

    async function refreshAuthSessionIfNeeded() {
        const token = storedAuthValue('dawaahFirebaseIdToken');
        const expiresAt = Number(storedAuthValue('dawaahFirebaseTokenExpiresAt') || 0);
        if (token && (!expiresAt || Date.now() < expiresAt - 120000)) return token;
        const refreshToken = storedAuthValue('dawaahFirebaseRefreshToken');
        if (!refreshToken) return token;
        const response = await fetch(`${secureTokenBaseUrl}/token?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }).toString()
        });
        const result = await response.json();
        if (!response.ok || !result.id_token) throw new Error(result.error?.message || 'Firebase session expired. Please login again.');
        saveAuthSession(result);
        return result.id_token;
    }

    async function authHeaders() {
        const token = await refreshAuthSessionIfNeeded();
        if (!token) throw new Error('Please login first to access shared data.');
        return { Authorization: `Bearer ${token}` };
    }

    async function firestoreHeaders(requireAuth = false, extraHeaders = {}) {
        return {
            ...extraHeaders,
            ...(await appCheckHeaders()),
            ...(requireAuth ? await authHeaders() : {})
        };
    }

    async function createSecondaryAdminAuthUser(email, password, displayName = '') {
        const response = await fetch(`${authBaseUrl}/accounts:signUp?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await appCheckHeaders()) },
            body: JSON.stringify({
                email: requireEmail(email),
                password,
                displayName,
                returnSecureToken: true
            })
        });
        const result = await response.json();
        if (!response.ok || !result.localId) {
            throw new Error(result.error?.message || 'Could not create Firebase admin login.');
        }
        return {
            uid: result.localId,
            email: result.email || email,
            displayName: result.displayName || displayName
        };
    }

    async function saveAdminRoleForUid(uid, adminRole) {
        if (!enabled) return adminRole;
        const cleanUid = String(uid || '').trim();
        if (!cleanUid) throw new Error('Admin UID is required.');
        const response = await fetch(`${documentsUrl}/admins/${encodeURIComponent(cleanUid)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                fields: {
                    ...encodeValue({
                        ...adminRole,
                        uid: cleanUid,
                        role: 'admin',
                        status: adminRole.status || 'active',
                        updatedAt: new Date().toISOString()
                    }).mapValue.fields
                }
            })
        });
        if (!response.ok) {
            throw new Error('Only the main admin can save admin access.');
        }
        return adminRole;
    }

    async function listAdminRoles() {
        if (!enabled) return [];
        const response = await fetch(`${documentsUrl}/admins?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return [];
        if (!response.ok) throw new Error('Could not load admin accounts.');
        const result = await response.json();
        return (result.documents || []).map(doc => ({
            id: String(doc.name || '').split('/').pop(),
            ...decodeValue({ mapValue: { fields: doc.fields || {} } })
        }));
    }

    async function deleteAdminRole(uid) {
        if (!enabled) return;
        const cleanUid = String(uid || '').trim();
        if (!cleanUid) throw new Error('Admin UID is required.');
        const response = await fetch(`${documentsUrl}/admins/${encodeURIComponent(cleanUid)}?key=${config.apiKey}`, {
            method: 'DELETE',
            headers: await firestoreHeaders(true)
        });
        if (!response.ok && response.status !== 404) {
            throw new Error('Only the main admin can remove admin access.');
        }
    }

    async function updateCurrentPassword(password) {
        const idToken = await refreshAuthSessionIfNeeded();
        if (!idToken) throw new Error('Please login first.');
        const response = await fetch(`${authBaseUrl}/accounts:update?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await appCheckHeaders()) },
            body: JSON.stringify({ idToken, password, returnSecureToken: true })
        });
        const result = await response.json();
        if (!response.ok || !result.idToken) {
            throw new Error(result.error?.message || 'Could not update password.');
        }
        return saveAuthSession(result);
    }

    function cleanReceiptId(receiptNumber) {
        return String(receiptNumber || '').trim().replace(/\//g, '-');
    }

    async function loadStore(key) {
        if (!enabled) return null;
        const response = await fetch(`${baseUrl}/${encodeURIComponent(key)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return [];
        if (!response.ok) throw new Error(`Could not load ${key} from Firestore.`);
        const doc = await response.json();
        return decodeValue(doc.fields?.items) || [];
    }

    async function loadSiteSettings() {
        if (!enabled) return {};
        const response = await fetch(`${baseUrl}/siteSettings?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(false)
        });
        if (response.status === 404) return {};
        if (!response.ok) throw new Error('Could not load site settings from Firestore.');
        const doc = await response.json();
        return decodeValue(doc.fields?.settings) || decodeValue(doc.fields?.items) || {};
    }

    async function saveSiteSettings(settings) {
        if (!enabled) return settings;
        const response = await fetch(`${baseUrl}/siteSettings?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                fields: {
                    settings: encodeValue(settings || {}),
                    updatedAt: encodeValue(new Date().toISOString())
                }
            })
        });
        if (!response.ok) throw new Error('Could not save site settings to Firestore.');
        return settings;
    }

    async function saveStore(key, items) {
        if (!enabled) return items;
        const response = await fetch(`${baseUrl}/${encodeURIComponent(key)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: { items: encodeValue(items || []), updatedAt: encodeValue(new Date().toISOString()) } })
        });
        if (!response.ok) throw new Error(`Could not save ${key} to Firestore.`);
        return items;
    }

    async function createRecord(collection, record) {
        if (!enabled) return record;
        const payload = {
            ...record,
            ownerUid: currentUid(),
            ownerEmail: currentEmail(),
            createdAt: record?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const response = await fetch(`${documentsUrl}/${encodeURIComponent(collection)}?key=${config.apiKey}`, {
            method: 'POST',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error(`Could not save ${collection} record to Firestore.`);
        const doc = await response.json();
        const id = String(doc.name || '').split('/').pop();
        return { ...payload, firebaseDocId: id };
    }

    async function listRecords(collection) {
        if (!enabled) return [];
        const response = await fetch(`${documentsUrl}/${encodeURIComponent(collection)}?pageSize=1000&key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return [];
        if (!response.ok) throw new Error(`Could not load ${collection} records from Firestore.`);
        const result = await response.json();
        return (result.documents || []).map(doc => ({
            ...Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)])),
            firebaseDocId: String(doc.name || '').split('/').pop()
        }));
    }

    async function loadRecord(collection, docId) {
        if (!enabled || !docId) return null;
        const response = await fetch(`${documentsUrl}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Could not load ${collection} record from Firestore.`);
        const doc = await response.json();
        return {
            ...Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)])),
            firebaseDocId: String(doc.name || '').split('/').pop()
        };
    }

    async function updateRecord(collection, docId, patch) {
        if (!enabled) return patch;
        if (!docId) throw new Error(`Missing ${collection} document id.`);
        const payload = { ...patch, updatedAt: new Date().toISOString() };
        const response = await fetch(`${documentsUrl}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error(`Could not update ${collection} record in Firestore.`);
        return patch;
    }

    function sanitizeAuditDetails(value, depth = 0) {
        if (depth > 4) return '[depth-limit]';
        if (value === null || value === undefined) return value;
        if (Array.isArray(value)) return value.slice(0, 25).map(item => sanitizeAuditDetails(item, depth + 1));
        if (typeof value !== 'object') return value;
        return Object.fromEntries(Object.entries(value).map(([key, item]) => {
            if (/password|token|secret|csrf|key|proof|photo|image|file/i.test(key)) {
                return [key, '[redacted]'];
            }
            return [key, sanitizeAuditDetails(item, depth + 1)];
        }));
    }

    async function createAuditLog(action, details = {}) {
        if (!enabled || !hasAuthSession()) return null;
        const payload = {
            action: String(action || 'unknown').slice(0, 120),
            actor: currentEmail() || currentUid() || 'signed-in-user',
            actorEmail: currentEmail(),
            actorUid: currentUid(),
            details: sanitizeAuditDetails(details || {}),
            source: 'browser-admin',
            userAgent: String(navigator.userAgent || '').slice(0, 240),
            createdAt: new Date()
        };
        const response = await fetch(`${documentsUrl}/auditLogs?key=${config.apiKey}`, {
            method: 'POST',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not write audit log.');
        return payload;
    }

    async function saveBackupMetadata(metadata) {
        if (!enabled || !hasAuthSession()) return metadata;
        const payload = {
            ...(metadata || {}),
            savedByEmail: currentEmail(),
            savedByUid: currentUid(),
            savedAt: new Date()
        };
        const response = await fetch(`${documentsUrl}/backupMetadata/latest?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not save backup metadata.');
        return payload;
    }

    async function saveReceiptVerification(receipt) {
        if (!enabled || !receipt?.receiptNumber) return receipt;
        const docId = cleanReceiptId(receipt.receiptNumber);
        const existingResponse = await fetch(`${documentsUrl}/receiptVerifications/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(false)
        });
        if (existingResponse.ok) {
            const existingDoc = await existingResponse.json();
            const existing = Object.fromEntries(Object.entries(existingDoc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
            const sameTransaction = String(existing.transactionRef || '') === String(receipt.transactionRef || '')
                && String(existing.kind || '') === String(receipt.kind || '')
                && Number(existing.amount || 0) === Number(receipt.amount || 0);
            if (!sameTransaction && existing.status !== 'Reversed') {
                throw new Error('Receipt number already exists for another transaction. Generate a new receipt number before approving.');
            }
        } else if (existingResponse.status !== 404) {
            throw new Error('Could not check receipt uniqueness.');
        }
        const payload = {
            receiptNumber: docId,
            kind: receipt.kind || '',
            type: receipt.type || '',
            name: receipt.name || 'Member',
            amount: receipt.amount || 0,
            method: receipt.method || '',
            transactionRef: receipt.transactionRef || '',
            approvedBy: receipt.approvedBy || '',
            approvedAt: receipt.approvedAt || '',
            auditTrail: Array.isArray(receipt.auditTrail) ? receipt.auditTrail.slice(-8) : [],
            status: receipt.status || 'Completed',
            updatedAt: new Date().toISOString()
        };
        const response = await fetch(`${documentsUrl}/receiptVerifications/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not save receipt verification.');
        return payload;
    }

    async function loadReceiptVerification(receiptNumber) {
        if (!enabled || !receiptNumber) return null;
        const docId = cleanReceiptId(receiptNumber);
        const response = await fetch(`${documentsUrl}/receiptVerifications/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(false)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Could not verify receipt right now.');
        const doc = await response.json();
        return Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
    }

    async function saveMemberVerification(member) {
        if (!enabled || !member) return member;
        const identifier = cleanReceiptId(member.studentId || member.username || member.email || currentUid());
        if (!identifier) return member;
        const publicRecord = {
            fullName: member.fullName || member.name || member.username || 'Member',
            username: member.username || member.studentId || '',
            studentId: member.studentId || member.username || '',
            role: member.role || 'student',
            status: member.status || 'Active',
            course: member.course || '',
            updatedAt: new Date().toISOString()
        };
        const response = await fetch(`${documentsUrl}/memberVerifications/${encodeURIComponent(identifier)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(publicRecord).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not save member verification.');
        return publicRecord;
    }

    async function loadPublicMemberVerification(identifier) {
        if (!enabled || !identifier) return null;
        const docId = cleanReceiptId(identifier);
        const response = await fetch(`${documentsUrl}/memberVerifications/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(false)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Could not verify member right now.');
        const doc = await response.json();
        return Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
    }

    async function saveMembershipCard(card) {
        if (!enabled || !card?.cardId) return card;
        const docId = cleanReceiptId(card.cardId);
        const payload = {
            ...card,
            cardId: docId,
            ownerUid: currentUid(),
            updatedAt: new Date().toISOString()
        };
        delete payload.ownerEmail;
        delete payload.email;
        delete payload.phone;
        delete payload.homeAddress;
        delete payload.emergencyContact;
        delete payload.localGuardian;
        const response = await fetch(`${documentsUrl}/membershipCards/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not save membership card.');
        return payload;
    }

    async function loadPublicMembershipCard(cardId) {
        if (!enabled || !cardId) return null;
        const docId = cleanReceiptId(cardId);
        const response = await fetch(`${documentsUrl}/membershipCards/${encodeURIComponent(docId)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(false)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Could not verify membership card right now.');
        const doc = await response.json();
        return Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
    }

    async function loadStores(keys) {
        if (!enabled) return {};
        const entries = await Promise.all(keys.map(async key => [key, await loadStore(key).catch(() => null)]));
        return Object.fromEntries(entries.filter(([, value]) => value !== null && value !== undefined));
    }

    async function saveMember(member) {
        if (!enabled) return member;
        const uid = member?.uid || currentUid();
        if (!uid) throw new Error('Please login first to save your member profile.');
        const { password: _discardedPassword, ...safeMember } = member || {};
        const payload = {
            ...safeMember,
            uid,
            authEmail: safeMember.authEmail || currentEmail(),
            updatedAt: new Date().toISOString()
        };
        const fields = encodeValue(payload).mapValue.fields;
        const headers = await firestoreHeaders(true, { 'Content-Type': 'application/json' });
        const existingResponse = await fetch(`${documentsUrl}/members/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        const methodUrl = existingResponse.status === 404
            ? `${documentsUrl}/members?documentId=${encodeURIComponent(uid)}&key=${config.apiKey}`
            : `${documentsUrl}/members/${encodeURIComponent(uid)}?key=${config.apiKey}`;
        const response = await fetch(methodUrl, {
            method: existingResponse.status === 404 ? 'POST' : 'PATCH',
            headers,
            body: JSON.stringify({ fields })
        });
        if (!response.ok && response.status === 409) {
            const retryResponse = await fetch(`${documentsUrl}/members/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ fields })
            });
            if (!retryResponse.ok) throw new Error('Could not save member profile securely.');
            return payload;
        }
        if (!response.ok) throw new Error('Could not save member profile securely.');
        return payload;
    }

    async function updateMemberProfile(uid, member) {
        if (!enabled) return member;
        if (!uid) throw new Error('Missing member profile id.');
        const { password: _discardedPassword, ...safeMember } = member || {};
        const payload = { ...safeMember, uid, updatedAt: new Date().toISOString() };
        const response = await fetch(`${documentsUrl}/members/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ fields: encodeValue(payload).mapValue.fields })
        });
        if (!response.ok) throw new Error('Could not save member profile securely.');
        return payload;
    }

    async function loadMyMember() {
        if (!enabled) return null;
        const uid = currentUid();
        if (!uid) return null;
        const response = await fetch(`${documentsUrl}/members/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Could not load member profile securely.');
        const doc = await response.json();
        return Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
    }

    async function listMembers() {
        if (!enabled) return [];
        const response = await fetch(`${documentsUrl}/members?pageSize=1000&key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (!response.ok) throw new Error('Only admins can load all members.');
        const result = await response.json();
        return (result.documents || []).map(doc =>
            Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]))
        );
    }

    async function loadMyAdminRole() {
        if (!enabled) return null;
        const uid = currentUid();
        if (!uid) return null;
        const response = await fetch(`${documentsUrl}/admins/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
            cache: 'no-store',
            headers: await firestoreHeaders(true)
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Could not load admin role.');
        const doc = await response.json();
        return Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
    }

    async function saveAdminRole(admin) {
        if (!enabled) return admin;
        const uid = currentUid();
        if (!uid) throw new Error('Please login first to save admin role.');
        const response = await fetch(`${documentsUrl}/admins/${encodeURIComponent(uid)}?key=${config.apiKey}`, {
            method: 'PATCH',
            headers: await firestoreHeaders(true, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                fields: {
                    ...encodeValue({ ...admin, uid, email: currentEmail(), role: 'admin', updatedAt: new Date().toISOString() }).mapValue.fields
                }
            })
        });
        if (!response.ok) {
            let message = 'Only the Firebase owner account can create or repair the secured main admin. Login with the owner email, or approve this account from inside the admin panel.';
            try {
                const result = await response.json();
                if (result?.error?.status === 'PERMISSION_DENIED') {
                    message = 'This email is not allowed to create the main admin directly. Use the Firebase owner email, then add/approve other admins inside the admin panel.';
                }
            } catch (error) {
                // Keep the safer default message.
            }
            throw new Error(message);
        }
        return admin;
    }

    return { enabled, hasAuthSession, currentUid, currentEmail, registerEmail, loginEmail, ensureRealtimeAuth, sendPasswordResetEmail, logout, createSecondaryAdminAuthUser, saveAdminRoleForUid, listAdminRoles, deleteAdminRole, updateCurrentPassword, loadStore, saveStore, loadStores, loadSiteSettings, saveSiteSettings, createRecord, listRecords, loadRecord, updateRecord, watchStores, watchCollection, watchDocuments, createAuditLog, saveBackupMetadata, saveReceiptVerification, loadReceiptVerification, saveMemberVerification, loadPublicMemberVerification, saveMembershipCard, loadPublicMembershipCard, saveMember, updateMemberProfile, loadMyMember, listMembers, loadMyAdminRole, saveAdminRole };
})();
