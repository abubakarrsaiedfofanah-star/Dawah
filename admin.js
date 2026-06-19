// Assembled from feature runtime files. Edit features/**/runtime/*.js, then run npm run runtime:assemble.
// Runtime slice from admin.js: bootstrap.
// UMMA University Dawah Team Admin Panel JavaScript

const API_URL = 'admin-api';
let currentAdmin = null;
let lastDashboardDetailType = '';
let lastDashboardDetailRows = [];
let editingReligiousActivity = null;
let adminStudentRequesters = [];
let cloudAdminStoresPromise = null;
let cloudAdminStoresLoadedAt = 0;

const realFetch = window.fetch.bind(window);
const STATIC_ADMIN_HOSTS = [
    'localhost',
    '127.0.0.1',
    'github.io',
    'netlify.app',
    'vercel.app',
    'pages.dev',
    '66ghz.com',
    'www.66ghz.com'
];
const useStaticAdminApi = location.protocol === 'file:'
    || STATIC_ADMIN_HOSTS.some(host => location.hostname === host || location.hostname.endsWith(`.${host}`));
const LOCAL_ADMIN_ACCOUNTS_KEY = 'DawaahAdminAccounts';
const LOCAL_ADMIN_CLEANUP_KEY = 'DawaahAdminAccountsMainOnlyCleanup20260509';
const LOCAL_ADMIN_FULL_RESET_KEY = 'DawaahAdminFullReset20260509';
const LOCAL_ADMIN_ACCOUNT_CLEAR_KEY = 'DawaahAdminAccountClear20260526SupabaseReset';
const LOCAL_ADMIN_ACTIVITY_CLEAR_KEY = 'DawaahAdminActivityClear20260518';
const PORTAL_AUDIENCE_KEY = 'dawaahPortalAudience';
const ADMIN_PORTAL_CLOSED_KEY = 'dawaahAdminPortalClosed';
const ADMIN_LOGIN_FAILURE_KEY = 'DawaahAdminLoginFailures';
const ADMIN_HASH_ALGORITHM = 'PBKDF2-SHA-256';
const ADMIN_HASH_ITERATIONS = 150000;
const ADMIN_ACCOUNT_LIMIT = 3;
const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ADMIN_LOGIN_LOCKOUT_MS = 5 * 60 * 1000;
const ADMIN_MAX_FAILED_LOGINS = 5;
const ADMIN_DATA_REFRESH_MS = 30000;
const ADMIN_REGISTRATION_CAPTURE_MS = 1000;
const ADMIN_BACKUP_META_KEY = 'DawaahLastDatabaseBackup';
const ADMIN_NOTIFICATION_LOG_KEY = 'adminNotificationLog';
const ADMIN_BACKUP_DUE_DAYS = 7;
const SUPABASE_ADMIN_ACCOUNT_ACTIONS = new Set([
    'listAdminAccounts',
    'createAdminAccount',
    'deleteAdminAccount',
    'changeAdminPassword',
    'resetAdminPassword'
]);
const ROLE_PERMISSION_OVERRIDES_KEY = 'rolePermissionOverrides';
const EDITABLE_ROLE_PERMISSIONS = [
    'view_profile',
    'view_membership',
    'register_events',
    'view_prayer_times',
    'view_announcements',
    'view_resources',
    'welfare_request',
    'view_payments',
    'view_donations',
    'register_volunteer',
    'manage_members',
    'manage_events',
    'manage_activities',
    'manage_welfare',
    'manage_gallery',
    'manage_contact',
    'manage_payments',
    'manage_prayer_times',
    'manage_lectures',
    'manage_hadiths',
    'view_reports',
    'generate_reports',
    'create_announcements',
    'manage_leadership'
];
let adminSessionTimeoutId = null;
let adminSessionWarningId = null;
let adminRealtimeUnsubscribers = [];

// Runtime slice from admin.js: clearStoredAdminAccountsOnce.
function clearStoredAdminAccountsOnce() {
    if (localStorage.getItem(LOCAL_ADMIN_ACCOUNT_CLEAR_KEY) === '1') return;
    [
        LOCAL_ADMIN_ACCOUNTS_KEY,
        LOCAL_ADMIN_CLEANUP_KEY,
        LOCAL_ADMIN_FULL_RESET_KEY,
        ADMIN_LOGIN_FAILURE_KEY,
        'currentAdmin',
        'adminUser',
        'DawaahAdminSession'
    ].forEach(key => localStorage.removeItem(key));
    ['currentAdminUser', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid'].forEach(key => sessionStorage.removeItem(key));
    localStorage.setItem(LOCAL_ADMIN_ACCOUNT_CLEAR_KEY, '1');
}

clearStoredAdminAccountsOnce();

// Runtime slice from admin.js: clearStoredAdminActivityOnce.
function clearStoredAdminActivityOnce() {
    if (localStorage.getItem(LOCAL_ADMIN_ACTIVITY_CLEAR_KEY) === '1') return;
    localStorage.removeItem('adminActivityLogs');
    localStorage.setItem(LOCAL_ADMIN_ACTIVITY_CLEAR_KEY, '1');
}

clearStoredAdminActivityOnce();

// Runtime slice from admin.js: parseJsonResponse.
function parseJsonResponse(response) {
    if (response && typeof response.text === 'function') {
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (error) {
                if (/src=["']\/aes\.js["']/i.test(text) && /document\.cookie=["']__test=/i.test(text)) {
                    throw new Error('The free hosting security check interrupted this request. Please refresh the website once, wait for it to finish loading, then try again.');
                }
                const preview = text.trim().slice(0, 120) || 'empty response';
                const url = response.url || 'API request';
                const status = response.status ? `HTTP ${response.status}` : 'Invalid response';
                throw new Error(`${status} from ${url}: expected JSON but received ${preview}`);
            }
        });
    }
    if (response && typeof response.json === 'function') {
        return response.json();
    }
    return Promise.reject(new Error('Invalid API response'));
}

// Runtime slice from admin.js: normalizeAdminText.
function normalizeAdminText(value) {
    return String(value || '').trim().toLowerCase();
}

// Runtime slice from admin.js: isStudentRecord.
function isStudentRecord(member) {
    const role = normalizeAdminText(member?.role || 'student');
    return !role || role === 'student' || role.includes('student');
}

// Runtime slice from admin.js: isCompletedStatus.
function isCompletedStatus(status) {
    return ['completed', 'complete', 'paid', 'approved', 'success', 'successful'].includes(normalizeAdminText(status));
}

// Runtime slice from admin.js: isMembershipDuesRecord.
function isMembershipDuesRecord(payment) {
    const type = normalizeAdminText(payment?.type || payment?.payment_type || payment?.purpose || payment?.kind);
    return type === 'membershipdues'
        || type === 'membership dues'
        || type.includes('membership');
}

// Runtime slice from admin.js: memberIdentityKeys.
function memberIdentityKeys(member) {
    return [
        member?.uid,
        member?.ownerUid,
        member?.email,
        member?.authEmail,
        member?.studentId,
        member?.student_id,
        member?.username,
        member?.memberId
    ].map(value => normalizeAdminText(value)).filter(Boolean);
}

// Runtime slice from admin.js: paymentIdentityKeys.
function paymentIdentityKeys(payment) {
    return [
        payment?.ownerUid,
        payment?.uid,
        payment?.email,
        payment?.ownerEmail,
        payment?.studentEmail,
        payment?.studentId,
        payment?.student_id,
        payment?.username,
        payment?.memberId
    ].map(value => normalizeAdminText(value)).filter(Boolean);
}

// Runtime slice from admin.js: getStudentRecords.
function getStudentRecords() {
    return readStore('allMembers').filter(isStudentRecord);
}

// Runtime slice from admin.js: getMemberRecords.
function getMemberRecords() {
    const students = getStudentRecords();
    const paidKeys = new Set(
        readStore('payments')
            .filter(payment => isMembershipDuesRecord(payment) && isCompletedStatus(payment.status))
            .flatMap(paymentIdentityKeys)
    );
    return students.filter(student => {
        const directMembership = isCompletedStatus(student.membershipCardPaymentStatus)
            || isCompletedStatus(student.paymentStatus)
            || normalizeAdminText(student.membershipCardRecordStatus) === 'active'
            || normalizeAdminText(student.membershipCardStatus).includes('ready after payment');
        return directMembership || memberIdentityKeys(student).some(key => paidKeys.has(key));
    });
}

// Runtime slice from admin.js: updateAdminPhotoUi.
function updateAdminPhotoUi() {
    const photo = currentAdmin?.profile_photo ? resolveAdminUrl(currentAdmin.profile_photo) : '';
    const headerPhoto = document.getElementById('adminHeaderPhoto');
    const headerIcon = document.getElementById('adminHeaderIcon');
    const preview = document.getElementById('adminPhotoPreview');
    const previewIcon = document.getElementById('adminPhotoPreviewIcon');

    [headerPhoto, preview].forEach(img => {
        if (!img) return;
        img.src = photo;
        img.classList.toggle('d-none', !photo);
    });
    headerIcon?.classList.toggle('d-none', Boolean(photo));
    previewIcon?.classList.toggle('d-none', Boolean(photo));
}

// Runtime slice from admin.js: saveAdminPhoto.
function saveAdminPhoto() {
    const input = document.getElementById('adminPhotoInput');
    const file = input?.files?.[0];
    if (!file) {
        showNotification('Choose a photo first.', 'warning');
        return;
    }
    if (!file.type.startsWith('image/')) {
        showNotification('Please choose a valid image file.', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('admin_photo', file);
    fetch(`${API_URL}?action=updateAdminPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save admin photo');
        setAdminUser(result.data);
        if (input) input.value = '';
        showNotification('Admin photo saved.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not save admin photo', 'danger'));
}

// Runtime slice from admin.js: removeAdminPhoto.
function removeAdminPhoto() {
    const formData = new FormData();
    formData.append('remove_photo', '1');
    fetch(`${API_URL}?action=updateAdminPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not remove admin photo');
        setAdminUser(result.data);
        showNotification('Admin photo removed.', 'info');
    })
    .catch(error => showNotification(error.message || 'Could not remove admin photo', 'danger'));
}

// Runtime slice from admin.js: resolveAdminUrl.
function resolveAdminUrl(url) {
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|data:|blob:)/i.test(url)) return url;
    const cleanUrl = url.replace(/^\/+/, '');
    return cleanUrl;
}

window.fetch = function(resource, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const url = String(resource);
    const isAdminApiRequest = url.includes(API_URL);
    const token = currentAdmin?.csrf_token || JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null')?.csrf_token || '';
    if (isAdminApiRequest && token && ['POST', 'PUT', 'DELETE'].includes(method)) {
        const headers = new Headers(options.headers || {});
        if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', token);
        options = { ...options, headers };
    }
    if (!useStaticAdminApi || !url.includes(API_URL)) {
        return realFetch(resource, options);
    }

    const params = new URL(url, location.href).searchParams;
    const action = params.get('action');
    let payload = {};

    try {
        payload = options.body ? JSON.parse(options.body) : {};
    } catch (error) {
        payload = {};
    }

    if (
        window.SupabaseBackend?.enabled &&
        window.SupabaseBackend?.hasAuthSession?.() &&
        SUPABASE_ADMIN_ACCOUNT_ACTIONS.has(action)
    ) {
        return handleAdminAccountApi(action, method, payload)
            .then(result => ({
                ok: true,
                json: () => Promise.resolve(result)
            }))
            .catch(error => ({
                ok: false,
                json: () => Promise.resolve({ success: false, message: error.message || 'Admin account action failed.' })
            }));
    }

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(handleStaticAdminApi(action, method, payload, params))
            .then(result => {
                logStaticContentActivity(action, method, payload, result);
                return result;
            })
    });
};

// Runtime slice from admin.js: refreshAdminSessionToken.
function refreshAdminSessionToken() {
    return realFetch(`${API_URL}?action=checkAdminSession`, { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.csrf_token) {
                throw new Error(result.message || 'Admin session expired. Please login again.');
            }
            setAdminUser(result.data);
            return result.data.csrf_token;
        });
}

// Runtime slice from admin.js: adminApiRequest.
function adminApiRequest(action, options = {}, retryOnCsrf = true) {
    return fetch(`${API_URL}?action=${action}`, options)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (retryOnCsrf && !result.success && /security token expired/i.test(result.message || '')) {
                return refreshAdminSessionToken()
                    .then(() => adminApiRequest(action, options, false));
            }
            return result;
        });
}

// Runtime slice from admin.js: readStore.
function readStore(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Runtime slice from admin.js: getLastBackupMeta.
function getLastBackupMeta() {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_BACKUP_META_KEY) || 'null');
    } catch (error) {
        return null;
    }
}

// Runtime slice from admin.js: getBackupStatus.
function getBackupStatus() {
    const meta = getLastBackupMeta();
    if (!meta?.downloadedAt) {
        return {
            status: 'warn',
            detail: 'No browser-recorded backup yet. Download one before handover or after major data changes.'
        };
    }
    const downloadedAt = new Date(meta.downloadedAt);
    const ageMs = Date.now() - downloadedAt.getTime();
    const ageDays = Math.max(0, Math.floor(ageMs / 86400000));
    const due = ageDays >= ADMIN_BACKUP_DUE_DAYS;
    return {
        status: due ? 'warn' : 'ok',
        detail: `${due ? 'Backup due' : 'Backup current'}: last downloaded ${ageDays === 0 ? 'today' : `${ageDays} day(s) ago`} (${downloadedAt.toLocaleString()}).`
    };
}

// Runtime slice from admin.js: renderBackupStatus.
function renderBackupStatus() {
    const element = document.getElementById('backupStatusSummary');
    if (!element) return;
    const status = getBackupStatus();
    const badge = status.status === 'ok' ? 'success' : 'warning text-dark';
    element.innerHTML = `<span class="badge bg-${badge} me-1">${status.status === 'ok' ? 'Backup OK' : 'Backup Due'}</span>${escapeAdminText(status.detail)}`;
}

// Runtime slice from admin.js: isBackupCurrentEnoughForDanger.
function isBackupCurrentEnoughForDanger() {
    const backup = getBackupStatus();
    if (backup.status === 'ok') return true;
    return confirm(`${backup.detail}\n\nThis action can remove records. Continue without downloading a fresh backup first?`);
}

// Runtime slice from admin.js: requireMainAdminForSensitiveExport.
function requireMainAdminForSensitiveExport() {
    if (currentAdmin?.isMainAdmin) return true;
    showNotification('Only the main admin can export sensitive system records.', 'warning');
    return false;
}

// Runtime slice from admin.js: rememberDatabaseBackup.
function rememberDatabaseBackup(filename) {
    const metadata = {
        filename,
        downloadedAt: new Date().toISOString(),
        admin: currentAdmin?.username || currentAdmin?.email || '',
        SupabaseUid: window.SupabaseBackend?.currentUid?.() || '',
        SupabaseEmail: window.SupabaseBackend?.currentEmail?.() || ''
    };
    localStorage.setItem(ADMIN_BACKUP_META_KEY, JSON.stringify(metadata));
    window.SupabaseBackend?.saveBackupMetadata?.(metadata).catch(error => {
        console.warn('Could not save cloud backup metadata:', error);
    });
    renderBackupStatus();
}

// Runtime slice from admin.js: recordAdminNotification.
function recordAdminNotification(message, type = 'info') {
    try {
        const text = String(message || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) return;
        const log = readStore(ADMIN_NOTIFICATION_LOG_KEY);
        log.unshift({
            id: Date.now(),
            message: text,
            type,
            createdAt: new Date().toISOString(),
            admin: currentAdmin?.username || currentAdmin?.email || 'system'
        });
        localStorage.setItem(ADMIN_NOTIFICATION_LOG_KEY, JSON.stringify(log.slice(0, 200)));
    } catch (error) {
        console.warn('Could not record admin notification:', error);
    }
}

// Runtime slice from admin.js: saveCloudStore.
function saveCloudStore(key, data) {
    if (!window.SupabaseBackend?.enabled) return;
    if (key === 'allMembers' && Array.isArray(data)) {
        data.forEach(member => {
            if (member?.uid) {
                window.SupabaseBackend.saveMember(member).catch(error => {
                    console.error('Supabase member update failed:', error);
                });
            }
            if (String(member?.status || '').toLowerCase() === 'active') {
                window.SupabaseBackend.saveMemberVerification?.(member).catch(error => {
                    console.error('Supabase member verification update failed:', error);
                });
            }
        });
        return;
    }
    window.SupabaseBackend.saveStore(key, data).catch(error => {
        console.error(`Supabase sync failed for ${key}:`, error);
    });
}

// Runtime slice from admin.js: closePublicAdminPortal.
function closePublicAdminPortal() {
    localStorage.setItem(ADMIN_PORTAL_CLOSED_KEY, '1');
    const settings = { ...getLocalSiteSettings(), admin_portal_closed: true };
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
        window.SupabaseBackend.saveSiteSettings(settings).catch(error => {
            console.warn('Could not close public admin portal in Supabase:', error);
        });
        return;
    }
    if (!useStaticAdminApi) {
        fetch(`${API_URL}?action=updateSiteSettings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        }).catch(error => {
            console.warn('Could not close public admin portal on server:', error);
        });
    }
}

// Runtime slice from admin.js: getLocalSiteSettings.
function getLocalSiteSettings() {
    return {
        contact_location: 'UMMA University, Main Campus',
        contact_phone: '+23231422167',
        contact_email: 'info@dawah.org',
        contact_hours: 'Monday - Friday: 10 AM - 6 PM',
        about_title: 'About Us',
        about_heading: 'Who We Are',
        about_paragraph_1: "UMMA University Dawah Team is a community organization dedicated to serving Muslim students and staff at UMMA University. We are committed to fostering spiritual growth, academic excellence, and community support.",
        about_paragraph_2: 'Our association brings together students from various disciplines, creating a united platform for Islamic practice and mutual support.',
        about_feature_1: 'Supporting faith-based student life',
        about_feature_2: 'Organizing religious events and activities',
        about_feature_3: 'Providing welfare and counseling services',
        about_feature_4: 'Bridging academic excellence with Islamic values',
        what_we_do_title: 'What We Do',
        what_we_do_1_title: 'Spiritual Support',
        what_we_do_1_text: "Regular prayer gatherings, Jumu'ah services, and Islamic lectures to strengthen faith and spiritual growth among members.",
        what_we_do_2_title: 'Events & Activities',
        what_we_do_2_text: 'Organize seminars, workshops, social gatherings, and educational events that promote Islamic knowledge and community bonding.',
        what_we_do_3_title: 'Welfare Support',
        what_we_do_3_text: 'Provide financial assistance, counseling, and support services to members facing hardship or personal challenges.',
        what_we_do_4_title: 'Education',
        what_we_do_4_text: 'Offer resources for Islamic learning, including Quran study circles, Islamic history seminars, and knowledge-sharing sessions.',
        what_we_do_5_title: 'Community Service',
        what_we_do_5_text: 'Engage in volunteering and community outreach programs to benefit society and reflect Islamic values of compassion.',
        what_we_do_6_title: 'Leadership',
        what_we_do_6_text: 'Develop leadership skills and prepare members for roles in guiding and inspiring the Muslim student community.',
        social_whatsapp: 'https://api.whatsapp.com/send?phone=23231422167&text=Assalamu%20alaikum%2C%20I%20would%20like%20to%20contact%20Da%27awah%20Team.',
        social_facebook: '',
        social_x: '',
        social_instagram: '',
        social_youtube: '',
        social_tiktok: '',
        social_linkedin: '',
        ...(JSON.parse(localStorage.getItem('siteSettings') || '{}'))
    };
}

// Runtime slice from admin.js: writeStore.
function writeStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    saveCloudStore(key, data);
}

// Runtime slice from admin.js: getRolePermissionOverrides.
function getRolePermissionOverrides() {
    const stored = readStore(ROLE_PERMISSION_OVERRIDES_KEY);
    return Array.isArray(stored) ? stored : [];
}

// Runtime slice from admin.js: defaultPermissionsForRole.
function defaultPermissionsForRole(role) {
    const map = {
        chairlady: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        vice_chairlady_1: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        vice_chairlady_2: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        secretary: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        vice_secretary: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        treasurer: ['view_profile', 'view_membership', 'view_payments', 'view_donations', 'manage_payments', 'view_reports', 'generate_reports'],
        vice_treasurer: ['view_profile', 'view_membership', 'view_payments', 'view_donations', 'manage_payments', 'view_reports', 'generate_reports'],
        media: ['view_profile', 'view_announcements', 'view_resources', 'manage_gallery', 'manage_contact'],
        organizer: ['view_profile', 'register_events', 'register_volunteer', 'manage_events', 'manage_activities'],
        amir_director: ['view_profile', 'view_prayer_times', 'view_announcements', 'view_resources', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths'],
        executive: EDITABLE_ROLE_PERMISSIONS
    };
    return map[role] || [];
}

// Runtime slice from admin.js: renderRolePermissionEditor.
function renderRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || 'chairlady';
    const container = document.getElementById('rolePermissionEditorList');
    if (!container) return;
    const override = getRolePermissionOverrides().find(item => item.role === role);
    const activePermissions = new Set(override?.permissions || defaultPermissionsForRole(role));
    container.innerHTML = EDITABLE_ROLE_PERMISSIONS.map(permission => `
        <div class="col-md-4">
            <label class="border rounded p-2 w-100 bg-white text-dark">
                <input class="form-check-input me-1 role-permission-checkbox" type="checkbox" value="${escapeAdminText(permission)}" ${activePermissions.has(permission) ? 'checked' : ''}>
                ${escapeAdminText(permission.replaceAll('_', ' '))}
            </label>
        </div>
    `).join('');
}

// Runtime slice from admin.js: saveRolePermissionEditor.
function saveRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || '';
    if (!role || !currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can edit role permissions.', 'warning');
        return;
    }
    const permissions = Array.from(document.querySelectorAll('.role-permission-checkbox:checked')).map(input => input.value);
    const next = getRolePermissionOverrides().filter(item => item.role !== role);
    next.push({ role, permissions, updatedAt: new Date().toISOString(), updatedBy: currentAdmin?.username || currentAdmin?.email || '' });
    writeStore(ROLE_PERMISSION_OVERRIDES_KEY, next);
    logLocalAdminActivity('updateRolePermissions', { role, permissions });
    showNotification('Role permissions saved.', 'success');
}

// Runtime slice from admin.js: resetRolePermissionEditor.
function resetRolePermissionEditor() {
    const role = document.getElementById('permissionRoleSelect')?.value || '';
    if (!role || !currentAdmin?.isMainAdmin) return;
    const next = getRolePermissionOverrides().filter(item => item.role !== role);
    writeStore(ROLE_PERMISSION_OVERRIDES_KEY, next);
    renderRolePermissionEditor();
    logLocalAdminActivity('resetRolePermissions', { role });
    showNotification('Role permissions reset to default.', 'success');
}

// Runtime slice from admin.js: runAdminGlobalSearch.
function runAdminGlobalSearch() {
    const query = normalizeAdminText(document.getElementById('adminGlobalSearchInput')?.value || '');
    const container = document.getElementById('adminGlobalSearchResults');
    if (!container) return;
    if (!query) {
        container.innerHTML = '';
        return;
    }
    const sources = [
        ['Students', getStudentRecords()],
        ['Paid Members', getMemberRecords()],
        ['Payments', readStore('payments')],
        ['Donations', readStore('donations')],
        ['Welfare', readStore('welfareRequests')],
        ['Events', readStore('adminEvents')],
        ['Research', lastDashboardDetailType === 'research' ? lastDashboardDetailRows : []],
        ['Audit', readStore('adminActivityLogs')]
    ];
    const matches = sources.flatMap(([label, rows]) => (rows || [])
        .filter(row => normalizeAdminText(JSON.stringify(row)).includes(query))
        .slice(0, 8)
        .map(row => ({ label, row })))
        .slice(0, 40);
    container.innerHTML = `
        <div class="alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
                <strong>Search results for "${escapeAdminText(query)}"</strong>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="document.getElementById('adminGlobalSearchResults').innerHTML=''">Close</button>
            </div>
            ${matches.length ? `<div class="table-responsive mt-2"><table class="table table-sm mb-0"><tbody>${matches.map(item => `
                <tr><td><span class="badge bg-primary">${escapeAdminText(item.label)}</span></td><td>${escapeAdminText(JSON.stringify(item.row).slice(0, 220))}</td></tr>
            `).join('')}</tbody></table></div>` : '<p class="mb-0 mt-2">No matching records found.</p>'}
        </div>
    `;
}

// Runtime slice from admin.js: addStoreItem.
function addStoreItem(key, item) {
    const items = readStore(key);
    const savedItem = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        ...item
    };
    items.push(savedItem);
    writeStore(key, items);
    return savedItem;
}

// Runtime slice from admin.js: deleteStoreItem.
function deleteStoreItem(key, id) {
    const items = readStore(key).filter(item => Number(item.id) !== Number(id));
    writeStore(key, items);
}

// Runtime slice from admin.js: updateLocalTransaction.
function updateLocalTransaction(storeKey, id, patch) {
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    let matchedItem = null;
    const existingItem = readStore(storeKey).find(item => keyNames.some(key => String(item[key] || '') === String(id)));
    const existingStatus = String(existingItem?.status || '').toLowerCase();
    const nextStatus = String(patch?.status || '').toLowerCase();
    if (existingStatus === 'completed' && nextStatus !== 'reversed' && !currentAdmin?.isMainAdmin) {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const items = readStore(storeKey).map(item => {
        const matches = keyNames.some(key => String(item[key] || '') === String(id));
        if (matches) matchedItem = item;
        return matches ? { ...item, ...patch } : item;
    });
    writeStore(storeKey, items);
    if (matchedItem?.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord(storeKey, matchedItem.supabaseId, patch).catch(error => {
            console.error(`Supabase ${storeKey} status update failed:`, error);
        });
    }
    if (patch?.status === 'Completed' && patch?.receiptNumber && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationRecord(storeKey, { ...matchedItem, ...patch })).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    if (patch?.status === 'Reversed' && (matchedItem?.receiptNumber || matchedItem?.receipt_number) && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationRecord(storeKey, {
            ...matchedItem,
            ...patch,
            receiptNumber: matchedItem.receiptNumber || matchedItem.receipt_number,
            status: 'Reversed'
        })).catch(error => {
            console.error('Receipt verification reversal update failed:', error);
        });
    }
    if (matchedItem) {
        logLocalAdminActivity('financeRecordUpdated', {
            store: storeKey,
            record_id: id,
            previous_status: matchedItem.status || '',
            next_status: patch?.status || '',
            receipt_number: patch?.receiptNumber || matchedItem.receiptNumber || matchedItem.receipt_number || ''
        });
    }
}

// Runtime slice from admin.js: buildReceiptVerificationRecord.
function buildReceiptVerificationRecord(storeKey, item = {}) {
    const isPayment = storeKey === 'payments';
    return {
        kind: isPayment ? 'Payment' : 'Donation',
        receiptNumber: item.receiptNumber || '',
        amount: Number(item.amount || 0),
        status: item.status || 'Completed',
        type: item.type || item.payment_type || item.donation_type || (isPayment ? 'Payment' : 'Donation'),
        name: item.name || item.fullName || item.student_name || item.donor || item.donor_name || 'Member',
        method: item.paymentMethod || item.payment_method || 'Not specified',
        transactionRef: item.transactionRef || item.transaction_id || '',
        approvedBy: item.approvedBy || item.approved_by || currentFinanceActor(),
        approvedAt: item.approvedAt || item.approved_at || new Date().toISOString(),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: Array.isArray(item.auditTrail) ? item.auditTrail : []
    };
}

// Runtime slice from admin.js: currentFinanceActor.
function currentFinanceActor() {
    return currentAdmin?.username || currentAdmin?.email || 'Admin';
}

// Runtime slice from admin.js: makeReceiptNumber.
function makeReceiptNumber(prefix, id) {
    const cleanId = String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const random = (globalThis.crypto?.getRandomValues
        ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(3))).map(value => value.toString(16).padStart(2, '0')).join('')
        : Math.random().toString(36).slice(2, 8)).toUpperCase();
    return `${prefix}-${stamp}-${cleanId}-${random}`;
}

// Runtime slice from admin.js: makeUniqueReceiptNumber.
function makeUniqueReceiptNumber(storeKey, prefix, id) {
    const usedReceipts = new Set(readStore(storeKey)
        .map(item => String(item.receiptNumber || item.receipt_number || '').toUpperCase())
        .filter(Boolean));
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const receipt = makeReceiptNumber(prefix, `${id || Date.now()}${attempt ? '-' + attempt : ''}`);
        if (!usedReceipts.has(receipt.toUpperCase())) return receipt;
    }
    return makeReceiptNumber(prefix, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

// Runtime slice from admin.js: findFinanceTarget.
function findFinanceTarget(storeKey, id) {
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    return readStore(storeKey).find(item => keyNames.some(key => String(item[key] || '') === String(id))) || null;
}

// Runtime slice from admin.js: validateFinanceApproval.
function validateFinanceApproval(storeKey, id) {
    const target = findFinanceTarget(storeKey, id);
    if (!target) return `${storeKey === 'payments' ? 'Payment' : 'Donation'} record was not found.`;
    if (Number(target.amount || 0) <= 0) return 'Amount must be greater than zero before approval.';
    const method = String(target.paymentMethod || target.payment_method || target.method || '').trim();
    if (!method) return 'Payment method is required before approval.';
    const status = String(target.status || '').toLowerCase();
    if (['completed', 'reversed'].includes(status)) return 'This record is already locked. Main admin must reverse it first if correction is needed.';
    const reference = String(target.transactionRef || target.transaction_id || target.mpesaReceipt || target.mpesa_receipt || '').trim();
    const hasProof = Boolean(target.proofUrl || target.proof_url || target.paymentProof || target.payment_proof);
    if (!/cash/i.test(method) && !reference && !hasProof) {
        return 'A transaction reference or payment proof is required for non-cash approval.';
    }
    return '';
}

// Runtime slice from admin.js: withFinanceAudit.
function withFinanceAudit(storeKey, id, action, patch = {}, reason = '') {
    const now = new Date().toISOString();
    const actor = currentFinanceActor();
    const items = readStore(storeKey);
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    const target = items.find(item => keyNames.some(key => String(item[key] || '') === String(id))) || {};
    const auditEntry = {
        action,
        by: actor,
        at: now,
        reason: reason || patch.notes || ''
    };
    return {
        ...patch,
        updatedBy: actor,
        updatedAt: now,
        auditTrail: [...(Array.isArray(target.auditTrail) ? target.auditTrail : []), auditEntry]
    };
}

// Runtime slice from admin.js: approveFinancePatch.
function approveFinancePatch(storeKey, id) {
    const prefix = storeKey === 'payments' ? 'RCP' : 'DRT';
    const patch = withFinanceAudit(storeKey, id, 'approved', {
        status: 'Completed',
        receiptNumber: makeUniqueReceiptNumber(storeKey, prefix, id),
        approvedBy: currentFinanceActor(),
        approvedAt: new Date().toISOString()
    });
    return patch;
}

// Runtime slice from admin.js: rejectFinancePatch.
function rejectFinancePatch(storeKey, id, reason) {
    return withFinanceAudit(storeKey, id, 'rejected', {
        status: 'Rejected',
        notes: reason || 'Rejected by finance/admin'
    }, reason);
}

// Runtime slice from admin.js: reverseFinancePatch.
function reverseFinancePatch(storeKey, id, reason) {
    return withFinanceAudit(storeKey, id, 'reversed', {
        status: 'Reversed',
        reversalReason: reason,
        reversedBy: currentFinanceActor(),
        reversedAt: new Date().toISOString()
    }, reason);
}

// Runtime slice from admin.js: isSpecialRole.
function isSpecialRole(role) {
    return !['student', 'admin'].includes(String(role || 'student').toLowerCase());
}

// Runtime slice from admin.js: getLocalPendingRoleRequests.
function getLocalPendingRoleRequests() {
    return readStore('allMembers')
        .filter(member => isSpecialRole(member.role) && String(member.status || '').toLowerCase() !== 'active')
        .map(member => ({
            id: member.dbUserId || member.user_id || member.id || member.studentId || member.username,
            username: member.username || member.studentId || '',
            email: member.email || '',
            role: member.role || 'student',
            status: member.status || 'Pending',
            created_at: member.created_at || member.createdAt || '',
            first_name: member.fullName || member.name || '',
            last_name: '',
            student_id: member.studentId || member.username || '',
            phone: member.phone || '',
            course: member.course || '',
            year_of_study: member.yearOfStudy || ''
        }));
}

// Runtime slice from admin.js: approveLocalRoleRequest.
async function approveLocalRoleRequest(userId) {
    const members = readStore('allMembers');
    const target = members.find(member => String(member.dbUserId || member.user_id || member.id || member.studentId || member.username) === String(userId));
    if (!target || !isSpecialRole(target.role)) {
        return { success: false, message: 'Role request not found.' };
    }
    const activeHolder = members.find(member =>
        member !== target &&
        String(member.role || '').toLowerCase() === String(target.role || '').toLowerCase() &&
        String(member.status || '').toLowerCase() === 'active'
    );
    if (activeHolder) {
        return { success: false, message: `${target.role} role is already active. Remove or deactivate the existing holder first.` };
    }
    const updatedTarget = { ...target, status: 'Active', approvedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', approvedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member => member === target ? updatedTarget : member));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.updateMemberProfile && (target.uid || target.id)) {
        await window.SupabaseBackend.updateMemberProfile(target.uid || target.id, updatedTarget);
    }
    logLocalAdminActivity('approveRoleRequest', { user_id: userId, role: target.role, username: target.username || target.studentId || '' });
    return { success: true, message: 'Role request approved' };
}

// Runtime slice from admin.js: rejectLocalRoleRequest.
async function rejectLocalRoleRequest(userId) {
    const members = readStore('allMembers');
    const target = members.find(member => String(member.dbUserId || member.user_id || member.id || member.studentId || member.username) === String(userId));
    if (!target || !isSpecialRole(target.role)) {
        return { success: false, message: 'Role request not found.' };
    }
    const updatedTarget = { ...target, rejectedRole: target.role, role: 'student', status: 'Suspended', rejectedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', rejectedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member => member === target ? updatedTarget : member));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.updateMemberProfile && (target.uid || target.id)) {
        await window.SupabaseBackend.updateMemberProfile(target.uid || target.id, updatedTarget);
    }
    logLocalAdminActivity('rejectRoleRequest', { user_id: userId, role: target.role, username: target.username || target.studentId || '' });
    return { success: true, message: 'Role request rejected' };
}

// Runtime slice from admin.js: getLocalRoleAssignableMembers.
function getLocalRoleAssignableMembers() {
    return readStore('allMembers').map(member => ({
        id: member.dbUserId || member.user_id || member.id || member.studentId || member.username,
        username: member.username || member.studentId || '',
        email: member.email || '',
        role: member.role || 'student',
        status: member.status || 'Active',
        first_name: member.fullName || member.name || '',
        last_name: '',
        student_id: member.studentId || member.username || '',
        phone: member.phone || '',
        course: member.course || '',
        year_of_study: member.yearOfStudy || ''
    }));
}

// Runtime slice from admin.js: assignLocalMemberRole.
async function assignLocalMemberRole(request) {
    const userId = request.user_id;
    const role = String(request.role || 'student').toLowerCase();
    const status = String(request.status || 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    const members = readStore('allMembers');
    const target = members.find(member => String(member.dbUserId || member.user_id || member.id || member.studentId || member.username) === String(userId));
    if (!target) {
        return { success: false, message: 'Member not found.' };
    }
    if (isSpecialRole(role) && status.toLowerCase() === 'active') {
        const activeHolder = members.find(member =>
            member !== target &&
            String(member.role || '').toLowerCase() === role &&
            String(member.status || '').toLowerCase() === 'active'
        );
        if (activeHolder) {
            return { success: false, message: `${role} role is already active. Remove or deactivate the existing holder first.` };
        }
    }
    const updatedTarget = { ...target, role, status, roleAssignedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', roleAssignedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member =>
        member === target ? updatedTarget : member
    ));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.updateMemberProfile && (target.uid || target.id)) {
        await window.SupabaseBackend.updateMemberProfile(target.uid || target.id, updatedTarget);
    }
    logLocalAdminActivity('assignMemberRole', { user_id: userId, role, status, username: target.username || target.studentId || '' });
    return { success: true, message: 'Member role updated' };
}

// Runtime slice from admin.js: resetLocalMemberPassword.
function resetLocalMemberPassword(request) {
    return { success: false, message: 'Member passwords are managed by the hosted auth layer. Use the registered email reset flow instead.' };
}

// Runtime slice from admin.js: logStaticContentActivity.
function logStaticContentActivity(action, method, payload, result) {
    const trackedActions = [
        'createAnnouncement',
        'deleteAnnouncement',
        'createEvent',
        'deleteEvent',
        'addLeader',
        'deleteLeader',
        'addGalleryItem',
        'deleteGalleryItem',
        'addHadith',
        'deleteHadith',
        'updateWelfareStatus',
        'setPrayerTimes',
        'saveReligiousActivity',
        'deleteReligiousActivity',
        'addResource',
        'deleteResource',
        'approvePayment',
        'approveDonation',
        'rejectPayment',
        'rejectDonation',
        'reversePayment',
        'reverseDonation'
    ];
    if (!result?.success || !trackedActions.includes(action) || !['POST', 'PUT', 'DELETE'].includes(method)) {
        return;
    }
    logLocalAdminActivity(action, {
        method,
        message: result.message || 'Saved locally',
        request: payload,
        response: result.data || {}
    });
}

// Runtime slice from admin.js: shouldQueueLocalApproval.
function shouldQueueLocalApproval(action, method) {
    return ['POST', 'PUT', 'DELETE'].includes(method) && [
        'createAnnouncement',
        'deleteAnnouncement',
        'createEvent',
        'deleteEvent',
        'addLeader',
        'deleteLeader',
        'addGalleryItem',
        'deleteGalleryItem',
        'addHadith',
        'deleteHadith',
        'updateWelfareStatus',
        'setPrayerTimes',
        'saveReligiousActivity',
        'deleteReligiousActivity',
        'addResource',
        'deleteResource',
        'approvePayment',
        'approveDonation',
        'rejectPayment',
        'rejectDonation',
        'reversePayment',
        'reverseDonation'
    ].includes(action);
}

// Runtime slice from admin.js: approveLocalPendingAdminActivity.
function approveLocalPendingAdminActivity(logId) {
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log || log.action !== 'pendingAdminApproval') {
        return { success: false, message: 'Pending approval item not found.' };
    }
    const details = log.details || {};
    const requestedAction = details.requested_action;
    const request = details.request || {};
    const result = runApprovedLocalAction(requestedAction, request);
    if (!result.success) return result;
    logLocalAdminActivity('approvePendingAdminActivity', {
        log_id: logId,
        approved_admin: log.username || '',
        approved_action: requestedAction,
        result: result.data || {}
    });
    return { success: true, message: 'Pending action approved and applied', data: result.data || {} };
}

// Runtime slice from admin.js: runApprovedLocalAction.
function runApprovedLocalAction(actionName, request) {
    if (actionName === 'createAnnouncement') {
        const item = addStoreItem('adminAnnouncements', request);
        return { success: true, data: { announcement_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteAnnouncement') {
        deleteStoreItem('adminAnnouncements', request.announcement_id);
        return { success: true };
    }
    if (actionName === 'createEvent') {
        const item = addStoreItem('adminEvents', request);
        return { success: true, data: { event_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteEvent') {
        deleteStoreItem('adminEvents', request.event_id);
        return { success: true };
    }
    if (actionName === 'addLeader') {
        const item = addStoreItem('publicLeaders', request);
        return { success: true, data: { leader_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteLeader') {
        deleteStoreItem('publicLeaders', request.leader_id);
        return { success: true };
    }
    if (actionName === 'addGalleryItem') {
        const item = addStoreItem('galleryItems', { ...request, imageData: request.image_url, imageUrl: request.image_url });
        return { success: true, data: { gallery_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteGalleryItem') {
        deleteStoreItem('galleryItems', request.gallery_id);
        return { success: true };
    }
    if (actionName === 'addHadith') {
        const item = addStoreItem('adminHadiths', request);
        return { success: true, data: { hadith_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteHadith') {
        deleteStoreItem('adminHadiths', request.hadith_id);
        return { success: true };
    }
    if (actionName === 'addResource') {
        const item = addStoreItem('adminResources', request);
        return { success: true, data: { resource_id: item.id, id: item.id } };
    }
    if (actionName === 'deleteResource') {
        deleteStoreItem('adminResources', request.resource_id);
        return { success: true };
    }
    if (actionName === 'approvePayment') {
        updateLocalTransaction('payments', request.payment_id, approveFinancePatch('payments', request.payment_id));
        return { success: true };
    }
    if (actionName === 'approveDonation') {
        updateLocalTransaction('donations', request.donation_id, approveFinancePatch('donations', request.donation_id));
        return { success: true };
    }
    if (actionName === 'rejectPayment') {
        updateLocalTransaction('payments', request.payment_id, rejectFinancePatch('payments', request.payment_id, request.notes || 'Rejected by admin/treasurer'));
        return { success: true };
    }
    if (actionName === 'rejectDonation') {
        updateLocalTransaction('donations', request.donation_id, rejectFinancePatch('donations', request.donation_id, request.notes || 'Rejected by admin/treasurer'));
        return { success: true };
    }
    if (actionName === 'reversePayment') {
        updateLocalTransaction('payments', request.payment_id, reverseFinancePatch('payments', request.payment_id, request.reason || 'Reversed by main admin'));
        return { success: true };
    }
    if (actionName === 'reverseDonation') {
        updateLocalTransaction('donations', request.donation_id, reverseFinancePatch('donations', request.donation_id, request.reason || 'Reversed by main admin'));
        return { success: true };
    }
    if (actionName === 'setPrayerTimes') {
        localStorage.setItem('adminPrayerTimes', JSON.stringify(request));
        return { success: true };
    }
    if (actionName === 'saveReligiousActivity') {
        applyReligiousActivityRequest(request);
        return { success: true };
    }
    if (actionName === 'deleteReligiousActivity') {
        applyReligiousDeleteRequest(request);
        return { success: true };
    }
    return { success: false, message: 'This pending action cannot be approved automatically.' };
}

// Runtime slice from admin.js: deleteLocalAdminActivityItem.
function deleteLocalAdminActivityItem(logId) {
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log) {
        return { success: false, message: 'Activity log not found.' };
    }

    const details = log.details || {};
    const target = getActivityTarget(log.action, details);
    if (!target) {
        return { success: false, message: 'This activity cannot be deleted automatically.' };
    }

    deleteStoreItem(target.store, target.id);
    logLocalAdminActivity('deleteAdminActivityItem', {
        log_id: logId,
        opposed_admin: log.username || '',
        opposed_action: log.action
    });
    return { success: true, message: 'Item deleted and action recorded.' };
}

// Runtime slice from admin.js: deleteLocalAdminActivityLog.
function deleteLocalAdminActivityLog(logId, ownOnly = false) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const stores = ownOnly ? ['adminActivityLogs'] : ['adminActivityLogs', 'roleActivityLogs'];
    let removed = false;

    stores.forEach(storeName => {
        const logs = readStore(storeName);
        const target = logs.find(item => Number(item.id) === Number(logId));
        if (!target) return;
        if (ownOnly && Number(target.admin_id) !== Number(sessionAdmin?.id)) {
            return;
        }
        writeStore(storeName, logs.filter(item => Number(item.id) !== Number(logId)));
        removed = true;
    });

    if (!removed) {
        return {
            success: false,
            message: ownOnly ? 'You can only delete your own recent actions.' : 'Activity log not found.'
        };
    }

    return { success: true, message: 'Activity log deleted.' };
}

// Runtime slice from admin.js: clearLocalAdminActivityLogs.
function clearLocalAdminActivityLogs(ownOnly = false) {
    if (!ownOnly) {
        writeStore('adminActivityLogs', []);
        writeStore('roleActivityLogs', []);
        return { success: true, message: 'All admin activity logs cleared.' };
    }

    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    writeStore(
        'adminActivityLogs',
        readStore('adminActivityLogs').filter(item => Number(item.admin_id) !== Number(sessionAdmin?.id))
    );
    return { success: true, message: 'Your recent actions were cleared.' };
}

// Runtime slice from admin.js: undoLocalAdminActivityItem.
function undoLocalAdminActivityItem(logId) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log) {
        return { success: false, message: 'Activity log not found.' };
    }
    if (Number(log.admin_id) !== Number(sessionAdmin?.id)) {
        return { success: false, message: 'You can only undo your own admin actions.' };
    }

    const religiousUndo = undoLocalReligiousActivity(log.action, log.details || {});
    if (religiousUndo) {
        logLocalAdminActivity('undoMyAdminActivityItem', {
            log_id: logId,
            undone_action: log.action
        });
        return { success: true, message: 'Your action was undone and recorded.' };
    }

    const prayerUndo = undoLocalPrayerTimes(log.action, log.details || {});
    if (prayerUndo) {
        logLocalAdminActivity('undoMyAdminActivityItem', {
            log_id: logId,
            undone_action: log.action
        });
        return { success: true, message: 'Your action was undone and recorded.' };
    }

    if (undoLocalReligiousActivity(log.action, log.details || {}) || undoLocalPrayerTimes(log.action, log.details || {})) {
        logLocalAdminActivity('deleteAdminActivityItem', {
            log_id: logId,
            opposed_admin: log.username || '',
            opposed_action: log.action
        });
        return { success: true, message: 'Item deleted and action recorded.' };
    }

    const target = getActivityTarget(log.action, log.details || {});
    if (!target) {
        return { success: false, message: 'This activity cannot be undone automatically.' };
    }

    deleteStoreItem(target.store, target.id);
    logLocalAdminActivity('undoMyAdminActivityItem', {
        log_id: logId,
        undone_action: log.action
    });
    return { success: true, message: 'Your action was undone and recorded.' };
}

// Runtime slice from admin.js: undoLocalReligiousActivity.
function undoLocalReligiousActivity(actionName, details) {
    if (!['saveReligiousActivity', 'deleteReligiousActivity'].includes(actionName)) {
        return false;
    }
    const request = details.request || details;
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return false;

    const data = getReligiousActivities();
    const item = request.item || null;
    const previousItem = request.previous_item || null;

    if (actionName === 'deleteReligiousActivity' && previousItem) {
        data[key] = upsertReligiousActivity(data[key] || [], previousItem, previousItem.id);
    } else if (previousItem) {
        data[key] = upsertReligiousActivity(data[key] || [], previousItem, previousItem.id);
    } else if (item?.id) {
        data[key] = (data[key] || []).filter(existing => Number(existing.id) !== Number(item.id));
    } else {
        return false;
    }

    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
    return true;
}

// Runtime slice from admin.js: undoLocalPrayerTimes.
function undoLocalPrayerTimes(actionName, details) {
    if (actionName !== 'setPrayerTimes') return false;
    const request = details.request || details;
    const previous = request._previous_prayer_times;
    if (!previous || !previous.date) return false;
    localStorage.setItem('adminPrayerTimes', JSON.stringify(previous));
    renderPrayerPreview(previous);
    return true;
}

// Runtime slice from admin.js: getActivityTarget.
function getActivityTarget(actionName, details) {
    const response = details.response || {};
    const request = details.request || {};
    const mappings = {
        createAnnouncement: { store: 'adminAnnouncements', keys: ['announcement_id', 'id'] },
        createEvent: { store: 'adminEvents', keys: ['event_id', 'id'] },
        addLeader: { store: 'publicLeaders', keys: ['leader_id', 'id'] },
        addGalleryItem: { store: 'galleryItems', keys: ['gallery_id', 'id'] },
        addHadith: { store: 'adminHadiths', keys: ['hadith_id', 'id'] },
        addResource: { store: 'adminResources', keys: ['resource_id', 'id'] },
        saveReligiousActivity: { store: null, keys: ['id'] },
        setPrayerTimes: { store: null, keys: ['date'] }
    };
    const mapping = mappings[actionName];
    if (!mapping) return null;
    if (actionName === 'saveReligiousActivity') {
        const request = details.request || details;
        return request.item?.id ? { store: 'religious', id: request.item.id } : null;
    }
    if (actionName === 'setPrayerTimes') {
        const request = details.request || details;
        return request._previous_prayer_times?.date ? { store: 'prayerTimes', id: request._previous_prayer_times.date } : null;
    }

    const id = mapping.keys.map(key => response[key] || request[key] || details[key]).find(Boolean);
    return id ? { store: mapping.store, id } : null;
}

// Runtime slice from admin.js: handleStaticAdminApi.
function handleStaticAdminApi(action, method, payload, params) {
    if (
        !isCurrentLocalMainAdmin() &&
        shouldQueueLocalApproval(action, method)
    ) {
        logLocalAdminActivity('pendingAdminApproval', {
            requested_action: action,
            method,
            request: payload
        });
        return { success: true, message: 'Sent to main admin for approval', data: { pending_approval: true } };
    }

    switch (action) {
        case 'checkAdminSession': {
            const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
            if (!sessionAdmin) {
                return { success: false, message: 'Admin login required' };
            }
            const storedAdmin = findLocalAdminAccount(sessionAdmin);
            return { success: true, data: storedAdmin ? publicAdminAccount(storedAdmin) : sessionAdmin };
        }
        case 'getAdminSetupStatus': {
            const adminCount = getLocalAdminAccounts().length;
            return {
                success: true,
                data: {
                    admin_count: adminCount,
                    admin_limit: ADMIN_ACCOUNT_LIMIT,
                    can_register_first_admin: adminCount === 0
                }
            };
        }
        case 'registerAdmin':
            return registerLocalAdmin(payload);
        case 'loginAdmin':
            return loginLocalAdmin(payload);
        case 'requestAdminPasswordReset':
        case 'resetAdminPasswordWithCode':
            return { success: false, message: 'Secure admin email reset requires the PHP backend and configured email delivery.' };
        case 'logoutAdmin':
            sessionStorage.removeItem('currentAdminUser');
            return { success: true };
        case 'listAdminAccounts':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return listLocalAdminAccounts();
        case 'createAdminAccount':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return createLocalAdminByAdmin(payload);
        case 'deleteAdminAccount':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return deleteLocalAdminAccount(payload.admin_id);
        case 'getPendingRoleRequests':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view role requests.' };
            return { success: true, data: getLocalPendingRoleRequests() };
        case 'getRoleAssignableMembers':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view members.' };
            return { success: true, data: getLocalRoleAssignableMembers() };
        case 'assignMemberRole':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can assign roles.' };
            return assignLocalMemberRole(payload);
        case 'resetMemberPassword':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reset member passwords.' };
            return resetLocalMemberPassword(payload);
        case 'approveRoleRequest':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can approve role requests.' };
            return approveLocalRoleRequest(payload.user_id);
        case 'rejectRoleRequest':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reject role requests.' };
            return rejectLocalRoleRequest(payload.user_id);
        case 'changeAdminPassword':
            return changeLocalAdminPassword(payload);
        case 'resetAdminPassword':
            return { success: false, message: 'Admin password reset must be completed through the registered admin email.' };
        case 'getAdminActivityLogs':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view admin activity.' };
            return {
                success: true,
                data: [...readStore('adminActivityLogs'), ...readStore('roleActivityLogs')]
                    .sort((a, b) => new Date(b.created_at || b.id || 0) - new Date(a.created_at || a.id || 0))
                    .slice(0, 100)
            };
        case 'getMyAdminActivityLogs': {
            const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
            const logs = readStore('adminActivityLogs')
                .filter(log => Number(log.admin_id) === Number(sessionAdmin?.id))
                .slice(-50)
                .reverse();
            return { success: true, data: logs };
        }
        case 'opposeAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can oppose admin activity.' };
            logLocalAdminActivity('opposeAdminActivity', {
                log_id: payload.log_id,
                reason: payload.reason || ''
            });
            return { success: true, message: 'Activity opposed and recorded' };
        case 'deleteAdminActivityItem':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can delete admin activity items.' };
            return deleteLocalAdminActivityItem(payload.log_id);
        case 'deleteAdminActivityLog':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can delete admin activity logs.' };
            return deleteLocalAdminActivityLog(payload.log_id, false);
        case 'deleteMyAdminActivityLog':
            return deleteLocalAdminActivityLog(payload.log_id, true);
        case 'clearAdminActivityLogs':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can clear admin activity logs.' };
            return clearLocalAdminActivityLogs(false);
        case 'clearMyAdminActivityLogs':
            return clearLocalAdminActivityLogs(true);
        case 'createDatabaseBackup':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can download database backups.' };
            return createLocalDatabaseBackupResult();
        case 'approvePendingAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can approve pending actions.' };
            return approveLocalPendingAdminActivity(payload.log_id);
        case 'rejectPendingAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reject pending actions.' };
            logLocalAdminActivity('rejectPendingAdminActivity', {
                log_id: payload.log_id,
                reason: payload.reason || ''
            });
            return { success: true, message: 'Pending action rejected and recorded' };
        case 'undoMyAdminActivityItem':
            return undoLocalAdminActivityItem(payload.log_id);

        case 'getAnnouncements':
            return { success: true, data: readStore('adminAnnouncements') };
        case 'createAnnouncement': {
            const item = addStoreItem('adminAnnouncements', payload);
            return { success: true, message: 'Saved locally', data: { announcement_id: item.id, id: item.id } };
        }
        case 'deleteAnnouncement':
            deleteStoreItem('adminAnnouncements', payload.announcement_id);
            return { success: true };

        case 'getEvents':
            return { success: true, data: readStore('adminEvents') };
        case 'getEventRegistrations':
            return { success: true, data: readStore('registeredEvents') };
        case 'createEvent': {
            const item = addStoreItem('adminEvents', payload);
            return { success: true, message: 'Saved locally', data: { event_id: item.id, id: item.id } };
        }
        case 'deleteEvent':
            deleteStoreItem('adminEvents', payload.event_id);
            return { success: true };

        case 'getLeaders':
            return { success: true, data: readStore('publicLeaders') };
        case 'addLeader': {
            const item = addStoreItem('publicLeaders', payload);
            return { success: true, message: 'Saved locally', data: { leader_id: item.id, id: item.id } };
        }
        case 'deleteLeader':
            deleteStoreItem('publicLeaders', payload.leader_id);
            return { success: true };

        case 'getGallery':
            return { success: true, data: readStore('galleryItems') };
        case 'addGalleryItem': {
            const item = addStoreItem('galleryItems', {
                ...payload,
                imageData: payload.image_url,
                imageUrl: payload.image_url,
                media_type: payload.media_type || getGalleryMediaType(payload.image_url)
            });
            return { success: true, message: 'Saved locally', data: { gallery_id: item.id, id: item.id } };
        }
        case 'deleteGalleryItem':
            deleteStoreItem('galleryItems', payload.gallery_id);
            return { success: true };
        case 'getSiteSettings':
            return { success: true, data: getLocalSiteSettings() };
        case 'updateSiteSettings':
            localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...payload }));
            return { success: true, message: 'Saved locally', data: getLocalSiteSettings() };

        case 'getHadiths':
            return { success: true, data: readStore('adminHadiths') };
        case 'addHadith': {
            const item = addStoreItem('adminHadiths', payload);
            return { success: true, message: 'Saved locally', data: { hadith_id: item.id, id: item.id } };
        }
        case 'deleteHadith':
            deleteStoreItem('adminHadiths', payload.hadith_id);
            return { success: true };
        case 'getDashboardStats':
            return {
                success: true,
                data: {
                    members: getMemberRecords().length,
                    students: getStudentRecords().length,
                    active_students: getStudentRecords().filter(member => member.status === 'Active' || member.status === 'active').length,
                    announcements: readStore('adminAnnouncements').length,
                    events: readStore('adminEvents').length,
                    upcoming_events: readStore('adminEvents').length,
                    welfare_requests: readStore('welfareRequests').length,
                    pending_welfare: readStore('welfareRequests').filter(item => item.status === 'Pending Review' || item.status === 'pending').length,
                    payments: readStore('payments').length,
                    completed_payments: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').length,
                    pending_payments: readStore('payments').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).length,
                    failed_payments: readStore('payments').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).length,
                    payment_total: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    month_payment_total: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    pending_payment_amount: readStore('payments').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    failed_payment_amount: readStore('payments').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    donations: readStore('donations').length,
                    completed_donations: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').length,
                    pending_donations: readStore('donations').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).length,
                    failed_donations: readStore('donations').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).length,
                    donation_total: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    month_donation_total: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    pending_donation_amount: readStore('donations').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    failed_donation_amount: readStore('donations').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    resources: readStore('adminResources').length,
                    gallery: readStore('galleryItems').length,
                    leaders: readStore('publicLeaders').length,
                    hadiths: readStore('adminHadiths').length,
                    prayer_days: localStorage.getItem('adminPrayerTimes') ? 1 : 0
                }
            };
        case 'getDashboardDetail':
            return getStaticDashboardDetail(params.get('type'));
        case 'approvePayment':
            {
                const error = validateFinanceApproval('payments', payload.payment_id);
                if (error) return { success: false, message: error };
            }
            updateLocalTransaction('payments', payload.payment_id, approveFinancePatch('payments', payload.payment_id));
            return { success: true, message: 'Approved locally' };
        case 'approveDonation':
            {
                const error = validateFinanceApproval('donations', payload.donation_id);
                if (error) return { success: false, message: error };
            }
            updateLocalTransaction('donations', payload.donation_id, approveFinancePatch('donations', payload.donation_id));
            return { success: true, message: 'Approved locally' };
        case 'rejectPayment':
            updateLocalTransaction('payments', payload.payment_id, rejectFinancePatch('payments', payload.payment_id, payload.notes || 'Rejected by admin/treasurer'));
            return { success: true, message: 'Rejected locally' };
        case 'rejectDonation':
            updateLocalTransaction('donations', payload.donation_id, rejectFinancePatch('donations', payload.donation_id, payload.notes || 'Rejected by admin/treasurer'));
            return { success: true, message: 'Rejected locally' };
        case 'reversePayment':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reverse payments.' };
            updateLocalTransaction('payments', payload.payment_id, reverseFinancePatch('payments', payload.payment_id, payload.reason || 'Reversed by main admin'));
            return { success: true, message: 'Payment reversed locally' };
        case 'reverseDonation':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reverse donations.' };
            updateLocalTransaction('donations', payload.donation_id, reverseFinancePatch('donations', payload.donation_id, payload.reason || 'Reversed by main admin'));
            return { success: true, message: 'Donation reversed locally' };
        case 'getWelfareRequests':
            return { success: true, data: readStore('welfareRequests') };
        case 'updateWelfareStatus': {
            const requests = readStore('welfareRequests').map(item =>
                Number(item.id) === Number(payload.request_id) ? { ...item, status: payload.status, notes: payload.notes || '' } : item
            );
            writeStore('welfareRequests', requests);
            return { success: true };
        }
        case 'getPrayerTimes':
            return { success: true, data: JSON.parse(localStorage.getItem('adminPrayerTimes')) || null };
        case 'setPrayerTimes':
            localStorage.setItem('adminPrayerTimes', JSON.stringify(payload));
            return { success: true };
        case 'getResources':
            return { success: true, data: readStore('adminResources') };
        case 'addResource': {
            const item = addStoreItem('adminResources', payload);
            return { success: true, message: 'Saved locally', data: { resource_id: item.id, id: item.id } };
        }
        case 'deleteResource':
            deleteStoreItem('adminResources', payload.resource_id);
            return { success: true };
        default:
            return { success: false, message: 'Unsupported static action' };
    }
}

// Runtime slice from admin.js: handleAdminAccountApi.
async function handleAdminAccountApi(action, method, payload) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend?.hasAuthSession?.()) {
        return { success: false, message: 'Admin login required.' };
    }

    if (action === 'listAdminAccounts') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const admins = await window.SupabaseBackend.listAdminRoles();
        const currentUid = String(window.SupabaseBackend.currentUid?.() || currentAdmin?.id || '');
        const normalizedAdmins = admins.map(admin => ({
            id: admin.uid || admin.id,
            uid: admin.uid || admin.id,
            username: admin.username || admin.fullName || admin.email || '',
            email: admin.email || '',
            status: admin.status || 'active',
            isMainAdmin: Boolean(admin.isMainAdmin),
            is_current: String(admin.uid || admin.id) === currentUid,
            created_at: admin.createdAt || admin.created_at || admin.updatedAt || ''
        })).sort((a, b) => Number(Boolean(b.isMainAdmin)) - Number(Boolean(a.isMainAdmin)) || String(a.email).localeCompare(String(b.email)));
        return {
            success: true,
            data: {
                admins: normalizedAdmins,
                admin_count: normalizedAdmins.length,
                admin_limit: ADMIN_ACCOUNT_LIMIT
            }
        };
    }

    if (action === 'createAdminAccount') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const username = String(payload.username || '').trim();
        const email = String(payload.email || '').trim().toLowerCase();
        const password = String(payload.password || '');
        if (!username || !email.includes('@')) {
            return { success: false, message: 'Enter a valid admin username and email.' };
        }
        if (!isStrongAdminPassword(password)) {
            return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
        }
        const admins = await window.SupabaseBackend.listAdminRoles();
        if (admins.length >= ADMIN_ACCOUNT_LIMIT) {
            return { success: false, message: `Admin limit reached (${ADMIN_ACCOUNT_LIMIT}). Remove an admin before adding another.` };
        }
        if (admins.some(admin => String(admin.email || '').toLowerCase() === email)) {
            return { success: false, message: 'This email already has admin access.' };
        }
        const authUser = await window.SupabaseBackend.createSecondaryAdminAuthUser(email, password, username).catch(e => { throw new Error(e.message); });
        await window.SupabaseBackend.saveAdminRoleForUid(authUser.uid, {
            username,
            email,
            fullName: username,
            isMainAdmin: false,
            status: 'active',
            createdBy: String(currentAdmin?.id || window.SupabaseBackend.currentUid?.() || ''),
            createdByEmail: String(currentAdmin?.email || window.SupabaseBackend.currentEmail?.() || ''),
            createdAt: new Date().toISOString()
        });
        logLocalAdminActivity('createAdminAccount', { username, email, uid: authUser.uid });
        return { success: true, message: 'Admin account added successfully.', data: { uid: authUser.uid, email, username } };
    }

    if (action === 'deleteAdminAccount') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const adminId = String(payload.admin_id || payload.uid || '').trim();
        if (!adminId) return { success: false, message: 'Admin ID is required.' };
        if (adminId === String(window.SupabaseBackend.currentUid?.() || currentAdmin?.id || '')) {
            return { success: false, message: 'You cannot remove your own admin account while logged in.' };
        }
        const admins = await window.SupabaseBackend.listAdminRoles();
        const target = admins.find(admin => String(admin.uid || admin.id) === adminId);
        if (!target) return { success: false, message: 'Admin account not found.' };
        if (target.isMainAdmin) return { success: false, message: 'Main admin cannot be removed from sub-admin tools.' };
        await window.SupabaseBackend.deleteAdminRole(adminId);
        logLocalAdminActivity('deleteAdminAccount', { admin_id: adminId, email: target.email || '' });
        return { success: true, message: 'Admin access removed.' };
    }

    if (action === 'changeAdminPassword') {
        const newPassword = String(payload.new_password || payload.password || '');
        if (!isStrongAdminPassword(newPassword)) {
            return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
        }
        await window.SupabaseBackend.updateCurrentPassword(newPassword);
        logLocalAdminActivity('changeAdminPassword', { admin_id: currentAdmin?.id || window.SupabaseBackend.currentUid?.() || '' });
        return { success: true, message: 'Password changed successfully.' };
    }

    if (action === 'resetAdminPassword') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can reset admin passwords.' };
        }
        const email = String(payload.email || '').trim().toLowerCase();
        if (!email.includes('@')) return { success: false, message: 'Admin email is required.' };
        await window.SupabaseBackend.sendPasswordResetEmail(email);
        return { success: true, message: 'Password reset email sent to this admin.' };
    }

    return { success: false, message: 'Unsupported admin account action.' };
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    if (useStaticAdminApi) {
        loadCloudAdminStores().catch(error => {
            console.warn('Initial cloud admin store preload failed:', error);
        });
    }
    normalizeLocalAdminAccountsOnce();
    document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
    document.getElementById('adminRegisterForm')?.addEventListener('submit', handleAdminRegistration);
    document.getElementById('adminForgotPasswordForm')?.addEventListener('submit', handleAdminForgotPassword);
    document.getElementById('adminResetWithCodeForm')?.addEventListener('submit', handleAdminResetWithCode);
    document.getElementById('adminCreateForm')?.addEventListener('submit', handleManagedAdminCreate);
    document.getElementById('memberRoleAssignForm')?.addEventListener('submit', handleMemberRoleAssign);
    document.getElementById('memberPasswordResetForm')?.addEventListener('submit', handleMemberPasswordReset);
    document.getElementById('adminChangePasswordForm')?.addEventListener('submit', handleAdminPasswordChange);
    window.addEventListener('storage', handleAdminSharedStoreChange);
    await refreshAdminSetupUi();
    const isAuthenticated = await checkAdminAuth();
    if (isAuthenticated) {
        startAdminSessionTimer();
        await refreshCloudAdminStores(true);
        startAdminRealtimeListeners();
        loadAllData();
        setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
        setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
    }
});

// Runtime slice from admin.js: handleAdminSharedStoreChange.
function handleAdminSharedStoreChange(event) {
    if (!['allMembers', 'payments', 'donations', 'welfareRequests', 'registeredEvents'].includes(event.key)) return;
    loadDashboardStatsFromLocal();
    const accountView = document.getElementById('accountView');
    if (accountView?.classList.contains('active') && currentAdmin?.isMainAdmin) {
        loadPendingRoleRequests();
        loadRoleAssignableMembers();
    }
    if (lastDashboardDetailType) {
        loadDashboardDetailFromLocal(lastDashboardDetailType);
    }
}

// Runtime slice from admin.js: refreshAdminRegistrationCapture.
async function refreshAdminRegistrationCapture() {
    if (!currentAdmin) return;
    await refreshCloudAdminStores(true);
    loadDashboardStatsFromLocal();
    const accountView = document.getElementById('accountView');
    if (accountView?.classList.contains('active') && currentAdmin?.isMainAdmin) {
        loadPendingRoleRequests();
        loadRoleAssignableMembers();
    }
}

// Runtime slice from admin.js: stopAdminRealtimeListeners.
function stopAdminRealtimeListeners() {
    adminRealtimeUnsubscribers.forEach(unsubscribe => {
        try {
            unsubscribe?.();
        } catch (error) {
            console.warn('Admin realtime unsubscribe failed:', error);
        }
    });
    adminRealtimeUnsubscribers = [];
}

// Runtime slice from admin.js: startAdminRealtimeListeners.
function startAdminRealtimeListeners() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.() || adminRealtimeUnsubscribers.length) return;
    const collections = {
        members: 'allMembers',
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords'
    };
    Object.entries(collections).forEach(([collection, storeKey]) => {
        window.SupabaseBackend.watchCollection?.(collection, records => {
            localStorage.setItem(storeKey, JSON.stringify(records));
            handleAdminSharedStoreChange({ key: storeKey });
        }).then(unsubscribe => {
            adminRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => {
            console.warn(`${collection} admin realtime listener unavailable; using live refresh fallback:`, error);
        });
    });
}

// Runtime slice from admin.js: loadCloudAdminStores.
async function loadCloudAdminStores() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    const members = await window.SupabaseBackend.listMembers().catch(() => null);
    if (Array.isArray(members)) {
        localStorage.setItem('allMembers', JSON.stringify(members));
        members
            .filter(member => String(member.status || '').toLowerCase() === 'active')
            .slice(0, 150)
            .forEach(member => {
                window.SupabaseBackend.saveMemberVerification?.(member).catch(error => {
                    console.error('Member verification backfill failed:', error);
                });
            });
    }
    const stores = await window.SupabaseBackend.loadStores([
        LOCAL_ADMIN_ACCOUNTS_KEY,
        'adminActivityLogs',
        ADMIN_NOTIFICATION_LOG_KEY,
        'roleActivityLogs',
        'adminAnnouncements',
        'adminEvents',
        'publicLeaders',
        'galleryItems',
        'adminHadiths',
        'adminResources',
        'welfareRequests',
        'payments',
        'donations'
    ]).catch(() => ({}));
    Object.entries(stores).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
    });
    const collectionMap = {
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords'
    };
    await Promise.all(Object.entries(collectionMap).map(async ([collection, key]) => {
        const records = await window.SupabaseBackend.listRecords(collection).catch(() => null);
        if (Array.isArray(records)) {
            localStorage.setItem(key, JSON.stringify(records));
        }
    }));
    cloudAdminStoresLoadedAt = Date.now();
}

// Runtime slice from admin.js: refreshCloudAdminStores.
function refreshCloudAdminStores(force = false) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return Promise.resolve();
    if (!force && cloudAdminStoresPromise) return cloudAdminStoresPromise;
    if (!force && cloudAdminStoresLoadedAt && Date.now() - cloudAdminStoresLoadedAt < 20000) return Promise.resolve();
    cloudAdminStoresPromise = loadCloudAdminStores()
        .catch(error => {
            console.error('Cloud admin store refresh failed:', error);
        })
        .finally(() => {
            cloudAdminStoresPromise = null;
        });
    return cloudAdminStoresPromise;
}

// Runtime slice from admin.js: blockAdminStaticPreview.
function blockAdminStaticPreview() {
    document.getElementById('adminLoginScreen')?.classList.remove('d-none');
    document.getElementById('adminContainer')?.classList.add('locked');

    const registerItem = document.getElementById('adminRegisterTabItem');
    registerItem?.classList.add('d-none');

    document.querySelectorAll('.admin-auth-tabs, #adminLoginTab, #adminRegisterTab, #adminForgotTab').forEach(element => {
        element.classList.add('d-none');
    });
    document.querySelectorAll('#adminLoginScreen input, #adminLoginScreen button:not([data-bs-dismiss])').forEach(control => {
        control.disabled = true;
    });

    const error = document.getElementById('adminLoginError');
    if (error) {
        error.className = 'alert alert-warning admin-login-error active';
        error.innerHTML = `
            <strong>Admin panel is blocked on this preview link.</strong><br>
            This static preview page cannot run the live backend. Use the live admin app for real account changes and updates.
            Use the real hosted PHP/Supabase link for admin login, approvals, and system changes.
        `;
    }
}

['click', 'keydown', 'mousemove', 'touchstart'].forEach(eventName => {
    document.addEventListener(eventName, () => {
        if (currentAdmin) startAdminSessionTimer();
    }, { passive: true });
});

// Check if user is authenticated as admin

// Runtime slice from admin.js: checkAdminAuth.
async function checkAdminAuth() {
    try {
        const response = await fetch(`${API_URL}?action=checkAdminSession`);
        const result = await parseJsonResponse(response);
        if (!result.success || !result.data) {
            showAdminLogin(useStaticAdminApi ? getLocalAdminPrompt() : '');
            return false;
        }

        setAdminUser(result.data);
        showAdminPanel();
        return true;
    } catch (error) {
        showAdminLogin(getLocalAdminPrompt());
        return false;
    }
}

// Runtime slice from admin.js: getLocalAdminPrompt.
function getLocalAdminPrompt() {
    if (useStaticAdminApi && window.SupabaseBackend?.enabled) {
        return 'Login with the registered main admin email. New admins are added inside the admin panel.';
    }
    const count = getLocalAdminAccounts().length;
    if (count === 0) {
        return 'Create the first admin account. After that, admins are added inside the panel.';
    }
    return 'Login with an admin account. New admins must be added inside the panel.';
}

// Runtime slice from admin.js: refreshAdminSetupUi.
async function refreshAdminSetupUi() {
    const registerItem = document.getElementById('adminRegisterTabItem');
    const registerButton = document.getElementById('adminRegisterTabBtn');
    const loginButton = document.getElementById('adminLoginTabBtn');
    try {
        if (useStaticAdminApi && window.SupabaseBackend?.enabled && !window.SupabaseBackend.hasAuthSession()) {
            registerItem?.classList.add('d-none');
            if (loginButton) {
                bootstrap.Tab.getOrCreateInstance(loginButton).show();
            }
            return;
        }
        const response = await fetch(`${API_URL}?action=getAdminSetupStatus`);
        const result = await parseJsonResponse(response);
        const canRegister = Boolean(result.success && result.data?.can_register_first_admin);
        registerItem?.classList.toggle('d-none', !canRegister);
        if (loginButton) {
            bootstrap.Tab.getOrCreateInstance(loginButton).show();
        }
    } catch (error) {
        const canRegister = useStaticAdminApi && !window.SupabaseBackend?.enabled && getLocalAdminAccounts().length === 0;
        registerItem?.classList.toggle('d-none', !canRegister);
        if (loginButton) {
            bootstrap.Tab.getOrCreateInstance(loginButton).show();
        }
    }
}

// Runtime slice from admin.js: getLocalAdminAccounts.
function getLocalAdminAccounts() {
    return JSON.parse(localStorage.getItem(LOCAL_ADMIN_ACCOUNTS_KEY) || '[]');
}

// Runtime slice from admin.js: saveLocalAdminAccounts.
function saveLocalAdminAccounts(accounts) {
    localStorage.setItem(LOCAL_ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
    saveCloudStore(LOCAL_ADMIN_ACCOUNTS_KEY, accounts);
}

// Runtime slice from admin.js: getLocalMainAdminId.
function getLocalMainAdminId() {
    const accounts = getLocalAdminAccounts();
    return Number((accounts[0] || {}).id || 0);
}

// Runtime slice from admin.js: normalizeLocalAdminAccountsOnce.
function normalizeLocalAdminAccountsOnce() {
    if (window.SupabaseBackend?.enabled) return;
    if (useStaticAdminApi && !localStorage.getItem(LOCAL_ADMIN_FULL_RESET_KEY)) {
        localStorage.removeItem(LOCAL_ADMIN_ACCOUNTS_KEY);
        localStorage.removeItem('adminActivityLogs');
        sessionStorage.removeItem('currentAdminUser');
        localStorage.setItem(LOCAL_ADMIN_FULL_RESET_KEY, '1');
        return;
    }
    if (!useStaticAdminApi || localStorage.getItem(LOCAL_ADMIN_CLEANUP_KEY)) return;
    const accounts = getLocalAdminAccounts();
    if (!accounts.length) {
        localStorage.setItem(LOCAL_ADMIN_CLEANUP_KEY, '1');
        return;
    }
    saveLocalAdminAccounts([accounts[0]]);
    sessionStorage.removeItem('currentAdminUser');
    localStorage.setItem(LOCAL_ADMIN_CLEANUP_KEY, '1');
}

// Runtime slice from admin.js: isCurrentLocalMainAdmin.
function isCurrentLocalMainAdmin() {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    return isLocalMainAdminCandidate(sessionAdmin);
}

// Runtime slice from admin.js: resolveAdminUser.
async function resolveAdminUser(username) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.()) return null;
    const email = window.SupabaseBackend.currentEmail?.() || username;
    let adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        await window.SupabaseBackend.saveAdminRole?.({
            username: 'iman',
            email,
            fullName: 'Imam',
            isMainAdmin: true
        }).catch(() => null);
        adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
    }
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        adminRole = {
            uid: window.SupabaseBackend.currentUid?.(),
            username: 'iman',
            email,
            fullName: 'Imam',
            role: 'admin',
            isMainAdmin: true
        };
    }
    if (!adminRole) throw new Error('This account is not registered as an admin.');
    return {
        id: window.SupabaseBackend.currentUid?.() || adminRole.uid || email,
        username: adminRole.username || username || email.split('@')[0],
        email,
        fullName: adminRole.fullName || adminRole.full_name || adminRole.username || username || email,
        role: adminRole.role || 'admin',
        isMainAdmin: Boolean(adminRole.isMainAdmin),
        csrf_token: 'supabase'
    };
}

// Runtime slice from admin.js: findLocalAdminAccount.
function findLocalAdminAccount(adminLike) {
    const accounts = getLocalAdminAccounts();
    return accounts.find(admin => Number(admin.id) === Number(adminLike.id)) ||
        accounts.find(admin =>
            String(admin.username || '').toLowerCase() === String(adminLike.username || '').toLowerCase() ||
            String(admin.email || '').toLowerCase() === String(adminLike.email || '').toLowerCase()
        );
}

// Runtime slice from admin.js: isLocalMainAdminCandidate.
function isLocalMainAdminCandidate(adminLike) {
    if (!adminLike) return false;
    const accounts = getLocalAdminAccounts();
    if (accounts.length <= 1) return true;
    return Number(adminLike.id) === getLocalMainAdminId();
}

// Runtime slice from admin.js: logLocalAdminActivity.
function logLocalAdminActivity(actionName, details = {}) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    if (!sessionAdmin) return;
    const activity = {
        admin_id: sessionAdmin.id,
        username: sessionAdmin.username,
        email: sessionAdmin.email || '',
        action: actionName,
        details,
        ip_address: 'local browser'
    };
    addStoreItem('adminActivityLogs', activity);
    window.SupabaseBackend?.createAuditLog?.(actionName, {
        ...details,
        localAdminId: sessionAdmin.id,
        localAdminUsername: sessionAdmin.username,
        localAdminEmail: sessionAdmin.email || ''
    }).catch(error => {
        console.warn('Cloud audit log failed:', error);
    });
}

// Runtime slice from admin.js: bytesToHex.
function bytesToHex(bytes) {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Runtime slice from admin.js: hexToBytes.
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

// Runtime slice from admin.js: createPasswordSalt.
function createPasswordSalt() {
    const salt = new Uint8Array(16);
    if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(salt);
        return bytesToHex(salt);
    }
    for (let i = 0; i < salt.length; i += 1) {
        salt[i] = Math.floor(Math.random() * 256);
    }
    return bytesToHex(salt);
}

// Runtime slice from admin.js: legacyHashAdminPassword.
async function legacyHashAdminPassword(password) {
    if (window.crypto?.subtle) {
        const data = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return bytesToHex(new Uint8Array(digest));
    }
    return btoa(unescape(encodeURIComponent(password)));
}

// Runtime slice from admin.js: hashAdminPassword.
async function hashAdminPassword(password, salt = createPasswordSalt()) {
    if (!window.crypto?.subtle) {
        return {
            passwordHash: await legacyHashAdminPassword(`${salt}:${password}`),
            passwordSalt: salt,
            passwordIterations: 1,
            passwordAlgorithm: 'SHA-256-FALLBACK'
        };
    }

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: hexToBytes(salt),
            iterations: ADMIN_HASH_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );

    return {
        passwordHash: bytesToHex(new Uint8Array(derivedBits)),
        passwordSalt: salt,
        passwordIterations: ADMIN_HASH_ITERATIONS,
        passwordAlgorithm: ADMIN_HASH_ALGORITHM
    };
}

// Runtime slice from admin.js: publicAdminAccount.
function publicAdminAccount(admin) {
    const {
        passwordHash,
        passwordSalt,
        passwordIterations,
        passwordAlgorithm,
        ...publicAdmin
    } = admin;
    return {
        ...publicAdmin,
        isMainAdmin: Number(admin.id) === getLocalMainAdminId()
    };
}

// Runtime slice from admin.js: registerLocalAdmin.
async function registerLocalAdmin(payload) {
    const username = String(payload.username || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    if (!username || !email || !password) {
        return { success: false, message: 'All admin registration fields are required.' };
    }
    if (!isStrongAdminPassword(password)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (accounts.length > 0) {
        return { success: false, message: 'Only the first admin can register here. Other admins must be added inside the admin panel.' };
    }
    if (accounts.some(account => account.username.toLowerCase() === username.toLowerCase() || account.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'This admin username or email already exists.' };
    }

    const passwordRecord = await hashAdminPassword(password);
    const admin = {
        id: Date.now(),
        username,
        email,
        ...passwordRecord,
        role: 'admin',
        fullName: username,
        created_at: new Date().toISOString()
    };
    accounts.push(admin);
    saveLocalAdminAccounts(accounts);

    const publicAdmin = publicAdminAccount(admin);
    sessionStorage.setItem('currentAdminUser', JSON.stringify(publicAdmin));
    logLocalAdminActivity('registerAdmin', { message: 'First admin registered' });
    return { success: true, message: 'Admin account created', data: publicAdmin };
}

// Runtime slice from admin.js: listLocalAdminAccounts.
function listLocalAdminAccounts() {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const admins = getLocalAdminAccounts().map(admin => ({
        ...publicAdminAccount(admin),
        status: admin.status || 'active',
        is_current: sessionAdmin && Number(sessionAdmin.id) === Number(admin.id)
    }));
    return {
        success: true,
        data: {
            admins,
            admin_count: admins.length,
            admin_limit: ADMIN_ACCOUNT_LIMIT
        }
    };
}

// Runtime slice from admin.js: createLocalAdminByAdmin.
async function createLocalAdminByAdmin(payload) {
    const username = String(payload.username || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    if (!username || !email || !password) {
        return { success: false, message: 'All admin fields are required.' };
    }
    if (!isStrongAdminPassword(password)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (accounts.length >= ADMIN_ACCOUNT_LIMIT) {
        return { success: false, message: 'This admin can only add two other admins.' };
    }
    if (accounts.some(account => account.username.toLowerCase() === username.toLowerCase() || account.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'This admin username or email already exists.' };
    }

    const passwordRecord = await hashAdminPassword(password);
    const admin = {
        id: Date.now(),
        username,
        email,
        ...passwordRecord,
        role: 'admin',
        status: 'active',
        fullName: username,
        created_at: new Date().toISOString()
    };
    accounts.push(admin);
    saveLocalAdminAccounts(accounts);
    logLocalAdminActivity('createAdminAccount', { username, email });
    return { success: true, message: 'Admin account added', data: publicAdminAccount(admin) };
}

// Runtime slice from admin.js: deleteLocalAdminAccount.
function deleteLocalAdminAccount(adminId) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const accounts = getLocalAdminAccounts();
    if (Number(adminId) === Number(sessionAdmin?.id)) {
        return { success: false, message: 'You cannot remove your own admin account while logged in.' };
    }
    if (accounts.length <= 1) {
        return { success: false, message: 'At least one admin account must remain.' };
    }
    const nextAccounts = accounts.filter(account => Number(account.id) !== Number(adminId));
    if (nextAccounts.length === accounts.length) {
        return { success: false, message: 'Admin account not found.' };
    }
    saveLocalAdminAccounts(nextAccounts);
    logLocalAdminActivity('deleteAdminAccount', { admin_id: adminId });
    return { success: true, message: 'Admin account removed.' };
}

// Runtime slice from admin.js: verifyLocalAdminPassword.
async function verifyLocalAdminPassword(account, password) {
    if (account.passwordSalt && account.passwordAlgorithm === ADMIN_HASH_ALGORITHM) {
        const passwordRecord = await hashAdminPassword(password, account.passwordSalt);
        return account.passwordHash === passwordRecord.passwordHash;
    }
    if (account.passwordSalt && account.passwordAlgorithm === 'SHA-256-FALLBACK') {
        return account.passwordHash === await legacyHashAdminPassword(`${account.passwordSalt}:${password}`);
    }
    return account.passwordHash === await legacyHashAdminPassword(password);
}

// Runtime slice from admin.js: changeLocalAdminPassword.
async function changeLocalAdminPassword(payload) {
    const currentPassword = String(payload.current_password || '');
    const newPassword = String(payload.new_password || '');
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const accounts = getLocalAdminAccounts();
    const index = accounts.findIndex(account => Number(account.id) === Number(sessionAdmin?.id));
    if (index < 0) {
        return { success: false, message: 'Current admin account not found.' };
    }
    if (!currentPassword || !newPassword) {
        return { success: false, message: 'Current and new password are required.' };
    }
    if (!isStrongAdminPassword(newPassword)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (!(await verifyLocalAdminPassword(accounts[index], currentPassword))) {
        return { success: false, message: 'Current password is incorrect.' };
    }
    accounts[index] = {
        ...accounts[index],
        ...(await hashAdminPassword(newPassword))
    };
    saveLocalAdminAccounts(accounts);
    logLocalAdminActivity('changeAdminPassword', { admin_id: accounts[index].id });
    return { success: true, message: 'Password changed successfully.' };
}

// Runtime slice from admin.js: resetLocalAdminPassword.
async function resetLocalAdminPassword(payload) {
    return { success: false, message: 'Admin password reset must be completed through the registered admin email.' };
}

// Runtime slice from admin.js: loginLocalAdmin.
async function loginLocalAdmin(payload) {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '');
    const accounts = getLocalAdminAccounts();

    const accountIndex = accounts.findIndex(admin =>
        admin.username.toLowerCase() === username.toLowerCase() ||
        admin.email.toLowerCase() === username.toLowerCase()
    );
    const account = accountIndex >= 0 ? accounts[accountIndex] : null;

    if (!account) {
        return { success: false, message: 'Invalid admin username or password.' };
    }

    let passwordMatches = false;
    if (account.passwordSalt && account.passwordAlgorithm === ADMIN_HASH_ALGORITHM) {
        const passwordRecord = await hashAdminPassword(password, account.passwordSalt);
        passwordMatches = account.passwordHash === passwordRecord.passwordHash;
    } else if (account.passwordSalt && account.passwordAlgorithm === 'SHA-256-FALLBACK') {
        passwordMatches = account.passwordHash === await legacyHashAdminPassword(`${account.passwordSalt}:${password}`);
        if (passwordMatches && window.crypto?.subtle) {
            accounts[accountIndex] = {
                ...account,
                ...(await hashAdminPassword(password))
            };
            saveLocalAdminAccounts(accounts);
        }
    } else {
        passwordMatches = account.passwordHash === await legacyHashAdminPassword(password);
        if (passwordMatches) {
            accounts[accountIndex] = {
                ...account,
                ...(await hashAdminPassword(password))
            };
            saveLocalAdminAccounts(accounts);
        }
    }

    if (!passwordMatches) {
        return { success: false, message: 'Invalid admin username or password.' };
    }

    const publicAdmin = publicAdminAccount(accounts[accountIndex]);
    sessionStorage.setItem('currentAdminUser', JSON.stringify(publicAdmin));
    logLocalAdminActivity('loginAdmin', { message: 'Admin logged in' });
    return { success: true, message: 'Admin login successful', data: publicAdmin };
}

// Runtime slice from admin.js: setAdminUser.
function setAdminUser(user) {
    const storedAdmin = useStaticAdminApi ? findLocalAdminAccount(user) : null;
    const resolvedUser = storedAdmin ? publicAdminAccount(storedAdmin) : user;
    const inferredMainAdmin = Boolean(resolvedUser.isMainAdmin) ||
        (useStaticAdminApi && isLocalMainAdminCandidate(resolvedUser));
    currentAdmin = {
        id: resolvedUser.id,
        username: resolvedUser.username,
        email: resolvedUser.email || '',
        fullName: resolvedUser.fullName || resolvedUser.full_name || resolvedUser.username,
        role: resolvedUser.role,
        profile_photo: resolvedUser.profile_photo || '',
        csrf_token: resolvedUser.csrf_token || '',
        isMainAdmin: inferredMainAdmin
    };
    sessionStorage.setItem('currentAdminUser', JSON.stringify(currentAdmin));
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'admin');
    if (currentAdmin.isMainAdmin) {
        closePublicAdminPortal();
    }
    document.getElementById('adminName').textContent = currentAdmin.fullName || currentAdmin.username;
    updateAdminPhotoUi();
    updateAdminAccessUi();
}

// Runtime slice from admin.js: updateAdminAccessUi.
function updateAdminAccessUi() {
    const mainAdminAccountTools = document.getElementById('mainAdminAccountTools');
    mainAdminAccountTools?.classList.toggle('d-none', !currentAdmin?.isMainAdmin);
}

// Runtime slice from admin.js: showAdminLogin.
function showAdminLogin(message = '') {
    document.getElementById('adminLoginScreen')?.classList.remove('d-none');
    document.getElementById('adminContainer')?.classList.add('locked');
    const error = document.getElementById('adminLoginError');
    if (error) {
        error.textContent = message;
        error.classList.toggle('active', Boolean(message));
    }
}

// Runtime slice from admin.js: showAdminPanel.
function showAdminPanel() {
    document.getElementById('adminLoginScreen')?.classList.add('d-none');
    document.getElementById('adminContainer')?.classList.remove('locked');
    updateAdminAccessUi();
}

// Runtime slice from admin.js: handleAdminLogin.
async function handleAdminLogin(event) {
    event.preventDefault();
    const lockout = getAdminLoginLockout();
    if (lockout.locked) {
        showAdminLogin(`Too many failed attempts. Try again in ${lockout.minutes} minute(s).`);
        return;
    }
    const username = document.getElementById('adminLoginUsername').value.trim().toLowerCase();
    const password = document.getElementById('adminLoginPassword').value;
    const button = document.getElementById('adminLoginButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

    try {
        if (useStaticAdminApi && window.SupabaseBackend?.enabled) {
            await window.SupabaseBackend.loginEmail(username, password);
            await window.SupabaseBackend.ensureRealtimeAuth?.(username, password).catch(error => {
                console.warn('Realtime auth unavailable for admin panel:', error);
            });
            const adminUser = await resolveAdminUser(username);
            clearAdminLoginFailures();
            setAdminUser(adminUser);
            showAdminPanel();
            document.getElementById('adminLoginForm').reset();
            startAdminSessionTimer();
            startAdminRealtimeListeners();
            loadCloudAdminStores()
                .catch(error => console.warn('Could not load cloud admin stores after login:', error))
                .finally(() => {
                    loadAllData();
                    refreshAdminRegistrationCapture();
                    setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
                    setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
                });
            return;
        }
        const response = await fetch(`${API_URL}?action=loginAdmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await parseJsonResponse(response);

        if (!result.success || !result.data) {
            recordAdminLoginFailure();
            showAdminLogin(result.message || 'Invalid admin username or password.');
            return;
        }

        clearAdminLoginFailures();
        setAdminUser(result.data);
        showAdminPanel();
        document.getElementById('adminLoginForm').reset();
        startAdminSessionTimer();
        startAdminRealtimeListeners();
        loadAllData();
        refreshAdminRegistrationCapture();
        setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
        setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
    } catch (loginError) {
        const rawMessage = loginError.message || '';
        const friendlyMessage = /failed to fetch|networkerror|load failed/i.test(rawMessage)
            ? 'Admin login could not reach the hosted backend. Check your internet connection, turn off Brave Shields/ad blocker for this site, then refresh and try again.'
            : rawMessage || 'Unable to verify admin login. Please check the server and database.';
        showAdminLogin(friendlyMessage);
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-lock"></i> Login to Admin Panel';
    }
}

// Runtime slice from admin.js: getAdminLoginFailures.
function getAdminLoginFailures() {
    return JSON.parse(localStorage.getItem(ADMIN_LOGIN_FAILURE_KEY) || '{"count":0,"lockedUntil":0}');
}

// Runtime slice from admin.js: getAdminLoginLockout.
function getAdminLoginLockout() {
    const failures = getAdminLoginFailures();
    const now = Date.now();
    if (Number(failures.lockedUntil || 0) > now) {
        return {
            locked: true,
            minutes: Math.ceil((Number(failures.lockedUntil) - now) / 60000)
        };
    }
    return { locked: false, minutes: 0 };
}

// Runtime slice from admin.js: recordAdminLoginFailure.
function recordAdminLoginFailure() {
    const failures = getAdminLoginFailures();
    const count = Number(failures.count || 0) + 1;
    const lockedUntil = count >= ADMIN_MAX_FAILED_LOGINS ? Date.now() + ADMIN_LOGIN_LOCKOUT_MS : 0;
    localStorage.setItem(ADMIN_LOGIN_FAILURE_KEY, JSON.stringify({ count, lockedUntil }));
}

// Runtime slice from admin.js: clearAdminLoginFailures.
function clearAdminLoginFailures() {
    localStorage.removeItem(ADMIN_LOGIN_FAILURE_KEY);
}

// Runtime slice from admin.js: isStrongAdminPassword.
function isStrongAdminPassword(password) {
    return String(password || '').length >= 12
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /[0-9]/.test(password)
        && /[^A-Za-z0-9]/.test(password);
}

// Runtime slice from admin.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Runtime slice from admin.js: startAdminSessionTimer.
function startAdminSessionTimer() {
    clearTimeout(adminSessionTimeoutId);
    clearTimeout(adminSessionWarningId);
    adminSessionWarningId = setTimeout(() => {
        showNotification('Admin session will expire in 2 minutes. Save your work or refresh activity.', 'warning');
    }, Math.max(1000, ADMIN_SESSION_TIMEOUT_MS - 120000));
    adminSessionTimeoutId = setTimeout(() => {
        showNotification('Admin session timed out for security. Please log in again.', 'warning');
        setTimeout(logoutAdmin, 1200);
    }, ADMIN_SESSION_TIMEOUT_MS);
}

// Runtime slice from admin.js: handleAdminForgotPassword.
async function handleAdminForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('adminForgotEmail').value.trim();
    const button = document.getElementById('adminForgotButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }

    if (!isEmailLoginIdentifier(email)) {
        showAdminLogin('Please login with the registered admin email address only.');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
            await window.SupabaseBackend.sendPasswordResetEmail(email);
            showNotification('Password reset email sent. Open your email link to set a new password.', 'success');
            return;
        }

        const response = await fetch(`${API_URL}?action=requestAdminPasswordReset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            showAdminLogin(result.message || 'Could not send admin reset code.');
            bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
            return;
        }
        showNotification('If this email belongs to an active admin, a reset code was sent there.', 'success');
    } catch (error) {
        showAdminLogin('Could not send reset code. Check the server email configuration.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-envelope"></i> Send Reset Code';
    }
}

// Runtime slice from admin.js: handleAdminResetWithCode.
async function handleAdminResetWithCode(event) {
    event.preventDefault();
    const email = document.getElementById('adminForgotEmail').value.trim();
    const code = document.getElementById('adminResetCode').value.trim();
    const password = document.getElementById('adminResetNewPassword').value;
    const button = document.getElementById('adminResetWithCodeButton');

    if (!email) {
        showAdminLogin('Enter the registered admin email first.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
        return;
    }
    if (!isStrongAdminPassword(password)) {
        showAdminLogin('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

    try {
        const result = await fetch(`${API_URL}?action=resetAdminPasswordWithCode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password })
            }).then(response => parseJsonResponse(response));
        if (!result.success) {
            showAdminLogin(result.message || 'Could not reset admin password.');
            bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
            return;
        }
        document.getElementById('adminForgotPasswordForm')?.reset();
        document.getElementById('adminResetWithCodeForm')?.reset();
        showNotification('Admin password reset successfully. Login with the new password.', 'success');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminLoginTabBtn')).show();
    } catch (error) {
        showAdminLogin('Could not reset admin password. Check the code and try again.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-key"></i> Set New Password';
    }
}

// Runtime slice from admin.js: handleAdminRegistration.
async function handleAdminRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('adminRegisterUsername').value.trim();
    const email = document.getElementById('adminRegisterEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminRegisterPassword').value;
    const confirmPassword = document.getElementById('adminRegisterConfirmPassword').value;
    const button = document.getElementById('adminRegisterButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }
    if (password !== confirmPassword) {
        showAdminLogin('Passwords do not match.');
        return;
    }
    if (!isStrongAdminPassword(password)) {
        showAdminLogin('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        if (useStaticAdminApi && window.SupabaseBackend?.enabled) {
            await window.SupabaseBackend.registerEmail(email, password).catch(error => {
                if (/EMAIL_EXISTS/i.test(error.message || '')) {
                    return window.SupabaseBackend.loginEmail(email, password);
                }
                throw error;
            });
            await window.SupabaseBackend.saveAdminRole({ username, email, isMainAdmin: true });
            const adminUser = await resolveAdminUser(username);
            await loadCloudAdminStores();
            setAdminUser(adminUser);
            showAdminPanel();
            document.getElementById('adminRegisterForm').reset();
            refreshAdminSetupUi();
            loadAllData();
            return;
        }
        const response = await fetch(`${API_URL}?action=registerAdmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await parseJsonResponse(response);

        if (!result.success || !result.data) {
            showAdminLogin(result.message || 'Could not create admin account.');
            return;
        }

        setAdminUser(result.data);
        showAdminPanel();
        document.getElementById('adminRegisterForm').reset();
        refreshAdminSetupUi();
        loadAllData();
    } catch (registerError) {
        showAdminLogin(registerError.message || 'Could not create admin account. Use the registered owner email for the main admin, then approve other admins inside the panel.');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-user-plus"></i> Create Admin Account';
    }
}

// Logout

// Runtime slice from admin.js: logoutAdmin.
function logoutAdmin() {
    clearTimeout(adminSessionTimeoutId);
    clearTimeout(adminSessionWarningId);
    stopAdminRealtimeListeners();
    logLocalAdminActivity('logoutAdmin', { message: 'Admin logged out' });
    window.SupabaseBackend?.logout?.();
    fetch(`${API_URL}?action=logoutAdmin`, { method: 'POST' }).catch(() => {});
    sessionStorage.removeItem('currentAdminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    window.location.href = 'index.html';
}

const ADMIN_WORKSPACE_SETTINGS_KEY = 'dawaahAdminWorkspaceSettings';
const DEFAULT_ADMIN_WORKSPACE_SETTINGS = {
    aiChatEnabled: true,
    researchHistory: true,
    researchMode: 'groq_chat',
    browserNotifications: false,
    compactDashboard: false,
    reducedMotion: false
};

// Runtime slice from admin.js: readAdminWorkspaceSettings.
function readAdminWorkspaceSettings() {
    try {
        return {
            ...DEFAULT_ADMIN_WORKSPACE_SETTINGS,
            ...(JSON.parse(localStorage.getItem(ADMIN_WORKSPACE_SETTINGS_KEY) || '{}') || {})
        };
    } catch (error) {
        return { ...DEFAULT_ADMIN_WORKSPACE_SETTINGS };
    }
}

// Runtime slice from admin.js: writeAdminWorkspaceSettings.
function writeAdminWorkspaceSettings(settings) {
    localStorage.setItem(ADMIN_WORKSPACE_SETTINGS_KEY, JSON.stringify({
        ...DEFAULT_ADMIN_WORKSPACE_SETTINGS,
        ...(settings || {})
    }));
    window.dispatchEvent(new CustomEvent('dawaah:workspace-settings-changed'));
}

// Runtime slice from admin.js: applyAdminWorkspaceSettings.
function applyAdminWorkspaceSettings(settings = readAdminWorkspaceSettings()) {
    document.body.classList.toggle('settings-compact-dashboard', Boolean(settings.compactDashboard));
    document.body.classList.toggle('settings-reduced-motion', Boolean(settings.reducedMotion));
    const widget = document.getElementById('aiChatWidget');
    if (widget) widget.classList.toggle('ai-chat-widget--preference-hidden', !settings.aiChatEnabled);
}

// Runtime slice from admin.js: loadAdminWorkspaceSettings.
function loadAdminWorkspaceSettings() {
    const settings = readAdminWorkspaceSettings();
    const controls = {
        adminSettingAiChatEnabled: 'aiChatEnabled',
        adminSettingResearchHistory: 'researchHistory',
        adminSettingBrowserNotifications: 'browserNotifications',
        adminSettingCompactDashboard: 'compactDashboard',
        adminSettingReducedMotion: 'reducedMotion'
    };
    Object.entries(controls).forEach(([id, key]) => {
        const input = document.getElementById(id);
        if (input) input.checked = Boolean(settings[key]);
    });
    const mode = document.getElementById('adminSettingResearchMode');
    if (mode) mode.value = settings.researchMode || DEFAULT_ADMIN_WORKSPACE_SETTINGS.researchMode;
    applyAdminWorkspaceSettings(settings);
}

// Runtime slice from admin.js: collectAdminWorkspaceSettingsFromForm.
function collectAdminWorkspaceSettingsFromForm() {
    return {
        aiChatEnabled: Boolean(document.getElementById('adminSettingAiChatEnabled')?.checked),
        researchHistory: Boolean(document.getElementById('adminSettingResearchHistory')?.checked),
        browserNotifications: Boolean(document.getElementById('adminSettingBrowserNotifications')?.checked),
        compactDashboard: Boolean(document.getElementById('adminSettingCompactDashboard')?.checked),
        reducedMotion: Boolean(document.getElementById('adminSettingReducedMotion')?.checked),
        researchMode: document.getElementById('adminSettingResearchMode')?.value || DEFAULT_ADMIN_WORKSPACE_SETTINGS.researchMode
    };
}

// Runtime slice from admin.js: saveAdminWorkspaceSettings.
function saveAdminWorkspaceSettings() {
    const settings = collectAdminWorkspaceSettingsFromForm();
    writeAdminWorkspaceSettings(settings);
    applyAdminWorkspaceSettings(settings);
    if (settings.browserNotifications && 'Notification' in window) Notification.requestPermission().catch(() => {});
    showNotification('Settings saved successfully.', 'success');
}

// Runtime slice from admin.js: resetAdminWorkspaceSettings.
function resetAdminWorkspaceSettings() {
    writeAdminWorkspaceSettings(DEFAULT_ADMIN_WORKSPACE_SETTINGS);
    loadAdminWorkspaceSettings();
    showNotification('Settings reset to defaults.', 'info');
}

window.addEventListener('DOMContentLoaded', () => applyAdminWorkspaceSettings());
window.addEventListener('storage', event => {
    if (event.key === ADMIN_WORKSPACE_SETTINGS_KEY) applyAdminWorkspaceSettings();
});

// Switch between admin views

// Runtime slice from admin.js: switchAdminView.
function switchAdminView(viewName) {
    // Hide all views
    document.querySelectorAll('.admin-content').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
        
        // Add active class to nav link
        const activeEvent = typeof event !== 'undefined' ? event : null;
        if (activeEvent && activeEvent.target) {
            activeEvent.target.closest('a')?.classList.add('active');
        }
        
        // Update page title
        const titles = {
            'dashboard': '<i class="fas fa-chart-line"></i> Dashboard',
            'announcements': '<i class="fas fa-bell"></i> Announcements',
            'events': '<i class="fas fa-calendar"></i> Events',
            'leadership': '<i class="fas fa-users"></i> Leadership',
            'gallery': '<i class="fas fa-images"></i> Gallery',
            'contactVoices': '<i class="fas fa-pen-to-square"></i> Public Content',
            'welfare': '<i class="fas fa-hands-helping"></i> Welfare',
            'prayer': '<i class="fas fa-mosque"></i> Prayer & Religious Activities',
            'account': '<i class="fas fa-user-gear"></i> My Account',
            'settings': '<i class="fas fa-gear"></i> Settings',
            'resources': '<i class="fas fa-folder-open"></i> Resources',
            'hadiths': '<i class="fas fa-book"></i> Hadiths'
        };
        document.getElementById('pageTitle').innerHTML = titles[viewName] || '';
        
        // Load view-specific data
        loadViewData(viewName);
    }
}

// Runtime slice from admin.js: showReligiousAdminSection.
function showReligiousAdminSection(sectionId) {
    switchAdminView('prayer');
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        section.style.boxShadow = '0 0 0 3px rgba(44,90,160,0.25)';
        setTimeout(() => {
            section.style.boxShadow = '';
        }, 1800);
    }, 120);
}

// Runtime slice from admin.js: loadViewData.
function loadViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'events':
            loadEvents();
            break;
        case 'leadership':
            loadLeadership();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'contactVoices':
            loadAdminSiteSettings();
            loadAdminContactVoiceMessages();
            break;
        case 'hadiths':
            loadHadiths();
            break;
        case 'welfare':
            loadWelfareRequests();
            break;
        case 'prayer':
            loadPrayerAdmin();
            break;
        case 'resources':
            loadResourcesAdmin();
            break;
        case 'account':
            loadAccountAdminTools();
            renderRolePermissionEditor();
            break;
        case 'settings':
            loadAdminWorkspaceSettings();
            break;
    }
}

// Load all data for dashboard

// Runtime slice from admin.js: loadAllData.
function loadAllData() {
    renderBackupStatus();
    loadDashboardStats();
    runSystemHealthCheck({ silent: true });
}

// Runtime slice from admin.js: healthBadge.
function healthBadge(status) {
    const classes = {
        ok: 'success',
        warn: 'warning text-dark',
        fail: 'danger',
        checking: 'secondary'
    };
    const labels = {
        ok: 'OK',
        warn: 'Check',
        fail: 'Issue',
        checking: 'Checking'
    };
    return `<span class="badge bg-${classes[status] || classes.checking}">${labels[status] || labels.checking}</span>`;
}

// Runtime slice from admin.js: renderSystemHealth.
function renderSystemHealth(items, running = false) {
    const list = document.getElementById('systemHealthList');
    const summary = document.getElementById('systemHealthSummary');
    if (!list || !summary) return;

    if (running) {
        summary.className = 'alert alert-info py-2 mb-3';
        summary.textContent = 'Checking live app services...';
    } else {
        const failed = items.filter(item => item.status === 'fail').length;
        const warnings = items.filter(item => item.status === 'warn').length;
        summary.className = failed
            ? 'alert alert-danger py-2 mb-3'
            : warnings
                ? 'alert alert-warning py-2 mb-3'
                : 'alert alert-success py-2 mb-3';
        summary.textContent = failed
            ? `${failed} important check(s) failed. Open the failed item before handing over.`
            : warnings
                ? `${warnings} check(s) need attention, but the main app is reachable.`
                : 'Core services are reachable from this browser.';
    }

    list.innerHTML = items.map(item => `
        <div class="col-md-6 col-xl-4">
            <div class="border rounded p-3 h-100">
                <div class="d-flex justify-content-between align-items-start gap-2">
                    <strong><i class="fas ${item.icon} me-1"></i> ${escapeAdminText(item.name)}</strong>
                    ${healthBadge(item.status)}
                </div>
                <p class="text-muted small mb-0 mt-2">${escapeAdminText(item.detail)}</p>
            </div>
        </div>
    `).join('');
}

// Runtime slice from admin.js: fetchHealthJson.
async function fetchHealthJson(url) {
    const response = await realFetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

// Runtime slice from admin.js: fetchHealthText.
async function fetchHealthText(url) {
    const response = await realFetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

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

// Runtime slice from admin.js: loadAccountAdminTools.
function loadAccountAdminTools() {
    updateAdminAccessUi();
    loadMyAdminActivityLogs();
    if (!currentAdmin?.isMainAdmin) {
        return;
    }
    loadPendingRoleRequests();
    loadRoleAssignableMembers();
    loadAdminAccounts();
    loadAdminActivityLogs();
}

// Runtime slice from admin.js: loadRoleAssignableMembers.
function loadRoleAssignableMembers() {
    const select = document.getElementById('memberRoleUser');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Loading members...</option>';

    fetch(`${API_URL}?action=getRoleAssignableMembers`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load members');
        }
        renderRoleAssignableMembers(result.data || []);
    })
    .catch(error => {
        select.innerHTML = `<option value="" disabled selected>${escapeAdminText(error.message || 'Could not load members')}</option>`;
    });
}

// Runtime slice from admin.js: renderRoleAssignableMembers.
function renderRoleAssignableMembers(members) {
    const select = document.getElementById('memberRoleUser');
    const passwordSelect = document.getElementById('memberPasswordUser');
    if (!select && !passwordSelect) return;
    if (!members.length) {
        if (select) select.innerHTML = '<option value="" disabled selected>No registered members found</option>';
        if (passwordSelect) passwordSelect.innerHTML = '<option value="" disabled selected>No registered members found</option>';
        return;
    }

    const memberOptions = '<option value="" disabled selected>Select member</option>' + members.map(member => {
        const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username || member.student_id || 'Member';
        const role = formatAdminRoleName(member.role || 'student');
        const status = member.status || 'active';
        return `<option value="${escapeAdminText(member.id)}" data-email="${escapeAdminText(member.email || '')}">${escapeAdminText(name)} - ${escapeAdminText(role)} (${escapeAdminText(status)})</option>`;
    }).join('');
    if (select) select.innerHTML = memberOptions;
    if (passwordSelect) passwordSelect.innerHTML = memberOptions;
}

// Runtime slice from admin.js: formatAdminRoleName.
function formatAdminRoleName(role) {
    const labels = {
        executive: 'Sub Admin / Executive',
        chairlady: 'Chairlady / Welfare Lead',
        vice_chairlady_1: 'Vice Chairlady 1 / Welfare Lead',
        vice_chairlady_2: 'Vice Chairlady 2 / Welfare Lead',
        secretary: 'Secretary',
        vice_secretary: 'Vice Secretary',
        treasurer: 'Treasurer',
        vice_treasurer: 'Vice Treasurer',
        media: 'Media',
        organizer: 'Organizer',
        amir_director: 'Amir Dawah / Director of Dawah',
        student: 'Student Member'
    };
    return labels[String(role || 'student').toLowerCase()] || role;
}

// Runtime slice from admin.js: getOfficerApprovalSummary.
function getOfficerApprovalSummary(role) {
    const summaries = {
        chairlady: 'Approving gives access to welfare management and oversight reports.',
        vice_chairlady_1: 'Approving gives access to the same welfare management and oversight reports as Chairlady.',
        vice_chairlady_2: 'Approving gives access to the same welfare management and oversight reports as Chairlady.',
        secretary: 'Approving gives access to member records, announcements, and reports.',
        vice_secretary: 'Approving gives access to the same member records, announcements, and reports as Secretary.',
        treasurer: 'Approving gives access to dues, donations, payment confirmation, and reports.',
        vice_treasurer: 'Approving gives access to the same dues, donations, payment confirmation, and reports as Treasurer.',
        media: 'Approving gives access to gallery, videos, contact messages, and publicity tools.',
        organizer: 'Approving gives access to events, daily/weekly/monthly activities, and volunteer tools.',
        amir_director: 'Approving gives access to prayer times, hadiths, Islamic resources, lectures, and reminders.'
    };
    return summaries[String(role || '').toLowerCase()] || 'Approving gives access only to the tools assigned to this role.';
}

// Runtime slice from admin.js: handleMemberRoleAssign.
function handleMemberRoleAssign(event) {
    event.preventDefault();
    const userId = document.getElementById('memberRoleUser')?.value;
    const role = document.getElementById('memberRoleValue')?.value;
    const status = document.getElementById('memberRoleStatus')?.value || 'active';
    const button = document.getElementById('memberRoleAssignButton');
    if (!userId || !role) {
        showNotification('Please choose a member and role.', 'warning');
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    fetch(`${API_URL}?action=assignMemberRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, status })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not assign role');
        showNotification('Member role updated.', 'success');
        loadRoleAssignableMembers();
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not assign role', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Save Role';
        }
    });
}

// Runtime slice from admin.js: handleMemberPasswordReset.
function handleMemberPasswordReset(event) {
    event.preventDefault();
    const select = document.getElementById('memberPasswordUser');
    const email = select?.selectedOptions?.[0]?.dataset?.email || '';
    const button = document.getElementById('memberPasswordResetButton');
    if (!email) {
        showNotification('Please choose a member with a registered email address.', 'warning');
        return;
    }
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.sendPasswordResetEmail) {
        showNotification('Hosted password reset is not available on this page.', 'danger');
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    window.SupabaseBackend.sendPasswordResetEmail(email)
    .then(() => {
        document.getElementById('memberPasswordResetForm')?.reset();
        showNotification(`Password reset email sent to ${email}.`, 'success');
    })
    .catch(error => showNotification(error.message || 'Could not send password reset email', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-envelope"></i> Send Reset Email';
        }
    });
}

// Runtime slice from admin.js: loadPendingRoleRequests.
function loadPendingRoleRequests() {
    const container = document.getElementById('pendingRoleRequestsList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted">Loading pending role requests...</p>';

    refreshCloudAdminStores(true)
    .then(() => fetch(`${API_URL}?action=getPendingRoleRequests`))
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load role requests');
        }
        renderPendingRoleRequests(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load role requests')}</p>`;
    });
}

// Runtime slice from admin.js: renderPendingRoleRequests.
function renderPendingRoleRequests(requests) {
    const container = document.getElementById('pendingRoleRequestsList');
    if (!container) return;

    if (!requests.length) {
        container.innerHTML = '<div class="admin-empty-state"><i class="fas fa-circle-check"></i><h5>No pending role requests</h5><p class="text-muted mb-0">Special role approvals will appear here.</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="pending-role-grid">
            ${requests.map(request => {
                const name = [request.first_name, request.last_name].filter(Boolean).join(' ') || request.username || request.student_id || 'Member';
                const userId = request.id || request.user_id || request.username || request.student_id;
                const roleLabel = formatAdminRoleName(request.role || '-');
                const roleSummary = getOfficerApprovalSummary(request.role);
                return `
                    <article class="pending-role-card">
                        <div class="pending-role-card__icon"><i class="fas fa-user-shield"></i></div>
                        <div class="pending-role-card__body">
                            <div class="d-flex justify-content-between gap-2 flex-wrap">
                                <div>
                                    <h5>${escapeAdminText(name)}</h5>
                                    ${request.student_id ? `<p class="text-muted mb-1">${escapeAdminText(request.student_id)}</p>` : ''}
                                    <p class="text-muted mb-0">${escapeAdminText(request.email || '-')}</p>
                                </div>
                                <div class="text-end">
                                    <span class="badge bg-primary">${escapeAdminText(roleLabel)}</span>
                                    <span class="badge bg-warning text-dark">${escapeAdminText(request.status || 'pending')}</span>
                                </div>
                            </div>
                            <p class="text-muted mt-3 mb-0">${escapeAdminText(roleSummary)}</p>
                            <div class="pending-role-card__footer">
                                <small class="text-muted">${request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</small>
                                <div>
                                    <button class="btn btn-sm btn-success me-1" onclick="approveRoleRequest('${encodeURIComponent(userId)}')">
                                        <i class="fas fa-circle-check"></i> Approve
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="rejectRoleRequest('${encodeURIComponent(userId)}')">
                                        <i class="fas fa-circle-xmark"></i> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
}

// Runtime slice from admin.js: approveRoleRequest.
function approveRoleRequest(userId) {
    userId = decodeURIComponent(userId);
    adminApiRequest('approveRoleRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve role request');
        showNotification('Role request approved.', 'success');
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not approve role request', 'danger'));
}

// Runtime slice from admin.js: rejectRoleRequest.
function rejectRoleRequest(userId) {
    userId = decodeURIComponent(userId);
    if (!confirm('Reject this role request? The role will become available for another member.')) return;
    adminApiRequest('rejectRoleRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject role request');
        showNotification('Role request rejected.', 'success');
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not reject role request', 'danger'));
}

// Runtime slice from admin.js: loadAdminContactVoiceMessages.
function loadAdminContactVoiceMessages() {
    const container = document.getElementById('adminContactVoiceMessagesList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading voice messages...</p>';

    fetch(`${API_URL}?action=getContactVoiceMessages`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load voice messages');
        }
        renderAdminContactVoiceMessages(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeAdminText(error.message || 'Could not load voice messages')}</p>`;
    });
}

// Runtime slice from admin.js: setAdminSettingsValue.
function setAdminSettingsValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || '';
}

// Runtime slice from admin.js: updateFinanceSignaturePreview.
function updateFinanceSignaturePreview(value = '') {
    const preview = document.getElementById('adminFinanceSignaturePreview');
    const empty = document.getElementById('adminFinanceSignatureEmpty');
    if (!preview || !empty) return;
    if (value) {
        preview.src = value;
        preview.classList.remove('d-none');
        empty.classList.add('d-none');
    } else {
        preview.removeAttribute('src');
        preview.classList.add('d-none');
        empty.classList.remove('d-none');
    }
}

// Runtime slice from admin.js: previewFinanceSignatureImage.
function previewFinanceSignatureImage() {
    const input = document.getElementById('adminFinanceSignatureImageFile');
    const hidden = document.getElementById('adminFinanceSignatureImage');
    const file = input?.files?.[0];
    if (!file || !hidden) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Use a PNG, JPG, or WebP signature image.', 'warning');
        input.value = '';
        return;
    }
    if (file.size > 250 * 1024) {
        showNotification('Signature image must be under 250 KB.', 'warning');
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        hidden.value = event.target?.result || '';
        updateFinanceSignaturePreview(hidden.value);
    };
    reader.readAsDataURL(file);
}

// Runtime slice from admin.js: removeFinanceSignatureImage.
function removeFinanceSignatureImage() {
    const input = document.getElementById('adminFinanceSignatureImageFile');
    const hidden = document.getElementById('adminFinanceSignatureImage');
    if (input) input.value = '';
    if (hidden) hidden.value = '';
    updateFinanceSignaturePreview('');
}

// Runtime slice from admin.js: getAdminSiteSettingsPayload.
function getAdminSiteSettingsPayload() {
    return {
        contact_location: document.getElementById('adminContactLocation')?.value.trim() || '',
        contact_phone: document.getElementById('adminContactPhone')?.value.trim() || '',
        contact_email: document.getElementById('adminContactEmail')?.value.trim() || '',
        contact_hours: document.getElementById('adminContactHours')?.value.trim() || '',
        about_title: document.getElementById('adminAboutTitle')?.value.trim() || '',
        about_heading: document.getElementById('adminAboutHeading')?.value.trim() || '',
        about_paragraph_1: document.getElementById('adminAboutParagraph1')?.value.trim() || '',
        about_paragraph_2: document.getElementById('adminAboutParagraph2')?.value.trim() || '',
        about_feature_1: document.getElementById('adminAboutFeature1')?.value.trim() || '',
        about_feature_2: document.getElementById('adminAboutFeature2')?.value.trim() || '',
        about_feature_3: document.getElementById('adminAboutFeature3')?.value.trim() || '',
        about_feature_4: document.getElementById('adminAboutFeature4')?.value.trim() || '',
        what_we_do_title: document.getElementById('adminWhatWeDoTitle')?.value.trim() || '',
        what_we_do_1_title: document.getElementById('adminWhatWeDo1Title')?.value.trim() || '',
        what_we_do_1_text: document.getElementById('adminWhatWeDo1Text')?.value.trim() || '',
        what_we_do_2_title: document.getElementById('adminWhatWeDo2Title')?.value.trim() || '',
        what_we_do_2_text: document.getElementById('adminWhatWeDo2Text')?.value.trim() || '',
        what_we_do_3_title: document.getElementById('adminWhatWeDo3Title')?.value.trim() || '',
        what_we_do_3_text: document.getElementById('adminWhatWeDo3Text')?.value.trim() || '',
        what_we_do_4_title: document.getElementById('adminWhatWeDo4Title')?.value.trim() || '',
        what_we_do_4_text: document.getElementById('adminWhatWeDo4Text')?.value.trim() || '',
        what_we_do_5_title: document.getElementById('adminWhatWeDo5Title')?.value.trim() || '',
        what_we_do_5_text: document.getElementById('adminWhatWeDo5Text')?.value.trim() || '',
        what_we_do_6_title: document.getElementById('adminWhatWeDo6Title')?.value.trim() || '',
        what_we_do_6_text: document.getElementById('adminWhatWeDo6Text')?.value.trim() || '',
        social_whatsapp: document.getElementById('adminSocialWhatsapp')?.value.trim() || '',
        social_facebook: document.getElementById('adminSocialFacebook')?.value.trim() || '',
        social_x: document.getElementById('adminSocialX')?.value.trim() || '',
        social_instagram: document.getElementById('adminSocialInstagram')?.value.trim() || '',
        social_youtube: document.getElementById('adminSocialYoutube')?.value.trim() || '',
        social_tiktok: document.getElementById('adminSocialTiktok')?.value.trim() || '',
        social_linkedin: document.getElementById('adminSocialLinkedin')?.value.trim() || '',
        finance_signature_name: document.getElementById('adminFinanceSignatureName')?.value.trim() || '',
        finance_signature_title: document.getElementById('adminFinanceSignatureTitle')?.value.trim() || '',
        finance_signature_image: document.getElementById('adminFinanceSignatureImage')?.value || ''
    };
}

// Runtime slice from admin.js: populateAdminSiteSettings.
function populateAdminSiteSettings(settings = {}) {
    setAdminSettingsValue('adminContactLocation', settings.contact_location);
    setAdminSettingsValue('adminContactPhone', settings.contact_phone);
    setAdminSettingsValue('adminContactEmail', settings.contact_email);
    setAdminSettingsValue('adminContactHours', settings.contact_hours);
    setAdminSettingsValue('adminAboutTitle', settings.about_title);
    setAdminSettingsValue('adminAboutHeading', settings.about_heading);
    setAdminSettingsValue('adminAboutParagraph1', settings.about_paragraph_1);
    setAdminSettingsValue('adminAboutParagraph2', settings.about_paragraph_2);
    setAdminSettingsValue('adminAboutFeature1', settings.about_feature_1);
    setAdminSettingsValue('adminAboutFeature2', settings.about_feature_2);
    setAdminSettingsValue('adminAboutFeature3', settings.about_feature_3);
    setAdminSettingsValue('adminAboutFeature4', settings.about_feature_4);
    setAdminSettingsValue('adminWhatWeDoTitle', settings.what_we_do_title);
    [1, 2, 3, 4, 5, 6].forEach(index => {
        setAdminSettingsValue(`adminWhatWeDo${index}Title`, settings[`what_we_do_${index}_title`]);
        setAdminSettingsValue(`adminWhatWeDo${index}Text`, settings[`what_we_do_${index}_text`]);
    });
    setAdminSettingsValue('adminSocialWhatsapp', settings.social_whatsapp);
    setAdminSettingsValue('adminSocialFacebook', settings.social_facebook);
    setAdminSettingsValue('adminSocialX', settings.social_x);
    setAdminSettingsValue('adminSocialInstagram', settings.social_instagram);
    setAdminSettingsValue('adminSocialYoutube', settings.social_youtube);
    setAdminSettingsValue('adminSocialTiktok', settings.social_tiktok);
    setAdminSettingsValue('adminSocialLinkedin', settings.social_linkedin);
    setAdminSettingsValue('adminFinanceSignatureName', settings.finance_signature_name);
    setAdminSettingsValue('adminFinanceSignatureTitle', settings.finance_signature_title);
    setAdminSettingsValue('adminFinanceSignatureImage', settings.finance_signature_image);
    updateFinanceSignaturePreview(settings.finance_signature_image || '');
}

// Runtime slice from admin.js: loadAdminSiteSettings.
function loadAdminSiteSettings() {
    fetch(`${API_URL}?action=getSiteSettings`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not load site settings');
        populateAdminSiteSettings(result.data || {});
    })
    .catch(error => {
        populateAdminSiteSettings(getLocalSiteSettings());
        showNotification(error.message || 'Using local site settings.', 'warning');
    });
}

// Runtime slice from admin.js: saveAdminSiteSettings.
function saveAdminSiteSettings() {
    fetch(`${API_URL}?action=updateSiteSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAdminSiteSettingsPayload())
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save site settings');
        const settings = result.data?.settings || result.data || {};
        populateAdminSiteSettings(settings);
        if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
            return window.SupabaseBackend.saveSiteSettings(settings)
                .then(() => showNotification('Public page content saved to Supabase.', 'success'));
        }
        showNotification('Public page content saved.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not save public page content', 'danger'));
}

// Runtime slice from admin.js: renderAdminContactVoiceMessages.
function renderAdminContactVoiceMessages(messages) {
    const container = document.getElementById('adminContactVoiceMessagesList');
    if (!container) return;
    if (!messages.length) {
        container.innerHTML = '<p class="text-muted mb-0">No voice messages yet.</p>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="content-card" style="box-shadow:none; border:1px solid #e5e7eb; margin-bottom:12px;">
            <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                    <h5 class="mb-1">${escapeAdminText(message.subject)}</h5>
                    <p class="text-muted mb-1">${escapeAdminText(message.name)} &lt;${escapeAdminText(message.email)}&gt;</p>
                    <p class="text-muted mb-0">${message.created_at ? new Date(message.created_at).toLocaleString() : ''}</p>
                </div>
                <span class="badge bg-${message.status === 'read' ? 'success' : 'warning'}">${message.status === 'read' ? 'Listened' : 'New'}</span>
            </div>
            ${message.message ? `<p class="mt-2">${escapeAdminText(message.message)}</p>` : ''}
            <audio class="w-100 admin-contact-voice-audio" controls data-message-id="${Number(message.id)}" src="${resolveAdminUrl(message.audio_path)}"></audio>
        </div>
    `).join('');

    container.querySelectorAll('.admin-contact-voice-audio').forEach(audio => {
        audio.addEventListener('play', () => markAdminContactVoiceMessageRead(audio.dataset.messageId));
    });
}

// Runtime slice from admin.js: markAdminContactVoiceMessageRead.
function markAdminContactVoiceMessageRead(messageId) {
    if (!messageId) return;
    fetch(`${API_URL}?action=markContactVoiceMessageRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: Number(messageId) })
    }).catch(() => {});
}

// Runtime slice from admin.js: loadMyAdminActivityLogs.
function loadMyAdminActivityLogs() {
    fetch(`${API_URL}?action=getMyAdminActivityLogs`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load your activity');
        }
        renderActivityLogTable('myAdminActivityLogList', result.data || [], {
            showMainAdminActions: false,
            showUndoActions: true
        });
    })
    .catch(error => {
        const container = document.getElementById('myAdminActivityLogList');
        if (container) container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load your activity')}</p>`;
    });
}

// Runtime slice from admin.js: escapeAdminText.
function escapeAdminText(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

// Runtime slice from admin.js: encodeAdminLeaderDetails.
function encodeAdminLeaderDetails(leader) {
    return encodeURIComponent(JSON.stringify({
        id: leader.id || '',
        name: leader.name || '',
        position: leader.position || '',
        course: leader.course || '',
        year_of_study: leader.year_of_study || leader.yearOfStudy || '',
        bio: leader.bio || '',
        description: leader.description || '',
        email: leader.email || '',
        phone: leader.phone || '',
        photo_url: leader.photo_url || leader.photoData || '',
        created_at: leader.created_at || leader.createdAt || ''
    })).replace(/'/g, '%27');
}

// Runtime slice from admin.js: showAdminLeaderDetails.
function showAdminLeaderDetails(encodedLeader) {
    const leader = typeof encodedLeader === 'string' ? JSON.parse(decodeURIComponent(encodedLeader)) : encodedLeader;
    const photoUrl = leader.photo_url || leader.photoData || '';

    document.getElementById('adminLeaderModalTitle').textContent = `${leader.name || 'Leader'} - ${leader.position || 'Details'}`;
    document.getElementById('adminLeaderName').textContent = leader.name || 'N/A';
    document.getElementById('adminLeaderPosition').textContent = leader.position || 'N/A';
    document.getElementById('adminLeaderCourse').textContent = leader.course || 'N/A';
    document.getElementById('adminLeaderYearOfStudy').textContent = leader.year_of_study || leader.yearOfStudy || 'N/A';
    document.getElementById('adminLeaderBio').textContent = leader.bio || 'N/A';
    document.getElementById('adminLeaderDescription').textContent = leader.description || 'N/A';
    document.getElementById('adminLeaderEmail').textContent = leader.email || 'N/A';
    document.getElementById('adminLeaderPhone').textContent = leader.phone || 'N/A';
    document.getElementById('adminLeaderAddedAt').textContent = leader.created_at ? new Date(leader.created_at).toLocaleString() : 'N/A';

    const image = document.getElementById('adminLeaderPhotoImage');
    const icon = document.getElementById('adminLeaderPhotoIcon');
    if (photoUrl && image) {
        image.src = resolveAdminUrl(photoUrl);
        image.alt = leader.name ? `${leader.name} profile photo` : 'Leader profile photo';
        image.classList.remove('d-none');
        icon?.classList.add('d-none');
        image.onerror = function() {
            image.classList.add('d-none');
            icon?.classList.remove('d-none');
        };
    } else {
        image?.classList.add('d-none');
        icon?.classList.remove('d-none');
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('adminLeaderDetailsModal')).show();
}

// Runtime slice from admin.js: loadAdminAccounts.
function loadAdminAccounts() {
    fetch(`${API_URL}?action=listAdminAccounts`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load admin accounts');
        }

        const payload = result.data || {};
        const admins = payload.admins || [];
        const limit = payload.admin_limit || ADMIN_ACCOUNT_LIMIT;
        const count = payload.admin_count ?? admins.length;
        const badge = document.getElementById('adminAccountLimitBadge');
        const createButton = document.getElementById('managedAdminCreateButton');
        const container = document.getElementById('adminAccountsList');

        if (badge) badge.textContent = `${count} / ${limit} admins`;
        if (createButton) createButton.disabled = count >= limit;

        if (!container) return;
        if (!admins.length) {
            container.innerHTML = '<p class="text-muted">No admin accounts found.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${admins.map(admin => `
                            <tr>
                                <td>${escapeAdminText(admin.username)} ${admin.is_current ? '<span class="badge bg-success ms-1">You</span>' : ''}</td>
                                <td>${escapeAdminText(admin.email)}</td>
                                <td><span class="badge bg-${admin.status === 'active' ? 'success' : 'secondary'}">${escapeAdminText(admin.status || 'active')}</span></td>
                                <td>${admin.created_at ? new Date(admin.created_at).toLocaleString() : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="resetManagedAdminPassword(${JSON.stringify(String(admin.id || admin.uid || ''))}, ${JSON.stringify(String(admin.email || ''))})">
                                        <i class="fas fa-key"></i> Reset
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" ${admin.is_current ? 'disabled' : ''} onclick="removeManagedAdmin(${JSON.stringify(String(admin.id || admin.uid || ''))})">
                                        <i class="fas fa-trash"></i> Remove
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading admin accounts:', error);
        showNotification(error.message || 'Error loading admin accounts', 'danger');
    });
}

// Runtime slice from admin.js: loadAdminActivityLogs.
function loadAdminActivityLogs() {
    fetch(`${API_URL}?action=getAdminActivityLogs`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load admin activity');
        }
        renderActivityLogTable('adminActivityLogList', result.data || [], {
            showMainAdminActions: true,
            showUndoActions: false
        });
        const container = document.getElementById('adminActivityLogList');
        if (container && !document.getElementById('auditExportButton')) {
            container.insertAdjacentHTML('afterbegin', `
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <input type="search" class="form-control form-control-sm" id="auditLogFilter" placeholder="Filter audit logs" oninput="filterAuditLogRows()" style="max-width: 320px;">
                    <a class="btn btn-sm btn-outline-secondary" id="auditExportButton" href="${API_URL}?action=exportAuditLogs" target="_blank">
                        <i class="fas fa-file-csv"></i> Export Audit CSV
                    </a>
                </div>
            `);
        }
    })
    .catch(error => {
        const container = document.getElementById('adminActivityLogList');
        if (container) container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load admin activity')}</p>`;
    });
}

// Runtime slice from admin.js: renderActivityLogTable.
function renderActivityLogTable(containerId, logs, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!logs.length) {
        container.innerHTML = '<p class="text-muted">No admin activity recorded yet.</p>';
        return;
    }

    container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead>
                        <tr>
                            <th>Who Did It</th>
                            <th>Source</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP</th>
                            <th>Time</th>
                            ${options.showMainAdminActions ? '<th>Main Admin Action</th>' : ''}
                            ${options.showUndoActions ? '<th>Undo</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td>${escapeAdminText(log.username || 'Unknown')}</td>
                                <td><span class="badge bg-${log.source === 'member_dashboard' ? 'info' : 'dark'}">${escapeAdminText(formatActivitySource(log.source))}</span></td>
                                <td><span class="badge bg-secondary">${escapeAdminText(formatAdminAction(log.action))}</span></td>
                                <td>${escapeAdminText(formatAdminActivityDetails(log.details))}</td>
                                <td>${escapeAdminText(log.ip_address || '-')}</td>
                                <td>${log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                                ${options.showMainAdminActions ? `<td>${renderAdminActivityControls(log)}</td>` : ''}
                                ${options.showUndoActions ? `<td>${renderUndoActivityControls(log)}</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
}

// Runtime slice from admin.js: renderAdminActivityControls.
function renderAdminActivityControls(log) {
    const deleteLogButton = `<button class="btn btn-sm btn-outline-danger me-1" onclick="deleteAdminActivityLog(${Number(log.id)})">Delete Log</button>`;
    if (log.action === 'pendingAdminApproval') {
        return `
            <button class="btn btn-sm btn-success me-1" onclick="approvePendingAdminActivity(${Number(log.id)})">Approve</button>
            <button class="btn btn-sm btn-outline-danger me-1" onclick="rejectPendingAdminActivity(${Number(log.id)})">Reject</button>
            ${deleteLogButton}
        `;
    }
    if (['opposeAdminActivity', 'deleteAdminActivityItem', 'undoMyAdminActivityItem'].includes(log.action)) {
        return `<span class="text-muted me-2">Recorded</span>${deleteLogButton}`;
    }
    const deleteButton = canDeleteActivityItem(log)
        ? `<button class="btn btn-sm btn-outline-danger me-1" onclick="deleteActivityItemFromLog(${Number(log.id)})">Delete Item</button>`
        : '';
    return `
        ${deleteButton}
        <button class="btn btn-sm btn-outline-warning me-1" onclick="opposeAdminActivity(${Number(log.id)})">Oppose</button>
        ${deleteLogButton}
    `;
}

// Runtime slice from admin.js: filterAuditLogRows.
function filterAuditLogRows() {
    const query = (document.getElementById('auditLogFilter')?.value || '').toLowerCase();
    document.querySelectorAll('#adminActivityLogList tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

// Runtime slice from admin.js: renderUndoActivityControls.
function renderUndoActivityControls(log) {
    const deleteLogButton = `<button class="btn btn-sm btn-outline-danger" onclick="deleteMyAdminActivityLog(${Number(log.id)})">Delete Log</button>`;
    if (['opposeAdminActivity', 'deleteAdminActivityItem', 'undoMyAdminActivityItem'].includes(log.action)) {
        return `<span class="text-muted me-2">Recorded</span>${deleteLogButton}`;
    }
    if (!canDeleteActivityItem(log)) {
        return `<span class="text-muted me-2">Not undoable</span>${deleteLogButton}`;
    }
    return `
        <button class="btn btn-sm btn-outline-warning me-1" onclick="undoMyAdminActivity(${Number(log.id)})">Undo</button>
        ${deleteLogButton}
    `;
}

// Runtime slice from admin.js: canDeleteActivityItem.
function canDeleteActivityItem(log) {
    return Boolean(getActivityTarget(log.action, log.details || {}));
}

// Runtime slice from admin.js: opposeAdminActivity.
function opposeAdminActivity(logId) {
    const reason = prompt('Reason for opposing this admin action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=opposeAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not record opposition');
        showNotification('Opposition recorded', 'success');
        loadAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not record opposition', 'danger'));
}

// Runtime slice from admin.js: deleteActivityItemFromLog.
function deleteActivityItemFromLog(logId) {
    const reason = prompt('Reason for deleting/opposing this admin action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=deleteAdminActivityItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete item');
        showNotification('Item deleted and action recorded', 'success');
        loadAdminActivityLogs();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not delete item', 'danger'));
}

// Runtime slice from admin.js: approvePendingAdminActivity.
function approvePendingAdminActivity(logId) {
    if (!confirm('Approve and apply this pending sub-admin action?')) return;
    fetch(`${API_URL}?action=approvePendingAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve action');
        showNotification('Pending action approved and applied', 'success');
        loadAdminActivityLogs();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not approve action', 'danger'));
}

// Runtime slice from admin.js: rejectPendingAdminActivity.
function rejectPendingAdminActivity(logId) {
    const reason = prompt('Reason for rejecting this pending action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=rejectPendingAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject action');
        showNotification('Pending action rejected', 'success');
        loadAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not reject action', 'danger'));
}

// Runtime slice from admin.js: undoMyAdminActivity.
function undoMyAdminActivity(logId) {
    const reason = prompt('Reason for undoing this action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=undoMyAdminActivityItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not undo action');
        showNotification('Your action was undone', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not undo action', 'danger'));
}

// Runtime slice from admin.js: deleteMyAdminActivityLog.
function deleteMyAdminActivityLog(logId) {
    if (!confirm('Delete this recent action from your list? This only removes the log entry.')) return;
    fetch(`${API_URL}?action=deleteMyAdminActivityLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete activity log');
        showNotification('Activity log deleted', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    })
    .catch(error => showNotification(error.message || 'Could not delete activity log', 'danger'));
}

// Runtime slice from admin.js: deleteAdminActivityLog.
function deleteAdminActivityLog(logId) {
    if (!confirm('Delete this admin activity log? This only removes the record from the activity table.')) return;
    fetch(`${API_URL}?action=deleteAdminActivityLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete activity log');
        showNotification('Activity log deleted', 'success');
        loadAdminActivityLogs();
        loadMyAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not delete activity log', 'danger'));
}

// Runtime slice from admin.js: clearMyAdminActivityLogs.
function clearMyAdminActivityLogs() {
    if (!confirm('Clear all your recent action records?')) return;
    adminApiRequest('clearMyAdminActivityLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not clear recent actions');
        showNotification('Your recent actions were cleared', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    })
    .catch(error => showNotification(error.message || 'Could not clear recent actions', 'danger'));
}

// Runtime slice from admin.js: clearAllAdminActivityLogs.
function clearAllAdminActivityLogs() {
    if (!isBackupCurrentEnoughForDanger()) return;
    if (!confirm('Clear all admin activity records? This removes the activity history list.')) return;
    adminApiRequest('clearAdminActivityLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not clear admin activity');
        showNotification('Admin activity cleared', 'success');
        loadAdminActivityLogs();
        loadMyAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not clear admin activity', 'danger'));
}

// Runtime slice from admin.js: createLocalDatabaseBackupResult.
function createLocalDatabaseBackupResult() {
    const backup = buildLocalDatabaseBackup();
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    return {
        success: true,
        data: {
            filename: `dawah-supabase-backup-${date}.json`,
            mime: 'application/json;charset=utf-8',
            content: JSON.stringify(backup, null, 2)
        }
    };
}

// Runtime slice from admin.js: buildLocalDatabaseBackup.
function buildLocalDatabaseBackup() {
    const storeKeys = [
        'allMembers',
        LOCAL_ADMIN_ACCOUNTS_KEY,
        'adminActivityLogs',
        ADMIN_NOTIFICATION_LOG_KEY,
        'roleActivityLogs',
        'adminAnnouncements',
        'adminEvents',
        'publicLeaders',
        'galleryItems',
        'adminHadiths',
        'adminResources',
        'adminPrayerTimes',
        'adminReligiousActivities',
        'siteSettings',
        'volunteerOpportunities',
        'contactVoiceMessages',
        'payments',
        'donations',
        'welfareRequests',
        'registeredEvents',
        'volunteerRecords'
    ];
    const stores = {};
    storeKeys.forEach(key => {
        if (key === 'adminPrayerTimes' || key === 'siteSettings' || key === 'adminReligiousActivities') {
            stores[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } else {
            stores[key] = readStore(key);
        }
    });
    return {
        app: "UMMA University Dawah Team",
        backend: window.SupabaseBackend?.enabled ? 'supabase-postgres' : 'browser-local',
        exportedAt: new Date().toISOString(),
        exportedBy: {
            admin: currentAdmin?.username || currentAdmin?.email || '',
            SupabaseUid: window.SupabaseBackend?.currentUid?.() || '',
            SupabaseEmail: window.SupabaseBackend?.currentEmail?.() || ''
        },
        stores
    };
}

// Runtime slice from admin.js: buildCloudDatabaseBackup.
async function buildCloudDatabaseBackup() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) {
        return buildLocalDatabaseBackup();
    }
    await loadCloudAdminStores();
    const backup = buildLocalDatabaseBackup();
    const cloudStores = await window.SupabaseBackend.loadStores([
        LOCAL_ADMIN_ACCOUNTS_KEY,
        'adminActivityLogs',
        ADMIN_NOTIFICATION_LOG_KEY,
        'roleActivityLogs',
        'adminAnnouncements',
        'adminEvents',
        'publicLeaders',
        'galleryItems',
        'adminHadiths',
        'adminResources',
        'adminPrayerTimes',
        'adminReligiousActivities',
        'siteSettings',
        'volunteerOpportunities',
        'contactVoiceMessages'
    ]).catch(() => ({}));
    Object.entries(cloudStores).forEach(([key, value]) => {
        backup.stores[key] = value;
    });
    const members = await window.SupabaseBackend.listMembers().catch(() => null);
    if (Array.isArray(members)) backup.stores.allMembers = members;
    const collections = {
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords',
        auditLogs: 'cloudAuditLogs',
        receiptVerifications: 'receiptVerifications',
        memberVerifications: 'memberVerifications'
    };
    for (const [collection, key] of Object.entries(collections)) {
        const records = await window.SupabaseBackend.listRecords(collection).catch(() => null);
        if (Array.isArray(records)) backup.stores[key] = records;
    }
    backup.backend = 'supabase-postgres';
    backup.SupabaseCollections = Object.fromEntries(Object.entries(collections).map(([collection, key]) => [collection, backup.stores[key] || []]));
    return backup;
}

// Runtime slice from admin.js: downloadBlob.
function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

// Runtime slice from admin.js: downloadDatabaseBackup.
async function downloadDatabaseBackup() {
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can download database backups.', 'danger');
        return;
    }
    if (!confirm('Download a private backup of the current Supabase/Postgres database? Keep this file private because it contains account data.')) return;

    try {
        let result;
        if (useStaticAdminApi) {
            const backup = await buildCloudDatabaseBackup();
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            result = {
                success: true,
                data: {
                    filename: `dawah-supabase-backup-${date}.json`,
                    mime: 'application/json;charset=utf-8',
                    content: JSON.stringify(backup, null, 2)
                }
            };
        } else {
            const response = await fetch(`${API_URL}?action=createDatabaseBackup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            result = await parseJsonResponse(response);
        }
        if (!result.success || !result.data?.content) {
            throw new Error(result.message || 'Could not create Supabase backup');
        }
        const filename = result.data.filename || `dawah-supabase-backup-${Date.now()}.json`;
        downloadBlob(filename, result.data.content, result.data.mime || 'application/json;charset=utf-8');
        rememberDatabaseBackup(filename);
        showNotification('Supabase backup downloaded. Keep it private.', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    } catch (error) {
        showNotification(error.message || 'Could not create Supabase backup', 'danger');
    }
}

// Runtime slice from admin.js: restoreDatabaseBackup.
function restoreDatabaseBackup(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can request database restore.', 'danger');
        input.value = '';
        return;
    }
    if (!confirm('Restore can overwrite live data. Continue only if this is the correct Supabase JSON backup and restore mode is enabled.')) {
        input.value = '';
        return;
    }
    showNotification('Supabase restore is intentionally disabled in the client. Restore backups from the Supabase console or a trusted admin script.', 'warning');
    input.value = '';
}

// Runtime slice from admin.js: formatAdminAction.
function formatAdminAction(actionName) {
    const labels = {
        loginAdmin: 'Login',
        logoutAdmin: 'Logout',
        registerAdmin: 'Registered first admin',
        createAdminAccount: 'Added admin',
        deleteAdminAccount: 'Removed admin',
        resetAdminPassword: 'Sent admin reset email',
        changeAdminPassword: 'Changed own password',
        createDatabaseBackup: 'Created database backup',
        restoreDatabaseBackup: 'Restored database backup',
        createAnnouncement: 'Created announcement',
        deleteAnnouncement: 'Deleted announcement',
        createEvent: 'Created event',
        deleteEvent: 'Deleted event',
        addLeader: 'Added leader',
        deleteLeader: 'Deleted leader',
        addGalleryItem: 'Added gallery item',
        deleteGalleryItem: 'Deleted gallery item',
        addHadith: 'Added hadith',
        deleteHadith: 'Deleted hadith',
        updateWelfareStatus: 'Updated welfare',
        setPrayerTimes: 'Updated prayer times',
        saveReligiousActivity: 'Saved religious activity',
        deleteReligiousActivity: 'Deleted religious activity',
        addResource: 'Added resource',
        deleteResource: 'Deleted resource',
        approvePayment: 'Approved payment',
        approveDonation: 'Approved donation',
        recordPayment: 'Recorded payment',
        updatePaymentStatus: 'Updated payment status',
        recordDonation: 'Recorded donation',
        updateDonationStatus: 'Updated donation status',
        submitWelfare: 'Submitted welfare request',
        approveWelfare: 'Approved welfare request',
        updateStudentStatus: 'Updated member status',
        updateStudent: 'Updated student profile',
        deleteStudent: 'Deleted student',
        registerEvent: 'Registered for event',
        registerVolunteer: 'Registered volunteer',
        createVolunteerOp: 'Created volunteer opportunity',
        saveActivity: 'Added activity',
        deleteActivity: 'Removed activity',
        pendingAdminApproval: 'Pending main admin approval',
        approvePendingAdminActivity: 'Approved pending action',
        rejectPendingAdminActivity: 'Rejected pending action',
        opposeAdminActivity: 'Opposed admin action',
        deleteAdminActivityItem: 'Deleted item from activity',
        undoMyAdminActivityItem: 'Undid own action'
    };
    return labels[actionName] || actionName || 'Action';
}

// Runtime slice from admin.js: formatActivitySource.
function formatActivitySource(source) {
    if (source === 'member_dashboard') return 'Role dashboard';
    if (source === 'admin_panel') return 'Admin panel';
    return source || 'System';
}

// Runtime slice from admin.js: formatAdminActivityDetails.
function formatAdminActivityDetails(details) {
    if (!details || typeof details !== 'object') return '-';
    const request = details.request || details;
    const nestedItem = request.item || request.previous_item || null;
    const interestingKeys = [
        'title',
        'requested_action',
        'approved_action',
        'rejected_action',
        'undone_action',
        'reason',
        'name',
        'position',
        'category',
        'resource_type',
        'role',
        'type',
        'location',
        'event_date',
        'date',
        'status',
        'priority',
        'username',
        'email',
        'admin_id',
        'event_id',
        'announcement_id',
        'leader_id',
        'gallery_id',
        'resource_id',
        'hadith_id',
        'request_id',
        'payment_id',
        'donation_id'
    ];
    const parts = interestingKeys
        .filter(key => request[key] !== undefined && request[key] !== null && request[key] !== '')
        .map(key => `${key.replaceAll('_', ' ')}: ${request[key]}`);
    if (nestedItem) {
        ['title', 'event', 'topic', 'date', 'schedule', 'speaker', 'time'].forEach(key => {
            if (nestedItem[key] !== undefined && nestedItem[key] !== null && nestedItem[key] !== '') {
                parts.push(`${key}: ${nestedItem[key]}`);
            }
        });
    }
    if (parts.length) {
        return parts.join(', ');
    }
    if (details.message) return details.message;
    return JSON.stringify(request).slice(0, 120);
}

// Runtime slice from admin.js: handleManagedAdminCreate.
async function handleManagedAdminCreate(event) {
    event.preventDefault();
    const username = document.getElementById('managedAdminUsername').value.trim();
    const email = document.getElementById('managedAdminEmail').value.trim().toLowerCase();
    const password = document.getElementById('managedAdminPassword').value;
    const button = document.getElementById('managedAdminCreateButton');

    if (!isStrongAdminPassword(password)) {
        showNotification('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.', 'warning');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    try {
        const response = await fetch(`${API_URL}?action=createAdminAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            throw new Error(result.message || 'Could not add admin account');
        }
        document.getElementById('adminCreateForm').reset();
        showNotification('Admin account added successfully', 'success');
        loadAdminAccounts();
    } catch (error) {
        showNotification(error.message || 'Could not add admin account', 'danger');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-save"></i> Add Admin';
    }
}

// Runtime slice from admin.js: removeManagedAdmin.
function removeManagedAdmin(adminId) {
    if (!isBackupCurrentEnoughForDanger()) return;
    if (!confirm('Remove this admin from admin-panel access?')) return;
    fetch(`${API_URL}?action=deleteAdminAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not remove admin account');
        showNotification('Admin account removed', 'success');
        loadAdminAccounts();
    })
    .catch(error => showNotification(error.message || 'Could not remove admin account', 'danger'));
}

// Runtime slice from admin.js: resetManagedAdminPassword.
function resetManagedAdminPassword(adminId, email = '') {
    if (!email) {
        showNotification('This admin has no email for password reset.', 'warning');
        return;
    }
    if (!confirm(`Send a password reset email to ${email}?`)) return;

    fetch(`${API_URL}?action=resetAdminPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, email })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not send password reset email');
        showNotification('Password reset email sent to this admin.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not send password reset email', 'danger'));
}

// Runtime slice from admin.js: resetMyAdminPassword.
function resetMyAdminPassword() {
    showAdminLogin('');
    const emailInput = document.getElementById('adminForgotEmail');
    if (emailInput && currentAdmin?.email) {
        emailInput.value = currentAdmin.email;
    }
    bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
}

// Runtime slice from admin.js: handleAdminPasswordChange.
async function handleAdminPasswordChange(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('adminCurrentPassword').value;
    const newPassword = document.getElementById('adminNewPassword').value;
    const confirmPassword = document.getElementById('adminConfirmNewPassword').value;
    const button = document.getElementById('adminChangePasswordButton');

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'warning');
        return;
    }
    if (!isStrongAdminPassword(newPassword)) {
        showNotification('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.', 'warning');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        if (window.SupabaseBackend?.enabled && currentAdmin?.email) {
            await window.SupabaseBackend.loginEmail(currentAdmin.email, currentPassword);
        }
        const response = await fetch(`${API_URL}?action=changeAdminPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            throw new Error(result.message || 'Could not change password');
        }
        document.getElementById('adminChangePasswordForm').reset();
        showNotification('Password changed successfully', 'success');
    } catch (error) {
        showNotification(error.message || 'Could not change password', 'danger');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-key"></i> Change Password';
    }
}

// Runtime slice from admin.js: loadDashboardStats.
function loadDashboardStats() {
    renderBackupStatus();
    refreshCloudAdminStores(true)
        .finally(loadDashboardStatsFromLocal);
}

// Runtime slice from admin.js: loadDashboardStatsFromLocal.
function loadDashboardStatsFromLocal() {
    fetch(`${API_URL}?action=getDashboardStats`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const stats = result.data || {};
        setText('memberCount', stats.members || 0);
        setText('studentCount', stats.students || 0);
        setText('donationTotal', formatMoney(stats.donation_total || 0));
        setText('donationCount', stats.donations || 0);
        setText('pendingDonationCount', stats.pending_donations || 0);
        setText('failedDonationCount', stats.failed_donations || 0);
        setText('pendingDonationAmount', formatMoney(stats.pending_donation_amount || 0));
        setText('monthDonationTotal', formatMoney(stats.month_donation_total || 0));
        setText('paymentTotal', formatMoney(stats.payment_total || 0));
        setText('paymentCount', stats.payments || 0);
        setText('pendingPaymentCount', stats.pending_payments || 0);
        setText('failedPaymentCount', stats.failed_payments || 0);
        setText('pendingPaymentAmount', formatMoney(stats.pending_payment_amount || 0));
        setText('monthPaymentTotal', formatMoney(stats.month_payment_total || 0));
        setText('welfareCount', stats.welfare_requests || 0);
        setText('pendingWelfareCount', stats.pending_welfare || 0);
        setText('eventCount', stats.events || 0);
        setText('announcementCount', stats.announcements || 0);
        setText('resourceCount', stats.resources || 0);
        setText('galleryCount', stats.gallery || 0);
        setText('leaderCount', stats.leaders || 0);
        setText('hadithCount', stats.hadiths || 0);
        setText('prayerCount', stats.prayer_days || 0);
        setText('researchCount', stats.research || 0);
        setText('researchTodayCount', stats.research_today || 0);
        setText('researchDeepCount', stats.research_deep || 0);
        setText('researchIslamicCount', stats.research_islamic || 0);
        setText('notificationCount', stats.notifications || 0);
        renderAdminDashboardCharts(stats);
        renderNeedsAttentionPanel();
    })
    .catch(error => {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading database dashboard stats', 'warning');
        renderNeedsAttentionPanel();
    });
}

// Runtime slice from admin.js: getExpiringMembershipCards.
function getExpiringMembershipCards(days = 60) {
    const now = Date.now();
    const limit = now + (days * 86400000);
    return getStudentRecords().filter(member => {
        const rawDate = member.membershipCardExpiresAt || member.cardExpiresAt || member.expiresAt;
        if (!rawDate) return false;
        const expiresAt = new Date(rawDate).getTime();
        return Number.isFinite(expiresAt) && expiresAt >= now && expiresAt <= limit;
    });
}

// Runtime slice from admin.js: getSuspiciousActivityRecords.
function getSuspiciousActivityRecords() {
    const records = readStore('suspiciousActivityLog');
    return Array.isArray(records) ? records : [];
}

// Runtime slice from admin.js: renderNeedsAttentionPanel.
function renderNeedsAttentionPanel() {
    const container = document.getElementById('needsAttentionPanel');
    if (!container) return;

    const pendingPayments = readStore('payments').filter(item => /pending/i.test(item.status || ''));
    const pendingDonations = readStore('donations').filter(item => /pending/i.test(item.status || ''));
    const suspicious = getSuspiciousActivityRecords().slice(0, 20);
    const expiringCards = getExpiringMembershipCards(60);
    const studentFollowUp = getStudentRecords().filter(member => {
        const status = normalizeAdminText(member.status || member.accountStatus);
        const payment = normalizeAdminText(member.membershipPaymentStatus || member.paymentStatus);
        return status.includes('pending') || status.includes('inactive') || status.includes('suspended') || payment.includes('no payment');
    });

    const cards = [
        {
            label: 'Pending Payments',
            count: pendingPayments.length,
            icon: 'fa-money-check',
            tone: pendingPayments.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('payments')"
        },
        {
            label: 'Pending Donations',
            count: pendingDonations.length,
            icon: 'fa-hand-holding-heart',
            tone: pendingDonations.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('donations')"
        },
        {
            label: 'Student Follow-up',
            count: studentFollowUp.length,
            icon: 'fa-user-clock',
            tone: studentFollowUp.length ? 'info text-dark' : 'success',
            action: "loadDashboardDetail('students')"
        },
        {
            label: 'Cards Expiring Soon',
            count: expiringCards.length,
            icon: 'fa-id-card',
            tone: expiringCards.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('students')"
        },
        {
            label: 'Suspicious Attempts',
            count: suspicious.length,
            icon: 'fa-shield-halved',
            tone: suspicious.length ? 'danger' : 'success',
            action: ''
        }
    ];

    container.innerHTML = cards.map(card => `
        <div class="col-12 col-md-6 col-xl">
            <button type="button" class="btn w-100 text-start border bg-white p-3 h-100" ${card.action ? `onclick="${card.action}"` : ''}>
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <span class="fw-semibold"><i class="fas ${card.icon} me-2"></i>${escapeAdminText(card.label)}</span>
                    <span class="badge bg-${card.tone}">${Number(card.count || 0)}</span>
                </div>
            </button>
        </div>
    `).join('');
}

// Runtime slice from admin.js: setText.
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// Runtime slice from admin.js: togglePasswordVisibility.
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button?.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
    const icon = button?.querySelector('i');
    if (icon) {
        icon.className = shouldShow ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

// Runtime slice from admin.js: formatMoney.
function formatMoney(value) {
    return 'KSh ' + Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// Runtime slice from admin.js: renderAdminDashboardCharts.
function renderAdminDashboardCharts(stats = {}) {
    if (typeof Chart === 'undefined') return;
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };
    const memberCtx = document.getElementById('adminMemberStatusChart');
    if (memberCtx) {
        if (typeof window.adminMemberStatusChart?.destroy === 'function') window.adminMemberStatusChart.destroy();
        const members = Number(stats.members || 0);
        const students = Number(stats.students || 0);
        const nonMembers = Math.max(0, students - members);
        window.adminMemberStatusChart = new Chart(memberCtx, {
            type: 'doughnut',
            data: {
                labels: ['Members', 'Students not members'],
                datasets: [{ data: [members, nonMembers], backgroundColor: ['#40b050', '#0060b0'] }]
            },
            options: chartDefaults
        });
    }
    const financeCtx = document.getElementById('adminFinanceStatusChart');
    if (financeCtx) {
        if (typeof window.adminFinanceStatusChart?.destroy === 'function') window.adminFinanceStatusChart.destroy();
        window.adminFinanceStatusChart = new Chart(financeCtx, {
            type: 'bar',
            data: {
                labels: ['Donations', 'Payments'],
                datasets: [
                    {
                        label: 'Received',
                        data: [Number(stats.donation_total || 0), Number(stats.payment_total || 0)],
                        backgroundColor: '#40b050'
                    },
                    {
                        label: 'Pending',
                        data: [Number(stats.pending_donation_amount || 0), Number(stats.pending_payment_amount || 0)],
                        backgroundColor: '#0060b0'
                    }
                ]
            },
            options: { ...chartDefaults, scales: { y: { beginAtZero: true } } }
        });
    }
    const operationsCtx = document.getElementById('adminOperationsChart');
    if (operationsCtx) {
        if (typeof window.adminOperationsChart?.destroy === 'function') window.adminOperationsChart.destroy();
        window.adminOperationsChart = new Chart(operationsCtx, {
            type: 'radar',
            data: {
                labels: ['Events', 'Welfare', 'Resources', 'Gallery', 'Research'],
                datasets: [{
                    label: 'Records',
                    data: [
                        Number(stats.events || 0),
                        Number(stats.welfare_requests || 0),
                        Number(stats.resources || 0),
                        Number(stats.gallery || 0),
                        Number(stats.research || 0)
                    ],
                    borderColor: '#003040',
                    backgroundColor: 'rgba(64, 176, 80, 0.2)'
                }]
            },
            options: chartDefaults
        });
    }
}

// Runtime slice from admin.js: formatRequestMoney.
function formatRequestMoney(value) {
    if (value === null || value === undefined || value === '' || value === 'Not specified') {
        return 'Not specified';
    }
    if (Number.isNaN(Number(value))) {
        return escapeAdminText(String(value));
    }
    return formatMoney(value);
}

// Runtime slice from admin.js: loadDashboardDetail.
function loadDashboardDetail(type) {
    setActiveDashboardCard(type);
    refreshCloudAdminStores(true)
        .finally(() => loadDashboardDetailFromLocal(type));
}

// Runtime slice from admin.js: loadDashboardDetailFromLocal.
function loadDashboardDetailFromLocal(type) {
    fetch(`${API_URL}?action=getDashboardDetail&type=${encodeURIComponent(type)}`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load database records');
        }
        renderDashboardDetail(type, result.data.rows || []);
    })
    .catch(error => {
        console.error('Error loading dashboard detail:', error);
        showNotification(error.message || 'Error loading database records', 'danger');
    });
}

// Runtime slice from admin.js: setActiveDashboardCard.
function setActiveDashboardCard(type) {
    document.querySelectorAll('.dashboard-stat-card').forEach(card => {
        card.classList.remove('active');
    });
    const activeCard = document.querySelector(`.dashboard-stat-card[onclick*="'${type}'"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
}

// Runtime slice from admin.js: isDashboardStudentMember.
function isDashboardStudentMember(row) {
    const rowKeys = new Set(memberIdentityKeys(row));
    if (
        isCompletedStatus(row?.membershipCardPaymentStatus)
        || isCompletedStatus(row?.paymentStatus)
        || isCompletedStatus(row?.membershipPaymentStatus)
        || normalizeAdminText(row?.membershipCardRecordStatus) === 'active'
        || normalizeAdminText(row?.membershipCardStatus).includes('ready after payment')
    ) {
        return true;
    }
    return getMemberRecords().some(member =>
        memberIdentityKeys(member).some(key => rowKeys.has(key))
    );
}

// Runtime slice from admin.js: getStudentDashboardFilterFlags.
function getStudentDashboardFilterFlags(row) {
    const flags = ['all'];
    const status = normalizeAdminText(row?.status || row?.accountStatus);
    const membershipStatus = normalizeAdminText(row?.membershipStatus || row?.membershipStage);

    if (isDashboardStudentMember(row)) {
        flags.push('members');
    } else {
        flags.push('not_paid');
    }
    if (status.includes('pending') || membershipStatus.includes('pending')) {
        flags.push('pending');
    }
    if (status === 'active' || normalizeAdminText(row?.accountStatus) === 'active') {
        flags.push('active');
    }
    return flags;
}

// Runtime slice from admin.js: renderStudentDashboardFilters.
function renderStudentDashboardFilters(rows) {
    const memberCount = rows.filter(isDashboardStudentMember).length;
    const notPaidCount = Math.max(0, rows.length - memberCount);
    return `
        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <select class="form-select form-select-sm" id="studentDashboardFilter" style="max-width: 220px;" onchange="filterStudentDashboardDetail()">
                <option value="all">All students (${rows.length})</option>
                <option value="members">Paid members (${memberCount})</option>
                <option value="not_paid">Not paid yet (${notPaidCount})</option>
                <option value="pending">Pending status</option>
                <option value="active">Active login</option>
            </select>
            <input type="search" class="form-control form-control-sm" id="studentDashboardSearch" style="max-width: 260px;" placeholder="Search student records" oninput="filterStudentDashboardDetail()">
            <span class="small text-muted" id="studentDashboardFilterCount">${rows.length} shown</span>
        </div>
    `;
}

// Runtime slice from admin.js: filterStudentDashboardDetail.
function filterStudentDashboardDetail() {
    const filter = document.getElementById('studentDashboardFilter')?.value || 'all';
    const search = normalizeAdminText(document.getElementById('studentDashboardSearch')?.value || '');
    const rows = Array.from(document.querySelectorAll('#dashboardDetailTable tbody tr[data-student-filter]'));
    let visible = 0;

    rows.forEach(row => {
        const flags = String(row.dataset.studentFilter || '').split(/\s+/);
        const matchesFilter = filter === 'all' || flags.includes(filter);
        const matchesSearch = !search || normalizeAdminText(row.textContent).includes(search);
        const shouldShow = matchesFilter && matchesSearch;
        row.classList.toggle('d-none', !shouldShow);
        if (shouldShow) visible += 1;
    });

    const count = document.getElementById('studentDashboardFilterCount');
    if (count) count.textContent = `${visible} shown`;
}

// Runtime slice from admin.js: filterDashboardDetailRows.
function filterDashboardDetailRows() {
    const query = normalizeAdminText(document.getElementById('dashboardDetailSearch')?.value || '');
    const status = normalizeAdminText(document.getElementById('dashboardDetailStatusFilter')?.value || '');
    const rows = Array.from(document.querySelectorAll('#dashboardDetailTable tbody tr[data-dashboard-row]'));
    let visible = 0;

    rows.forEach(row => {
        const rowStatus = normalizeAdminText(row.dataset.status || '');
        const matchesStatus = !status || rowStatus.includes(status);
        const matchesSearch = !query || normalizeAdminText(row.textContent).includes(query);
        const shouldShow = matchesStatus && matchesSearch;
        row.classList.toggle('d-none', !shouldShow);
        if (shouldShow) visible += 1;
    });

    const count = document.getElementById('dashboardDetailFilterCount');
    if (count) count.textContent = `${visible} shown`;
}

// Runtime slice from admin.js: renderDashboardDetail.
function renderDashboardDetail(type, rows) {
    const title = document.getElementById('dashboardDetailTitle');
    const container = document.getElementById('dashboardDetailTable');
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    title.innerHTML = `<i class="fas fa-table"></i> ${label} Records`;
    lastDashboardDetailType = type;
    lastDashboardDetailRows = Array.isArray(rows) ? rows : [];

    if (!rows.length && (type === 'payments' || type === 'donations')) {
        renderFinanceDashboardDetail(type, [], container);
        return;
    }

    if (!rows.length) {
        container.innerHTML = `
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                <p class="text-muted mb-0">No records found in the database for this section.</p>
                <button class="btn btn-sm btn-outline-secondary" type="button" disabled><i class="fas fa-file-export"></i> Export CSV</button>
            </div>
        `;
        return;
    }

    if (type === 'research') {
        renderResearchUsageDashboard(rows, container);
        return;
    }

    if (type === 'payments' || type === 'donations') {
        renderFinanceDashboardDetail(type, rows, container);
        return;
    }

    const columns = Object.keys(rows[0]);
    const showApprovalActions = type === 'payments' || type === 'donations';
    const researchNote = type === 'research'
        ? '<div class="alert alert-info py-2">AI research logs are for monitoring system usage and academic safety. Religious rulings should still be verified by qualified scholars.</div>'
        : '';
    const studentFilters = type === 'students' ? renderStudentDashboardFilters(rows) : '';
    const dashboardFilters = type === 'students' ? '' : `
        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <input type="search" class="form-control form-control-sm" id="dashboardDetailSearch" style="max-width: 280px;" placeholder="Search records" oninput="filterDashboardDetailRows()">
            <select class="form-select form-select-sm" id="dashboardDetailStatusFilter" style="max-width: 180px;" onchange="filterDashboardDetailRows()">
                <option value="">All statuses</option>
                <option value="pending">Pending only</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
            </select>
            <span class="small text-muted" id="dashboardDetailFilterCount">${rows.length} shown</span>
        </div>
    `;
    container.innerHTML = `
        ${researchNote}
        ${studentFilters}
        ${dashboardFilters}
        <div class="d-flex flex-wrap gap-2 justify-content-end mb-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportDashboardDetailCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportAllSystemCsvs()"><i class="fas fa-download"></i> Export all</button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr>${columns.map(col => `<th>${col.replaceAll('_', ' ')}</th>`).join('')}${showApprovalActions ? '<th>Action</th>' : ''}</tr></thead>
                <tbody>
                    ${rows.map(row => `
                        <tr${type === 'students' ? ` data-student-filter="${getStudentDashboardFilterFlags(row).join(' ')}"` : ` data-dashboard-row="1" data-status="${escapeAdminText(row.status || row.accountStatus || row.paymentStatus || '')}"`}>${columns.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}${showApprovalActions ? `<td>${renderApprovalAction(type, row)}</td>` : ''}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    if (type === 'students') {
        filterStudentDashboardDetail();
    } else {
        filterDashboardDetailRows();
    }
}

// Runtime slice from admin.js: getFinanceAmount.
function getFinanceAmount(row) {
    return Number(String(row.amount || row.total_amount || '0').replace(/[^0-9.-]/g, '')) || 0;
}

// Runtime slice from admin.js: getFinanceStatus.
function getFinanceStatus(row) {
    const raw = String(row.status || 'Pending').toLowerCase();
    if (raw.includes('complete') || raw.includes('approved')) return 'Completed';
    if (raw.includes('reject') || raw.includes('fail')) return 'Rejected';
    if (raw.includes('reverse')) return 'Reversed';
    return 'Pending';
}

// Runtime slice from admin.js: getFinanceDate.
function getFinanceDate(row) {
    return row.date || row.created_at || row.createdAt || row.approved_at || row.approvedAt || '';
}

// Runtime slice from admin.js: renderFinanceDashboardDetail.
function renderFinanceDashboardDetail(type, rows, container) {
    backfillFinanceReceiptVerifications(type, rows);
    const completedRows = rows.filter(row => getFinanceStatus(row) === 'Completed');
    const pendingRows = rows.filter(row => getFinanceStatus(row) === 'Pending');
    const rejectedRows = rows.filter(row => ['Rejected', 'Reversed'].includes(getFinanceStatus(row)));
    const completedTotal = completedRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);
    const pendingTotal = pendingRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);
    const problemTotal = rejectedRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);

    container.innerHTML = `
        <div class="row g-2 mb-3">
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(completedTotal)}</strong><br><small>Received</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(pendingTotal)}</strong><br><small>Awaiting confirmation</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(problemTotal)}</strong><br><small>Rejected or reversed</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${rows.length}</strong><br><small>Total records</small></div></div>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
            <input type="search" class="form-control form-control-sm" style="max-width: 280px;" id="financeSearchInput" placeholder="Search name, ref, receipt..." oninput="filterFinanceDashboardTable()">
            <select class="form-select form-select-sm" style="max-width: 170px;" id="financeStatusFilter" onchange="filterFinanceDashboardTable()">
                <option value="">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Reversed">Reversed</option>
            </select>
            <select class="form-select form-select-sm" style="max-width: 170px;" id="financeMonthFilter" onchange="filterFinanceDashboardTable()">
                <option value="">All months</option>
                <option value="${new Date().toISOString().slice(0, 7)}">This month</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportDashboardDetailCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportCombinedFinanceReportCsv()"><i class="fas fa-file-invoice-dollar"></i> Finance report</button>
            <button class="btn btn-sm btn-outline-success" type="button" onclick="printMonthlyFinanceReport()"><i class="fas fa-print"></i> Monthly print</button>
        </div>
        <div id="financeDashboardTable"></div>
    `;
    filterFinanceDashboardTable();
}

// Runtime slice from admin.js: backfillFinanceReceiptVerifications.
function backfillFinanceReceiptVerifications(type, rows) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.()) return;
    if (!['payments', 'donations'].includes(type) || !Array.isArray(rows)) return;
    rows
        .filter(row => getFinanceStatus(row) === 'Completed')
        .filter(row => row.receiptNumber || row.receipt_number || row.transactionRef || row.transaction_id)
        .slice(0, 75)
        .forEach(row => {
            const receiptNumber = row.receiptNumber || row.receipt_number || row.transactionRef || row.transaction_id;
            const migrationKey = `receiptVerificationBackfill:${receiptNumber}`;
            if (sessionStorage.getItem(migrationKey) === '1') return;
            const record = buildReceiptVerificationRecord(type, {
                ...row,
                receiptNumber,
                status: 'Completed'
            });
            window.SupabaseBackend.saveReceiptVerification(record)
                .then(() => sessionStorage.setItem(migrationKey, '1'))
                .catch(error => console.error('Receipt verification backfill failed:', error));
        });
}

// Runtime slice from admin.js: filterFinanceDashboardTable.
function filterFinanceDashboardTable() {
    const container = document.getElementById('financeDashboardTable');
    if (!container) return;
    const rows = lastDashboardDetailRows || [];
    const query = String(document.getElementById('financeSearchInput')?.value || '').toLowerCase();
    const status = String(document.getElementById('financeStatusFilter')?.value || '');
    const month = String(document.getElementById('financeMonthFilter')?.value || '');
    const columns = ['id', 'date', 'created_at', 'name', 'student_name', 'donor', 'type', 'purpose', 'amount', 'paymentMethod', 'payment_method', 'transactionRef', 'transaction_id', 'receiptNumber', 'status', 'approvedBy', 'approvedAt', 'notes'];
    const filtered = rows.filter(row => {
        const haystack = columns.map(col => row[col] ?? '').join(' ').toLowerCase();
        const rowStatus = getFinanceStatus(row);
        const rowMonth = String(getFinanceDate(row) || '').slice(0, 7);
        return (!query || haystack.includes(query))
            && (!status || rowStatus === status)
            && (!month || rowMonth === month);
    });
    const visibleColumns = Array.from(new Set(filtered.flatMap(row => Object.keys(row || {}))));
    const columnsToRender = visibleColumns.length ? visibleColumns : Object.keys(rows[0] || {});
    const type = lastDashboardDetailType;
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted">${filtered.length} record(s) shown</small>
            <small class="text-muted">Completed receipts are locked after approval.</small>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr>${columnsToRender.map(col => `<th>${escapeAdminText(col.replaceAll('_', ' '))}</th>`).join('')}<th>Action</th></tr></thead>
                <tbody>
                    ${filtered.map(row => `
                        <tr>${columnsToRender.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}<td>${renderApprovalAction(type, row)}</td></tr>
                    `).join('') || `<tr><td colspan="${columnsToRender.length + 1}" class="text-center text-muted">No matching finance records.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

// Runtime slice from admin.js: normalizeFinanceExportRow.
function normalizeFinanceExportRow(kind, row) {
    return {
        kind,
        date: getFinanceDate(row),
        name: row.name || row.fullName || row.student_name || row.donor || row.donor_name || '',
        type: row.type || row.payment_type || row.donation_type || kind,
        purpose: row.purpose || '',
        amount: getFinanceAmount(row),
        status: getFinanceStatus(row),
        method: row.paymentMethod || row.payment_method || '',
        transactionRef: row.transactionRef || row.transaction_id || '',
        receiptNumber: row.receiptNumber || row.receipt_number || '',
        approvedBy: row.approvedBy || row.approved_by || '',
        approvedAt: row.approvedAt || row.approved_at || '',
        updatedBy: row.updatedBy || row.updated_by || '',
        updatedAt: row.updatedAt || row.updated_at || '',
        notes: row.notes || row.reversal_reason || ''
    };
}

// Runtime slice from admin.js: exportCombinedFinanceReportCsv.
function exportCombinedFinanceReportCsv() {
    const paymentRows = readStore('payments').map(row => normalizeFinanceExportRow('Payment', row));
    const donationRows = readStore('donations').map(row => normalizeFinanceExportRow('Donation', row));
    const fallback = lastDashboardDetailRows.map(row => normalizeFinanceExportRow(lastDashboardDetailType === 'donations' ? 'Donation' : 'Payment', row));
    const rows = paymentRows.concat(donationRows);
    const reportRows = rows.length ? rows : fallback;
    if (!reportRows.length) {
        showNotification('No finance records to export.', 'warning');
        return;
    }
    exportRowsToCsv(reportRows, 'combined-finance-report', ['kind', 'date', 'name', 'type', 'purpose', 'amount', 'status', 'method', 'transactionRef', 'receiptNumber', 'approvedBy', 'approvedAt', 'updatedBy', 'updatedAt', 'notes']);
}

// Runtime slice from admin.js: printMonthlyFinanceReport.
function printMonthlyFinanceReport() {
    const month = document.getElementById('financeMonthFilter')?.value || new Date().toISOString().slice(0, 7);
    const currentKind = lastDashboardDetailType === 'donations' ? 'Donation' : 'Payment';
    const sourceRows = (lastDashboardDetailRows || []).map(row => normalizeFinanceExportRow(currentKind, row));
    const rows = sourceRows.filter(row => !month || String(row.date || row.approvedAt || '').slice(0, 7) === month);
    if (!rows.length) {
        showNotification('No finance records found for the selected month.', 'warning');
        return;
    }
    const completed = rows.filter(row => row.status === 'Completed');
    const pending = rows.filter(row => row.status === 'Pending');
    const closed = rows.filter(row => ['Rejected', 'Reversed'].includes(row.status));
    const total = completed.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Finance Report</title>
    <style>
        body { font-family: Arial, sans-serif; color: #17323a; margin: 28px; }
        h1 { margin: 0 0 4px; font-size: 24px; }
        .muted { color: #667085; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
        .box { border: 1px solid #d9e5e1; padding: 12px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f3fbf7; }
        @media print { button { display: none; } body { margin: 12mm; } }
    </style>
</head>
<body>
    <button onclick="window.print()">Print</button>
    <h1>UMMA University Dawah Team</h1>
    <div class="muted">Monthly Finance Report - ${escapeAdminText(month || 'All months')}</div>
    <div class="summary">
        <div class="box"><strong>${formatMoney(total)}</strong><br><span class="muted">Received</span></div>
        <div class="box"><strong>${completed.length}</strong><br><span class="muted">Completed</span></div>
        <div class="box"><strong>${pending.length}</strong><br><span class="muted">Pending</span></div>
        <div class="box"><strong>${closed.length}</strong><br><span class="muted">Rejected/Reversed</span></div>
    </div>
    <table>
        <thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Method</th><th>Receipt</th></tr></thead>
        <tbody>
            ${rows.map(row => `<tr><td>${escapeAdminText(row.date)}</td><td>${escapeAdminText(row.name)}</td><td>${escapeAdminText(row.type)}</td><td>${formatMoney(row.amount)}</td><td>${escapeAdminText(row.status)}</td><td>${escapeAdminText(row.method)}</td><td>${escapeAdminText(row.receiptNumber)}</td></tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print the monthly report.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}

// Runtime slice from admin.js: renderResearchUsageDashboard.
function renderResearchUsageDashboard(rows, container) {
    const total = rows.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter(row => String(row.created_at || row.createdAt || '').slice(0, 10) === today).length;
    const userCount = new Set(rows.map(row => row.user_id || row.username || 'unknown')).size;
    const modelCount = new Set(rows.map(row => row.model || 'unknown')).size;
    container.innerHTML = `
        <div class="alert alert-info py-2">AI research logs help admins monitor usage and academic safety. Verify Islamic rulings with qualified scholars.</div>
        <div class="row g-2 mb-3">
            <div class="col-md-3"><div class="border rounded p-2"><strong>${total}</strong><br><small>Total AI requests</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${todayCount}</strong><br><small>Today</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${userCount}</strong><br><small>Users</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${modelCount}</strong><br><small>Models</small></div></div>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-3">
            <input type="search" class="form-control form-control-sm" style="max-width: 320px;" id="researchLogSearch" placeholder="Search questions, answers, users..." oninput="filterResearchUsageTable()">
            <select class="form-select form-select-sm" style="max-width: 180px;" id="researchLogMode" onchange="filterResearchUsageTable()">
                <option value="">All modes</option>
                <option value="groq_chat">Chat</option>
                <option value="quick">Quick</option>
                <option value="deep">Deep</option>
                <option value="islamic">Islamic</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportResearchUsageCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
        </div>
        <div id="researchUsageTable"></div>
    `;
    filterResearchUsageTable();
}

// Runtime slice from admin.js: filterResearchUsageTable.
function filterResearchUsageTable() {
    const container = document.getElementById('researchUsageTable');
    if (!container) return;
    const query = String(document.getElementById('researchLogSearch')?.value || '').toLowerCase();
    const mode = String(document.getElementById('researchLogMode')?.value || '').toLowerCase();
    const filtered = lastDashboardDetailRows.filter(row => {
        const haystack = [row.username, row.user_id, row.role, row.question, row.answer, row.model, row.mode].join(' ').toLowerCase();
        const rowMode = String(row.mode || '').toLowerCase();
        return (!query || haystack.includes(query)) && (!mode || rowMode === mode);
    });
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr><th>Date</th><th>User</th><th>Mode</th><th>Question</th><th>Answer</th><th>Model</th></tr></thead>
                <tbody>
                    ${filtered.slice(0, 150).map(row => `
                        <tr>
                            <td>${formatCell(row.created_at || row.createdAt || '', 'created_at')}</td>
                            <td>${escapeAdminText(row.username || row.user_id || 'Unknown')}</td>
                            <td>${escapeAdminText(row.mode || '')}</td>
                            <td>${escapeAdminText(String(row.question || '').slice(0, 180))}</td>
                            <td>${escapeAdminText(String(row.answer || '').slice(0, 220))}</td>
                            <td>${escapeAdminText(row.model || '')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Runtime slice from admin.js: exportResearchUsageCsv.
function exportResearchUsageCsv() {
    exportRowsToCsv(lastDashboardDetailRows || [], 'research-usage', ['created_at', 'user_id', 'username', 'role', 'mode', 'question', 'answer', 'model']);
}

// Runtime slice from admin.js: exportDashboardDetailCsv.
function exportDashboardDetailCsv() {
    if (!requireMainAdminForSensitiveExport()) return;
    const rows = lastDashboardDetailRows || [];
    if (!rows.length) {
        showNotification('No records to export.', 'warning');
        return;
    }
    exportRowsToCsv(rows, lastDashboardDetailType || 'dashboard-records');
}

// Runtime slice from admin.js: exportAllSystemCsvs.
function exportAllSystemCsvs() {
    if (!requireMainAdminForSensitiveExport()) return;
    const exports = [
        ['students', getStudentRecords()],
        ['paid-members', getMemberRecords()],
        ['payments', readStore('payments')],
        ['donations', readStore('donations')],
        ['officers-and-admins', getLocalAdminAccounts()],
        ['audit-logs', readStore('adminActivityLogs')],
        ['events', readStore('adminEvents')],
        ['welfare-requests', readStore('welfareRequests')]
    ].filter(([, rows]) => Array.isArray(rows) && rows.length);

    if (!exports.length) {
        showNotification('No system records are available to export.', 'warning');
        return;
    }

    exports.forEach(([name, rows], index) => {
        setTimeout(() => exportRowsToCsv(rows, name), index * 250);
    });
    logLocalAdminActivity('exportAllSystemCsvs', { sections: exports.map(([name]) => name) });
    showNotification(`Export started for ${exports.length} section(s). Keep these files private.`, 'success');
}

// Runtime slice from admin.js: exportRowsToCsv.
function exportRowsToCsv(rows, filenameBase, preferredHeaders = null) {
    const allHeaders = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
    const headers = preferredHeaders || allHeaders;
    const csv = [headers.join(',')].concat(rows.map(row => headers.map(key => {
        const raw = row[key];
        const value = String(raw && typeof raw === 'object' ? JSON.stringify(raw) : (raw || '')).replaceAll('"', '""');
        return `"${value}"`;
    }).join(','))).join('\n');
    downloadBlob(`${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
}

// Runtime slice from admin.js: renderApprovalAction.
function renderApprovalAction(type, row) {
    const status = String(row.status || '').toLowerCase();
    if (status === 'completed') {
        const reverseButton = currentAdmin?.isMainAdmin
            ? `<button class="btn btn-outline-danger" onclick="${type === 'payments' ? 'reversePaymentRecord' : 'reverseDonationRecord'}(${row.id})">Reverse</button>`
            : '';
        return `<div class="btn-group btn-group-sm"><span class="btn btn-success disabled">Approved</span>${reverseButton}</div>`;
    }
    if (status === 'pending_main_approval') {
        if (currentAdmin?.isMainAdmin) {
            return `
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-success" onclick="${type === 'payments' ? 'approvePaymentRecord' : 'approveDonationRecord'}(${row.id})">Final approve</button>
                    <button class="btn btn-outline-danger" onclick="${type === 'payments' ? 'rejectPaymentRecord' : 'rejectDonationRecord'}(${row.id})">Reject</button>
                </div>
            `;
        }
        return '<span class="badge bg-warning text-dark">Needs main admin</span>';
    }
    if (status === 'rejected' || status === 'failed' || status === 'reversed') {
        return `<span class="badge bg-danger">${status === 'failed' ? 'Failed' : status === 'reversed' ? 'Reversed' : 'Rejected'}</span>`;
    }

    if (type === 'payments') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success" onclick="approvePaymentRecord(${row.id})">Approve</button>
                <button class="btn btn-outline-danger" onclick="rejectPaymentRecord(${row.id})">Reject</button>
            </div>
        `;
    }

    if (type === 'donations') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success" onclick="approveDonationRecord(${row.id})">Approve</button>
                <button class="btn btn-outline-danger" onclick="rejectDonationRecord(${row.id})">Reject</button>
            </div>
        `;
    }

    return '-';
}

// Runtime slice from admin.js: reversePaymentRecord.
function reversePaymentRecord(paymentId) {
    const reason = prompt('Main admin reversal reason:');
    if (!reason) return;
    fetch(`${API_URL}?action=reversePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reverse payment');
        showNotification('Payment reversed and audited.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: reverseDonationRecord.
function reverseDonationRecord(donationId) {
    const reason = prompt('Main admin reversal reason:');
    if (!reason) return;
    fetch(`${API_URL}?action=reverseDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reverse donation');
        showNotification('Donation reversed and audited.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: rejectPaymentRecord.
function rejectPaymentRecord(paymentId) {
    const notes = prompt('Reason for rejecting this payment:', 'Could not verify received funds.');
    if (notes === null) return;
    fetch(`${API_URL}?action=rejectPayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, notes })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject payment');
        showNotification('Payment rejected.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: rejectDonationRecord.
function rejectDonationRecord(donationId) {
    const notes = prompt('Reason for rejecting this donation:', 'Could not verify received funds.');
    if (notes === null) return;
    fetch(`${API_URL}?action=rejectDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, notes })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject donation');
        showNotification('Donation rejected.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: approvePaymentRecord.
function approvePaymentRecord(paymentId) {
    if (!confirm('Approve this payment only after confirming the money was received. Continue?')) return;
    fetch(`${API_URL}?action=approvePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve payment');
        showNotification('Payment approved. Receipt can now be issued.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: approveDonationRecord.
function approveDonationRecord(donationId) {
    if (!confirm('Approve this donation only after confirming the money was received. Continue?')) return;
    fetch(`${API_URL}?action=approveDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve donation');
        showNotification('Donation approved. Receipt can now be issued.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: formatCell.
function formatCell(value, column = '') {
    if (value === null || value === undefined || value === '') return '-';
    const text = String(value);
    if (/amount|total|balance|value|fee|dues|donation|payment/i.test(column) && !Number.isNaN(Number(value))) {
        return formatMoney(value);
    }
    const isPhotoColumn = /photo|image|avatar/i.test(column);
    if ((isPhotoColumn || text.startsWith('data:image/')) && text.startsWith('data:image/')) {
        return `<img src="${text}" alt="Member photo" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,128,0,.18);">`;
    }
    if (isPhotoColumn && (text.startsWith('uploads/') || text.startsWith('http'))) {
        return `<img src="${resolveAdminUrl(text)}" alt="Member photo" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,128,0,.18);">`;
    }
    if (column === 'proof_url' && text.startsWith('uploads/payment_proofs/')) {
        return `<a href="${resolveAdminUrl(text)}" target="_blank">View proof</a>`;
    }
    if (text.startsWith('uploads/') || text.startsWith('http')) {
        return `<a href="${resolveAdminUrl(text)}" target="_blank">Open</a>`;
    }
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
}

// Runtime slice from admin.js: getStaticDashboardDetail.
function getStaticDashboardDetail(type) {
    const stores = {
        members: getMemberRecords(),
        students: getStudentRecords(),
        donations: readStore('donations'),
        payments: readStore('payments'),
        welfare: readStore('welfareRequests'),
        events: readStore('adminEvents'),
        announcements: readStore('adminAnnouncements'),
        resources: readStore('adminResources'),
        gallery: readStore('galleryItems'),
        leadership: readStore('publicLeaders'),
        hadiths: readStore('adminHadiths'),
        prayer: localStorage.getItem('adminPrayerTimes') ? [JSON.parse(localStorage.getItem('adminPrayerTimes'))] : []
    };
    const rows = (stores[type] || []).map(item => {
        if (type === 'payments') {
            return {
                id: item.id || item.dbPaymentId || item.payment_id || '',
                payment_type: item.type || item.payment_type || '',
                amount: item.amount || 0,
                status: item.status || 'Pending',
                payment_method: item.paymentMethod || item.payment_method || '',
                transaction_id: item.transactionRef || item.transaction_id || '',
                receipt_number: item.receiptNumber || item.receipt_number || '',
                approved_by: item.approvedBy || item.approved_by || '',
                approved_at: item.approvedAt || item.approved_at || '',
                updated_by: item.updatedBy || item.updated_by || '',
                updated_at: item.updatedAt || item.updated_at || '',
                reversal_reason: item.reversalReason || item.reversal_reason || '',
                audit_count: Array.isArray(item.auditTrail) ? item.auditTrail.length : 0,
                notes: item.notes || '',
                created_at: item.date || item.created_at || ''
            };
        }
        if (type === 'donations') {
            return {
                id: item.id || item.dbDonationId || item.donation_id || '',
                donor_name: item.donor || item.donor_name || '',
                donor_email: item.email || item.donor_email || '',
                amount: item.amount || 0,
                donation_type: item.type || item.donation_type || '',
                purpose: item.purpose || '',
                payment_method: item.paymentMethod || item.payment_method || '',
                transaction_id: item.transactionRef || item.transaction_id || '',
                receipt_number: item.receiptNumber || item.receipt_number || '',
                approved_by: item.approvedBy || item.approved_by || '',
                approved_at: item.approvedAt || item.approved_at || '',
                updated_by: item.updatedBy || item.updated_by || '',
                updated_at: item.updatedAt || item.updated_at || '',
                reversal_reason: item.reversalReason || item.reversal_reason || '',
                audit_count: Array.isArray(item.auditTrail) ? item.auditTrail.length : 0,
                notes: item.notes || '',
                status: item.status || 'Pending',
                created_at: item.date || item.created_at || ''
            };
        }
        return item;
    });
    return { success: true, data: { type: type, rows } };
}

// ============================================
// ANNOUNCEMENT FUNCTIONS
// ============================================

// Runtime slice from admin.js: createAnnouncement.
function createAnnouncement() {
    const title = document.getElementById('announcementTitle').value.trim();
    const content = document.getElementById('announcementContent').value.trim();
    const priority = document.getElementById('announcementPriority').value;
    const expires = document.getElementById('announcementExpires').value;
    
    if (!title || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const data = {
        title: title,
        content: content,
        priority: priority,
        author_id: currentAdmin.id || 1,
        expires_at: expires ? expires.replace('T', ' ') : null
    };
    
    fetch(`${API_URL}?action=createAnnouncement`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Announcement created successfully!', 'success');
            document.getElementById('announcementTitle').value = '';
            document.getElementById('announcementContent').value = '';
            document.getElementById('announcementExpires').value = '';
            loadAnnouncements();
            loadAnnouncementCount();
        } else {
            showNotification('Error creating announcement: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error creating announcement', 'danger');
    });
}

// Runtime slice from admin.js: loadAnnouncements.
function loadAnnouncements() {
    fetch(`${API_URL}?action=getAnnouncements`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('announcementsList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No announcements yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(ann => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <h5>${ann.title}</h5>
                    <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(ann.priority)}">${ann.priority}</span></p>
                    <p>${ann.content.substring(0, 100)}${ann.content.length > 100 ? '...' : ''}</p>
                    <small class="text-muted">by ${ann.author_name || 'Admin'}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncementItem(${ann.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('announcementsList').innerHTML = '<p class="text-danger">Error loading announcements</p>';
    });
}

// Runtime slice from admin.js: deleteAnnouncementItem.
function deleteAnnouncementItem(announcementId) {
    if (!confirm('Delete this announcement?')) return;
    
    fetch(`${API_URL}?action=deleteAnnouncement`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ announcement_id: announcementId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Announcement deleted!', 'success');
            loadAnnouncements();
            loadAnnouncementCount();
        } else {
            showNotification('Error deleting announcement', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting announcement', 'danger');
    });
}

// Runtime slice from admin.js: loadAnnouncementCount.
function loadAnnouncementCount() {
    fetch(`${API_URL}?action=getAnnouncements`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('announcementCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// EVENT FUNCTIONS
// ============================================

// Runtime slice from admin.js: createEvent.
function createEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const category = document.getElementById('eventCategory').value.trim() || 'general';
    const capacity = parseInt(document.getElementById('eventCapacity').value, 10) || 100;
    
    if (!title || !description || !eventDate) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const data = {
        title: title,
        description: description,
        event_date: eventDate.replace('T', ' '),
        location: location,
        organizer_id: currentAdmin.id || 1,
        category: category,
        status: 'upcoming',
        max_participants: capacity
    };
    
    fetch(`${API_URL}?action=createEvent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Event created successfully!', 'success');
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDescription').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventLocation').value = '';
            document.getElementById('eventCategory').value = '';
            document.getElementById('eventCapacity').value = '';
            loadEvents();
            loadEventCount();
        } else {
            showNotification('Error creating event: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error creating event', 'danger');
    });
}

// Runtime slice from admin.js: loadEvents.
function loadEvents() {
    fetch(`${API_URL}?action=getEvents`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('eventsList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No events scheduled yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(evt => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <h5>${evt.title}</h5>
                    <p><strong>Date:</strong> ${new Date(evt.event_date).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${evt.location || 'Not specified'}</p>
                    <p><strong>Category:</strong> ${evt.category || 'general'} | <strong>Capacity:</strong> ${evt.max_participants || 100}</p>
                    <p>${evt.description.substring(0, 100)}${evt.description.length > 100 ? '...' : ''}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEventItem(${evt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('eventsList').innerHTML = '<p class="text-danger">Error loading events</p>';
    });

    loadEventRegistrations();
}

// Runtime slice from admin.js: loadEventRegistrations.
function loadEventRegistrations() {
    fetch(`${API_URL}?action=getEventRegistrations`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('eventRegistrationsList');
        if (!container) return;

        const registrations = result.data || [];
        if (!registrations.length) {
            container.innerHTML = '<p class="text-muted">No students have registered for events yet.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Student</th>
                            <th>Student ID</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Registered At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registrations.map(reg => {
                            const studentName = reg.first_name
                                ? `${reg.first_name} ${reg.last_name || ''}`.trim()
                                : (reg.submittedBy || reg.studentName || 'Student');
                            return `
                                <tr>
                                    <td>${reg.event_title || reg.eventName || 'Event'}</td>
                                    <td>${studentName}</td>
                                    <td>${reg.student_number || reg.student_id || '-'}</td>
                                    <td>${reg.email || '-'}</td>
                                    <td><span class="badge bg-success">${reg.status || 'registered'}</span></td>
                                    <td>${reg.registered_at ? new Date(reg.registered_at).toLocaleString() : (reg.registrationDate || '-')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    })
    .catch(error => {
        console.error('Event registration loading error:', error);
        const container = document.getElementById('eventRegistrationsList');
        if (container) {
            container.innerHTML = '<p class="text-danger">Error loading event registrations.</p>';
        }
    });
}

// Runtime slice from admin.js: deleteEventItem.
function deleteEventItem(eventId) {
    if (!confirm('Delete this event?')) return;
    
    fetch(`${API_URL}?action=deleteEvent`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event_id: eventId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Event deleted!', 'success');
            loadEvents();
            loadEventCount();
        } else {
            showNotification('Error deleting event', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting event', 'danger');
    });
}

// Runtime slice from admin.js: loadEventCount.
function loadEventCount() {
    fetch(`${API_URL}?action=getEvents`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('eventCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// LEADERSHIP FUNCTIONS
// ============================================

// Runtime slice from admin.js: addLeader.
function addLeader() {
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        showNotification('Only the main admin can manage leadership.', 'warning');
        return;
    }

    const name = document.getElementById('leaderName').value.trim();
    const position = document.getElementById('leaderPosition').value.trim();
    const course = document.getElementById('leaderCourse').value.trim();
    const yearOfStudy = document.getElementById('leaderYearOfStudy').value.trim();
    const bio = document.getElementById('leaderBio').value.trim();
    const description = document.getElementById('leaderDescription').value.trim();
    const email = document.getElementById('leaderEmail').value.trim();
    const phone = document.getElementById('leaderPhone').value.trim();
    const photoFile = document.getElementById('leaderPassportPhoto')?.files?.[0] || null;
    
    if (!name || !position) {
        showNotification('Name and position are required', 'warning');
        return;
    }
    
    const data = new FormData();
    Object.entries({
        name: name,
        position: position,
        course: course,
        year_of_study: yearOfStudy,
        bio: bio,
        description: description,
        email: email,
        phone: phone,
        user_id: currentAdmin.id || 0
    }).forEach(([key, value]) => data.append(key, value || ''));
    if (photoFile) {
        data.append('leader_passport_photo', photoFile);
    }
    
    fetch(`${API_URL}?action=addLeader`, {
        method: 'POST',
        body: data
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Leadership member added successfully!', 'success');
            document.getElementById('leaderName').value = '';
            document.getElementById('leaderPosition').value = '';
            document.getElementById('leaderCourse').value = '';
            document.getElementById('leaderYearOfStudy').value = '';
            document.getElementById('leaderBio').value = '';
            document.getElementById('leaderDescription').value = '';
            document.getElementById('leaderEmail').value = '';
            document.getElementById('leaderPhone').value = '';
            document.getElementById('leaderPassportPhoto').value = '';
            loadLeadership();
            loadLeadershipCount();
        } else {
            showNotification('Error adding leader: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding leader', 'danger');
    });
}

// Runtime slice from admin.js: loadLeadership.
function loadLeadership() {
    fetch(`${API_URL}?action=getLeaders`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('leadershipList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No leadership members added yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(leader => `
            <div class="item-card">
                <div class="item-info flex-grow-1" role="button" tabindex="0" onclick="showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}'); }">
                    <h5>${escapeAdminText(leader.name)}</h5>
                    <p><strong>Position:</strong> ${escapeAdminText(leader.position)}</p>
                    <p><strong>Course:</strong> ${escapeAdminText(leader.course || 'N/A')}</p>
                    <p><strong>Year of Study:</strong> ${escapeAdminText(leader.year_of_study || 'N/A')}</p>
                    <p><strong>Email:</strong> ${escapeAdminText(leader.email || 'N/A')}</p>
                    <p><strong>Phone:</strong> ${escapeAdminText(leader.phone || 'N/A')}</p>
                    <p>${escapeAdminText(leader.bio || '')}</p>
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="event.stopPropagation(); showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteLeaderItem(${leader.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('leadershipList').innerHTML = '<p class="text-danger">Error loading leaders</p>';
    });
}

// Runtime slice from admin.js: deleteLeaderItem.
function deleteLeaderItem(leaderId) {
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        showNotification('Only the main admin can manage leadership.', 'warning');
        return;
    }

    if (!confirm('Delete this leadership member?')) return;
    
    fetch(`${API_URL}?action=deleteLeader`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leader_id: leaderId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Leader deleted!', 'success');
            loadLeadership();
            loadLeadershipCount();
        } else {
            showNotification('Error deleting leader', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting leader', 'danger');
    });
}

// Runtime slice from admin.js: loadLeadershipCount.
function loadLeadershipCount() {
    fetch(`${API_URL}?action=getLeaders`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('leaderCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// GALLERY FUNCTIONS
// ============================================

// Runtime slice from admin.js: addGalleryItem.
function addGalleryItem() {
    const title = document.getElementById('galleryTitle').value.trim();
    const description = document.getElementById('galleryDescription').value.trim();
    const imageUrl = document.getElementById('galleryImageUrl').value.trim();
    const imageInput = document.getElementById('galleryImageUpload');
    
    if (!title || (!imageUrl && (!imageInput || !imageInput.files || imageInput.files.length === 0))) {
        showNotification('Title and an uploaded image or image URL are required', 'warning');
        return;
    }

    if (imageInput && imageInput.files && imageInput.files.length > 0) {
        if (!useStaticAdminApi) {
            saveGalleryItemData(title, description, '', getGalleryMediaType('', imageInput.files[0]), imageInput.files[0]);
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            saveGalleryItemData(title, description, e.target.result, getGalleryMediaType(e.target.result, imageInput.files[0]));
        };
        reader.readAsDataURL(imageInput.files[0]);
        return;
    }

    saveGalleryItemData(title, description, imageUrl, getGalleryMediaType(imageUrl));
}

// Runtime slice from admin.js: getGalleryMediaType.
function getGalleryMediaType(url, file = null) {
    const type = (file?.type || '').toLowerCase();
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('image/')) return 'image';
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') ? 'video' : 'image';
}

// Runtime slice from admin.js: saveGalleryItemData.
function saveGalleryItemData(title, description, imageUrl, mediaType = 'image', mediaFile = null) {
    const body = mediaFile ? new FormData() : JSON.stringify({
        title: title,
        description: description,
        image_url: imageUrl,
        media_type: mediaType,
        uploaded_by: currentAdmin.id || 0
    });
    const headers = mediaFile ? {} : { 'Content-Type': 'application/json' };

    if (mediaFile) {
        body.append('title', title);
        body.append('description', description);
        body.append('image_url', imageUrl);
        body.append('media_type', mediaType);
        body.append('uploaded_by', currentAdmin.id || 0);
        body.append('gallery_media', mediaFile);
    }
    
    fetch(`${API_URL}?action=addGalleryItem`, {
        method: 'POST',
        headers: headers,
        body: body
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Gallery item added successfully!', 'success');
            document.getElementById('galleryTitle').value = '';
            document.getElementById('galleryDescription').value = '';
            document.getElementById('galleryImageUrl').value = '';
            const imageInput = document.getElementById('galleryImageUpload');
            const preview = document.getElementById('galleryImagePreview');
            const videoPreview = document.getElementById('galleryVideoPreview');
            if (imageInput) imageInput.value = '';
            if (preview) {
                preview.src = '';
                preview.classList.add('d-none');
            }
            if (videoPreview) {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
            }
            loadGallery();
            loadGalleryCount();
        } else {
            showNotification('Error adding gallery item: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding gallery item', 'danger');
    });
}

// Runtime slice from admin.js: previewAdminGalleryImage.
function previewAdminGalleryImage() {
    const imageInput = document.getElementById('galleryImageUpload');
    const preview = document.getElementById('galleryImagePreview');
    const videoPreview = document.getElementById('galleryVideoPreview');
    if (!imageInput || !preview || !videoPreview) return;

    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaType = getGalleryMediaType(e.target.result, file);
            if (mediaType === 'video') {
                preview.src = '';
                preview.classList.add('d-none');
                videoPreview.src = e.target.result;
                videoPreview.classList.remove('d-none');
            } else {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            }
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.classList.add('d-none');
        videoPreview.pause();
        videoPreview.removeAttribute('src');
        videoPreview.load();
        videoPreview.classList.add('d-none');
    }
}

// Runtime slice from admin.js: loadGallery.
function loadGallery() {
    fetch(`${API_URL}?action=getGallery`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('galleryList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No gallery items yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(item => {
            const mediaType = item.media_type || getGalleryMediaType(item.image_url || item.imageData || item.imageUrl || '');
            const mediaUrl = resolveAdminUrl(item.image_url || item.imageData || item.imageUrl || '');
            return `
            <div class="item-card">
                <div style="width: 60px; height: 60px; margin-right: 15px; overflow: hidden; border-radius: 5px; flex-shrink: 0;">
                    ${mediaType === 'video'
                        ? `<video src="${mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" muted></video>`
                        : `<img src="${mediaUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">`}
                </div>
                <div class="item-info flex-grow-1">
                    <h5>${item.title}</h5>
                    <p>${item.description || 'No description'}</p>
                    <small class="text-muted">${mediaType === 'video' ? 'Video' : 'Image'} - ${new Date(item.created_at).toLocaleDateString()}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('galleryList').innerHTML = '<p class="text-danger">Error loading gallery items</p>';
    });
}

// Runtime slice from admin.js: deleteGalleryItem.
function deleteGalleryItem(galleryId) {
    if (!confirm('Delete this gallery item?')) return;
    
    fetch(`${API_URL}?action=deleteGalleryItem`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gallery_id: galleryId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Gallery item deleted!', 'success');
            loadGallery();
            loadGalleryCount();
        } else {
            showNotification('Error deleting gallery item', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting gallery item', 'danger');
    });
}

// Runtime slice from admin.js: loadGalleryCount.
function loadGalleryCount() {
    fetch(`${API_URL}?action=getGallery`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('galleryCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// HADITH FUNCTIONS
// ============================================

// Runtime slice from admin.js: addHadith.
function addHadith() {
    const arabic = document.getElementById('hadithArabic').value.trim();
    const english = document.getElementById('hadithEnglish').value.trim();
    const reference = document.getElementById('hadithReference').value.trim();
    const source = document.getElementById('hadithSource').value.trim();
    const category = document.getElementById('hadithCategory').value.trim();
    const verificationStatus = document.getElementById('hadithVerificationStatus')?.value || 'needs_verification';
    
    if (!arabic || !english) {
        showNotification('Arabic and English texts are required', 'warning');
        return;
    }
    
    const data = {
        arabic: arabic,
        english: english,
        reference: reference,
        source: source,
        category: category,
        verification_status: verificationStatus,
        added_by: currentAdmin.id || 1
    };
    
    fetch(`${API_URL}?action=addHadith`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Hadith added successfully!', 'success');
            document.getElementById('hadithArabic').value = '';
            document.getElementById('hadithEnglish').value = '';
            document.getElementById('hadithReference').value = '';
            document.getElementById('hadithSource').value = '';
            document.getElementById('hadithCategory').value = '';
            if (document.getElementById('hadithVerificationStatus')) document.getElementById('hadithVerificationStatus').value = 'needs_verification';
            loadHadiths();
        } else {
            showNotification('Error adding hadith: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding hadith', 'danger');
    });
}

// Runtime slice from admin.js: suggestAdminHadithArabic.
function suggestAdminHadithArabic() {
    const english = document.getElementById('hadithEnglish')?.value.trim() || '';
    const reference = document.getElementById('hadithReference')?.value.trim() || '';
    const arabicField = document.getElementById('hadithArabic');
    const button = document.getElementById('adminSuggestArabicBtn');
    const status = document.getElementById('adminArabicSuggestionStatus');
    if (!english) {
        showNotification('Enter the English translation first.', 'warning');
        return;
    }
    const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
    if (!workerUrl) {
        showNotification('Arabic suggestion needs the AI Worker configuration.', 'warning');
        return;
    }
    const originalHtml = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suggesting...';
    }
    if (status) status.textContent = 'Generating Arabic suggestion...';
    const endpoint = `${workerUrl.replace(/\/$/, '')}/hadith-arabic`;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, reference })
    };
    const runSuggestionFetch = () => fetch(endpoint, requestOptions);
    const parseSuggestionResponse = response => parseJsonResponse(response);
    runSuggestionFetch()
    .catch(error => {
        if (!/failed to fetch|networkerror|load failed/i.test(error.message || '')) throw error;
        return fetch(`${workerUrl.replace(/\/$/, '')}/health`, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw error;
                return runSuggestionFetch();
            })
            .catch(() => {
                throw error;
            });
    })
    .then(parseSuggestionResponse)
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not suggest Arabic');
        if (arabicField) arabicField.value = result.data?.arabic || '';
        if (status) status.textContent = result.data?.warning || 'Review suggested Arabic before saving.';
        showNotification('Arabic suggestion added. Please review it before saving.', 'success');
    })
    .catch(error => {
        const networkMessage = /failed to fetch|networkerror|load failed/i.test(error.message || '')
            ? 'Arabic suggestion could not connect from this cached page. Refresh this deployed link and try again.'
            : '';
        if (status) status.textContent = networkMessage || 'Arabic suggestion unavailable.';
        showNotification(networkMessage || error.message || 'Could not suggest Arabic', 'danger');
    })
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    });
}

// Runtime slice from admin.js: loadHadiths.
function loadHadiths() {
    fetch(`${API_URL}?action=getHadiths`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('hadithsList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No hadiths added yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(hadith => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <div class="mb-2">${renderHadithVerificationBadge(hadith.verification_status)}</div>
                    <p style="font-size: 16px; margin: 10px 0; direction: rtl; font-weight: bold; color: #333;">
                        <i class="fas fa-quote-left"></i> ${hadith.arabic}
                    </p>
                    <p style="margin: 10px 0;"><strong>English:</strong> ${hadith.english}</p>
                    ${hadith.reference ? `<p style="margin: 5px 0;"><strong>Reference:</strong> ${hadith.reference}</p>` : ''}
                    ${hadith.source ? `<p style="margin: 5px 0;"><strong>Source:</strong> ${hadith.source}</p>` : ''}
                    ${hadith.category ? `<p style="margin: 5px 0;"><strong>Category:</strong> <span class="badge bg-info">${hadith.category}</span></p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-success" title="Mark verified" onclick="verifyHadithItem(${hadith.id}, 'verified')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Needs verification" onclick="verifyHadithItem(${hadith.id}, 'needs_verification')">
                        <i class="fas fa-hourglass-half"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHadithItem(${hadith.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('hadithsList').innerHTML = '<p class="text-danger">Error loading hadiths</p>';
    });
}

// Runtime slice from admin.js: renderHadithVerificationBadge.
function renderHadithVerificationBadge(status) {
    const value = String(status || 'needs_verification');
    const labels = {
        verified: ['Verified', 'success'],
        draft: ['Draft', 'secondary'],
        needs_verification: ['Needs Verification', 'warning']
    };
    const entry = labels[value] || labels.needs_verification;
    return `<span class="badge bg-${entry[1]}">${entry[0]}</span>`;
}

// Runtime slice from admin.js: verifyHadithItem.
function verifyHadithItem(hadithId, status) {
    fetch(`${API_URL}?action=verifyHadith`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hadith_id: Number(hadithId), verification_status: status })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update verification');
        showNotification('Hadith verification updated.', 'success');
        loadHadiths();
    })
    .catch(error => showNotification(error.message || 'Could not update verification', 'danger'));
}

// Runtime slice from admin.js: deleteHadithItem.
function deleteHadithItem(hadithId) {
    if (!confirm('Delete this hadith?')) return;
    
    fetch(`${API_URL}?action=deleteHadith`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hadith_id: hadithId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Hadith deleted!', 'success');
            loadHadiths();
        } else {
            showNotification('Error deleting hadith', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting hadith', 'danger');
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Runtime slice from admin.js: getPriorityColor.
function getPriorityColor(priority) {
    const colors = {
        'high': 'danger',
        'normal': 'primary',
        'low': 'secondary'
    };
    return colors[priority] || 'primary';
}

// Runtime slice from admin.js: showNotification.
function showNotification(message, type) {
    recordAdminNotification(message, type);
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    const alertId = 'alert-' + Date.now();
    
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

// Runtime slice from admin.js: loadWelfareRequests.
function loadWelfareRequests() {
    Promise.all([
        fetch(`${API_URL}?action=getWelfareRequests`).then(response => parseJsonResponse(response)).catch(() => ({ success: false, data: [] })),
        loadAdminStudentRequesters()
    ])
    .then(([result]) => {
        renderWelfareRequests(mergeWelfareRequestsForAdmin(result.data || [], readStore('welfareRequests')));
    });
}

// Runtime slice from admin.js: loadAdminStudentRequesters.
function loadAdminStudentRequesters() {
    return fetch(`${API_URL}?action=getDashboardDetail&type=students`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            const databaseStudents = result.success && Array.isArray(result.data) ? result.data : [];
            const localStudents = readStore('allMembers').filter(member => (member.role || 'student') === 'student');
            adminStudentRequesters = [...databaseStudents.map(student => ({
                id: student.id,
                fullName: [student.first_name, student.last_name].filter(Boolean).join(' '),
                studentId: student.student_id,
                email: student.email,
                phone: student.phone,
                course: student.course,
                yearOfStudy: student.year_of_study
            })), ...localStudents];
            return adminStudentRequesters;
        })
        .catch(() => {
            adminStudentRequesters = readStore('allMembers').filter(member => (member.role || 'student') === 'student');
            return adminStudentRequesters;
        });
}

// Runtime slice from admin.js: mergeWelfareRequestsForAdmin.
function mergeWelfareRequestsForAdmin(databaseRequests, localRequests) {
    const merged = [...localRequests];
    databaseRequests.forEach(request => {
        const index = merged.findIndex(item => Number(item.id) === Number(request.id));
        if (index >= 0) {
            merged[index] = { ...merged[index], ...request };
        } else {
            merged.push(request);
        }
    });
    return merged.map(enrichWelfareRequestFromMembers).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
}

// Runtime slice from admin.js: enrichWelfareRequestFromMembers.
function enrichWelfareRequestFromMembers(request) {
    const members = [...adminStudentRequesters, ...readStore('allMembers')];
    const requesterKey = request.submittedByKey || request.submittedByStudentId || request.student_number || request.student_id || request.email || request.submittedByEmail;
    let requester = members.find(member =>
        member.username === requesterKey ||
        member.studentId === requesterKey ||
        member.email === requesterKey ||
        member.fullName === request.submittedBy ||
        member.name === request.submittedBy ||
        member.email === request.email
    );

    if (!requester && isMissingRequesterInfo(request)) {
        const studentMembers = members.filter(member => (member.role || 'student') === 'student' || member.studentId || member.student_id);
        if (studentMembers.length === 1) {
            requester = studentMembers[0];
        }
    }

    if (!requester) return request;

    return {
        ...request,
        submittedByName: request.submittedByName || requester.fullName || requester.name || requester.username,
        submittedBy: request.submittedBy || requester.fullName || requester.name || requester.username,
        submittedByStudentId: request.submittedByStudentId || request.student_number || requester.studentId || requester.username,
        submittedByEmail: request.submittedByEmail || requester.email,
        submittedByPhone: request.submittedByPhone || requester.phone,
        submittedByCourse: request.submittedByCourse || requester.course,
        submittedByYear: request.submittedByYear || requester.yearOfStudy
    };
}

// Runtime slice from admin.js: isMissingRequesterInfo.
function isMissingRequesterInfo(request) {
    const name = String(request.submittedByName || request.submittedBy || request.name || '').trim().toLowerCase();
    return (!name || name === 'member' || name === 'unknown member') &&
        !request.submittedByEmail &&
        !request.email &&
        !request.submittedByPhone &&
        !request.phone &&
        !request.submittedByStudentId &&
        !request.student_number;
}

// Runtime slice from admin.js: renderWelfareRequests.
function renderWelfareRequests(requests) {
    const container = document.getElementById('welfareRequestsList');
    if (!container) return;

    if (!requests.length) {
        container.innerHTML = '<p class="text-muted">No welfare requests submitted yet.</p>';
        return;
    }

    container.innerHTML = requests.map(enrichWelfareRequestFromMembers).map(req => `
        <div class="item-card">
            <div class="item-info flex-grow-1">
                <h5>${req.type || req.category || 'Welfare Request'}</h5>
                <p>${req.description || ''}</p>
                <p><strong>Amount:</strong> ${formatRequestMoney(req.amount || req.amount_needed)}</p>
                <div class="alert alert-light border mb-2">
                    <h6 class="mb-2"><i class="fas fa-user-circle"></i> Requester Information</h6>
                    <p class="mb-1"><strong>Name:</strong> ${getWelfareRequesterName(req)}</p>
                    <p class="mb-1"><strong>Student ID:</strong> ${req.submittedByStudentId || req.student_number || 'N/A'}</p>
                    <p class="mb-1"><strong>Email:</strong> ${req.submittedByEmail || req.email || 'N/A'}</p>
                    <p class="mb-1"><strong>Phone:</strong> ${req.submittedByPhone || req.phone || 'N/A'}</p>
                    <p class="mb-0"><strong>Course/Year:</strong> ${[req.submittedByCourse || req.course, req.submittedByYear || req.year_of_study].filter(Boolean).join(' / ') || 'N/A'}</p>
                </div>
                ${renderRequesterAttachControl(req)}
                <span class="badge bg-${getWelfareColor(req.status)}"><i class="fas ${getWelfareStatusIcon(req.status)} me-1"></i>${formatWelfareStatus(req.status)}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-success" onclick="updateWelfareStatus(${req.id}, 'Approved')"><i class="fas fa-circle-check"></i> Approve</button>
                <button class="btn btn-sm btn-outline-danger" onclick="updateWelfareStatus(${req.id}, 'Rejected')"><i class="fas fa-circle-xmark"></i> Reject</button>
            </div>
        </div>
    `).join('');
}

// Runtime slice from admin.js: renderRequesterAttachControl.
function renderRequesterAttachControl(req) {
    if (!isMissingRequesterInfo(req)) return '';
    if (!adminStudentRequesters.length) {
        return '<div class="alert alert-warning py-2"><i class="fas fa-triangle-exclamation"></i> This old request has no saved requester details. Register/login records are needed before it can be linked.</div>';
    }

    const options = adminStudentRequesters.map((student, index) => {
        const label = `${student.fullName || student.name || student.username || 'Student'}${student.studentId ? ' - ' + student.studentId : ''}`;
        return `<option value="${index}">${label}</option>`;
    }).join('');

    return `
        <div class="alert alert-warning py-2">
            <label class="form-label mb-1"><i class="fas fa-link"></i> Link this old request to a requester before deciding</label>
            <div class="d-flex gap-2 flex-wrap">
                <select class="form-control form-control-sm" id="requesterLink${req.id}" style="max-width: 320px;">
                    <option value="">Select registered student</option>
                    ${options}
                </select>
                <button class="btn btn-sm btn-primary" onclick="attachRequesterToWelfare(${req.id})"><i class="fas fa-user-check"></i> Attach requester</button>
            </div>
        </div>
    `;
}

// Runtime slice from admin.js: attachRequesterToWelfare.
function attachRequesterToWelfare(requestId) {
    const select = document.getElementById('requesterLink' + requestId);
    const requester = adminStudentRequesters[Number(select?.value)];
    if (!requester) {
        showNotification('Please select a registered student first.', 'warning');
        return;
    }

    const requests = readStore('welfareRequests').map(request => Number(request.id) === Number(requestId)
        ? {
            ...request,
            submittedByName: requester.fullName || requester.name || requester.username,
            submittedBy: requester.fullName || requester.name || requester.username,
            submittedByStudentId: requester.studentId || requester.student_id || requester.username,
            submittedByEmail: requester.email || '',
            submittedByPhone: requester.phone || '',
            submittedByCourse: requester.course || '',
            submittedByYear: requester.yearOfStudy || requester.year_of_study || '',
            submittedByKey: requester.username || requester.studentId || requester.student_id || requester.email || ''
        }
        : request
    );
    writeStore('welfareRequests', requests);
    showNotification('Requester attached to welfare request.', 'success');
    loadWelfareRequests();
}

// Runtime slice from admin.js: getWelfareRequesterName.
function getWelfareRequesterName(req) {
    return req.submittedByName ||
        req.submittedBy ||
        req.name ||
        [req.first_name, req.last_name].filter(Boolean).join(' ') ||
        'Unknown member';
}

// Runtime slice from admin.js: updateWelfareStatus.
function updateWelfareStatus(requestId, status) {
    const applyLocalWelfareStatus = () => {
        let matchedRequest = null;
        const requests = readStore('welfareRequests').map(item =>
            Number(item.id) === Number(requestId) ? (matchedRequest = item, { ...item, status: status, statusUpdatedAt: new Date().toISOString() }) : item
        );
        writeStore('welfareRequests', requests);
        if (matchedRequest?.supabaseId && window.SupabaseBackend?.enabled) {
            window.SupabaseBackend.updateRecord('welfareRequests', matchedRequest.supabaseId, {
                status: status,
                statusUpdatedAt: new Date().toISOString()
            }).catch(error => {
                console.error('Supabase welfare status update failed:', error);
            });
        }
    };

    fetch(`${API_URL}?action=updateWelfareStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status: status, notes: '' })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update request');
        applyLocalWelfareStatus();
        showNotification(`Welfare request ${status.toLowerCase()}.`, 'success');
        loadWelfareRequests();
    })
    .catch(error => {
        applyLocalWelfareStatus();
        showNotification(error.message ? 'Saved status locally because database is unavailable.' : `Welfare request ${status.toLowerCase()}.`, 'warning');
        loadWelfareRequests();
    });
}

// Runtime slice from admin.js: getWelfareColor.
function getWelfareColor(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'success';
    if (normalized === 'rejected') return 'danger';
    return 'warning text-dark';
}

// Runtime slice from admin.js: getWelfareStatusIcon.
function getWelfareStatusIcon(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'fa-circle-check';
    if (normalized === 'rejected') return 'fa-circle-xmark';
    return 'fa-clock';
}

// Runtime slice from admin.js: formatWelfareStatus.
function formatWelfareStatus(status) {
    const normalized = String(status || 'Pending Review').toLowerCase();
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'completed') return 'Completed';
    return 'Pending Review';
}

// Runtime slice from admin.js: loadPrayerAdmin.
function loadPrayerAdmin() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('prayerDate').value = today;
    renderReligiousActivitiesAdmin();
    fetch(`${API_URL}?action=getPrayerTimes&date=${today}`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const data = result.data || {};
        document.getElementById('prayerFajr').value = (data.fajr || '').slice(0, 5);
        document.getElementById('prayerDhuhr').value = (data.dhuhr || '').slice(0, 5);
        document.getElementById('prayerAsr').value = (data.asr || '').slice(0, 5);
        document.getElementById('prayerMaghrib').value = (data.maghrib || '').slice(0, 5);
        document.getElementById('prayerIsha').value = (data.isha || '').slice(0, 5);
        document.getElementById('prayerJummah').value = (data.jummah_time || '').slice(0, 5);
        renderPrayerPreview(data);
    });
}

// Runtime slice from admin.js: savePrayerTimes.
function savePrayerTimes() {
    const previousPrayerTimes = JSON.parse(localStorage.getItem('adminPrayerTimes') || 'null');
    const data = {
        date: document.getElementById('prayerDate').value || new Date().toISOString().slice(0, 10),
        fajr: document.getElementById('prayerFajr').value,
        dhuhr: document.getElementById('prayerDhuhr').value,
        asr: document.getElementById('prayerAsr').value,
        maghrib: document.getElementById('prayerMaghrib').value,
        isha: document.getElementById('prayerIsha').value,
        jummah_time: document.getElementById('prayerJummah').value,
        _previous_prayer_times: previousPrayerTimes
    };
    fetch(`${API_URL}?action=setPrayerTimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save prayer times');
        showNotification('Prayer timetable saved.', 'success');
        renderPrayerPreview(data);
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: renderPrayerPreview.
function renderPrayerPreview(data) {
    document.getElementById('prayerPreview').innerHTML = `
        <div class="row">
            ${['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah_time'].map(key => `
                <div class="col-md-4 mb-2"><strong>${key.replace('_time', '').toUpperCase()}:</strong> ${data[key] || 'Not set'}</div>
            `).join('')}
        </div>
    `;
}

// Runtime slice from admin.js: getReligiousActivities.
function getReligiousActivities() {
    return JSON.parse(localStorage.getItem('adminReligiousActivities')) || {
        jummah: [],
        ramadan: [],
        lectures: []
    };
}

// Runtime slice from admin.js: saveReligiousActivities.
function saveReligiousActivities(data) {
    localStorage.setItem('adminReligiousActivities', JSON.stringify(data));
}

// Runtime slice from admin.js: saveReligiousActivity.
function saveReligiousActivity(type) {
    const data = getReligiousActivities();
    let item = null;
    const editId = editingReligiousActivity?.type === type ? editingReligiousActivity.id : null;
    const key = type === 'lecture' ? 'lectures' : type;
    const previousItem = editId ? (data[key] || []).find(existing => Number(existing.id) === Number(editId)) : null;

    if (type === 'jummah') {
        const date = document.getElementById('jummahDate').value;
        const time = document.getElementById('jummahTime').value;
        const topic = document.getElementById('jummahTopic').value.trim();
        const speaker = document.getElementById('jummahSpeaker').value.trim();
        const note = document.getElementById('jummahNote').value.trim();
        if (!date || !time || !topic) {
            showNotification('Date, time, and khutbah topic are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), date, time, topic, speaker, note };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['jummahDate', 'jummahTime', 'jummahTopic', 'jummahSpeaker', 'jummahNote'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.jummah = upsertReligiousActivity(data.jummah, item, editId);
        ['jummahDate', 'jummahTime', 'jummahTopic', 'jummahSpeaker', 'jummahNote'].forEach(id => document.getElementById(id).value = '');
    }

    if (type === 'ramadan') {
        const eventName = document.getElementById('ramadanEvent').value.trim();
        const date = document.getElementById('ramadanDate').value.trim();
        const time = document.getElementById('ramadanTime').value.trim();
        const note = document.getElementById('ramadanNote').value.trim();
        if (!eventName || !date) {
            showNotification('Ramadan event and date are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), event: eventName, date, time, note };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['ramadanEvent', 'ramadanDate', 'ramadanTime', 'ramadanNote'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.ramadan = upsertReligiousActivity(data.ramadan, item, editId);
        ['ramadanEvent', 'ramadanDate', 'ramadanTime', 'ramadanNote'].forEach(id => document.getElementById(id).value = '');
    }

    if (type === 'lecture') {
        const title = document.getElementById('lectureTitle').value.trim();
        const schedule = document.getElementById('lectureSchedule').value.trim();
        const speaker = document.getElementById('lectureSpeaker').value.trim();
        const description = document.getElementById('lectureDescription').value.trim();
        if (!title || !schedule) {
            showNotification('Lecture title and schedule are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), title, schedule, speaker, description };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['lectureTitle', 'lectureSchedule', 'lectureSpeaker', 'lectureDescription'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.lectures = upsertReligiousActivity(data.lectures, item, editId);
        ['lectureTitle', 'lectureSchedule', 'lectureSpeaker', 'lectureDescription'].forEach(id => document.getElementById(id).value = '');
    }

    saveReligiousActivities(data);
    logLocalAdminActivity('saveReligiousActivity', {
        type,
        item,
        previous_item: previousItem || null,
        mode: editId ? 'update' : 'create'
    });
    editingReligiousActivity = null;
    resetReligiousActivityButtons();
    renderReligiousActivitiesAdmin();
    showNotification(editId ? 'Religious activity updated for users.' : 'Religious activity saved for users.', 'success');
}

// Runtime slice from admin.js: queueLocalReligiousApproval.
function queueLocalReligiousApproval(type, item, previousItem, editId) {
    logLocalAdminActivity('pendingAdminApproval', {
        requested_action: 'saveReligiousActivity',
        method: 'POST',
        request: {
            type,
            item,
            previous_item: previousItem || null,
            mode: editId ? 'update' : 'create'
        }
    });
    editingReligiousActivity = null;
    resetReligiousActivityButtons();
    showNotification('Sent to main admin for approval.', 'info');
}

// Runtime slice from admin.js: applyReligiousActivityRequest.
function applyReligiousActivityRequest(request) {
    if (!request || !request.type || !request.item) return;
    
    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return;
    
    data[key] = upsertReligiousActivity(data[key] || [], request.item, request.item.id);
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}

/**
 * Exports all religious activities to CSV within a date range.
 */
function exportReligiousActivitiesCSV(startDate, endDate) {
    const data = getReligiousActivities();
    let allRecords = [];
    
    ['jummah', 'ramadan', 'lectures'].forEach(key => {
        if (data[key]) {
            allRecords = allRecords.concat(data[key].map(item => ({
                ...item,
                category: key,
                date_reference: item.activity_date || item.created_at
            })));
        }
    });

    if (typeof filterDataByRange === 'function') {
        allRecords = filterDataByRange(allRecords, startDate, endDate, 'date_reference');
    }

    exportToCSV(allRecords, `daawah_activities_${startDate || 'all'}_to_${endDate || 'now'}.csv`);
}

// Runtime slice from admin.js: applyReligiousDeleteRequest.
function applyReligiousDeleteRequest(request) {
    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return;
    data[key] = (data[key] || []).filter(item => Number(item.id) !== Number(request.item_id));
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}

// Runtime slice from admin.js: upsertReligiousActivity.
function upsertReligiousActivity(items, item, editId) {
    if (!editId) return [...items, item];
    return items.map(existing => Number(existing.id) === Number(editId) ? item : existing);
}

// Runtime slice from admin.js: editReligiousActivity.
function editReligiousActivity(type, id) {
    const data = getReligiousActivities();
    const key = type === 'lecture' ? 'lectures' : type;
    const item = (data[key] || []).find(entry => Number(entry.id) === Number(id));
    if (!item) return;

    editingReligiousActivity = { type, id };

    if (type === 'jummah') {
        document.getElementById('jummahDate').value = item.date || '';
        document.getElementById('jummahTime').value = item.time || '';
        document.getElementById('jummahTopic').value = item.topic || '';
        document.getElementById('jummahSpeaker').value = item.speaker || '';
        document.getElementById('jummahNote').value = item.note || '';
        document.getElementById('jummahSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Jumu\'ah Reminder';
    }

    if (type === 'ramadan') {
        document.getElementById('ramadanEvent').value = item.event || '';
        document.getElementById('ramadanDate').value = item.date || '';
        document.getElementById('ramadanTime').value = item.time || '';
        document.getElementById('ramadanNote').value = item.note || '';
        document.getElementById('ramadanSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Ramadan Item';
    }

    if (type === 'lecture') {
        document.getElementById('lectureTitle').value = item.title || '';
        document.getElementById('lectureSchedule').value = item.schedule || '';
        document.getElementById('lectureSpeaker').value = item.speaker || '';
        document.getElementById('lectureDescription').value = item.description || '';
        document.getElementById('lectureSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Lecture';
    }
}

// Runtime slice from admin.js: resetReligiousActivityButtons.
function resetReligiousActivityButtons() {
    const jummahBtn = document.getElementById('jummahSaveBtn');
    const ramadanBtn = document.getElementById('ramadanSaveBtn');
    const lectureBtn = document.getElementById('lectureSaveBtn');
    if (jummahBtn) jummahBtn.innerHTML = '<i class="fas fa-save"></i> Add Jumu\'ah Reminder';
    if (ramadanBtn) ramadanBtn.innerHTML = '<i class="fas fa-save"></i> Add Ramadan Item';
    if (lectureBtn) lectureBtn.innerHTML = '<i class="fas fa-save"></i> Add Lecture';
}

// Runtime slice from admin.js: deleteReligiousActivity.
function deleteReligiousActivity(type, id) {
    const data = getReligiousActivities();
    const key = type === 'lecture' ? 'lectures' : type;
    const previousItem = (data[key] || []).find(item => Number(item.id) === Number(id));
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        logLocalAdminActivity('pendingAdminApproval', {
            requested_action: 'deleteReligiousActivity',
            method: 'DELETE',
            request: {
                type,
                item_id: id,
                previous_item: previousItem || null
            }
        });
        showNotification('Sent to main admin for approval.', 'info');
        return;
    }
    data[key] = (data[key] || []).filter(item => Number(item.id) !== Number(id));
    saveReligiousActivities(data);
    logLocalAdminActivity('deleteReligiousActivity', {
        type,
        item_id: id,
        previous_item: previousItem || null
    });
    renderReligiousActivitiesAdmin();
    showNotification('Religious activity removed.', 'success');
}

// Runtime slice from admin.js: renderReligiousActivitiesAdmin.
function renderReligiousActivitiesAdmin() {
    const container = document.getElementById('religiousActivitiesList');
    if (!container) return;

    const data = getReligiousActivities();
    const jummahRows = data.jummah.map(item => `
        <tr>
            <td>Jumu'ah</td>
            <td>${item.date}</td>
            <td>${item.time || '-'}</td>
            <td>${item.topic}</td>
            <td>${item.speaker || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('jummah', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('jummah', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const ramadanRows = data.ramadan.map(item => `
        <tr>
            <td>Ramadan</td>
            <td>${item.date}</td>
            <td>${item.time || '-'}</td>
            <td>${item.event}</td>
            <td>${item.note || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('ramadan', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('ramadan', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const lectureRows = data.lectures.map(item => `
        <tr>
            <td>Lecture</td>
            <td>${item.schedule}</td>
            <td>-</td>
            <td>${item.title}</td>
            <td>${item.speaker || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('lecture', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('lecture', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const rows = jummahRows + ramadanRows + lectureRows;

    container.innerHTML = rows ? `
        <div class="table-responsive">
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date/Schedule</th>
                        <th>Time</th>
                        <th>Title/Event</th>
                        <th>Speaker/Note</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    ` : '<p class="text-muted">No religious activities have been added yet.</p>';
}

// Runtime slice from admin.js: addResource.
function addResource() {
    const title = document.getElementById('resourceTitle').value.trim();
    const resourceType = document.getElementById('resourceType').value;
    const resourceFile = document.getElementById('resourceFile').files[0];
    const resourceUrl = document.getElementById('resourceUrl').value.trim();

    if (!title || !resourceType) {
        showNotification('Title and type are required.', 'warning');
        return;
    }
    if (!resourceFile && !resourceUrl) {
        showNotification('Please upload a file or enter a URL.', 'warning');
        return;
    }

    const data = new FormData();
    data.append('title', title);
    data.append('description', document.getElementById('resourceDescription').value.trim());
    data.append('resource_type', resourceType);
    data.append('category', document.getElementById('resourceCategory').value.trim());
    data.append('url', resourceUrl);
    if (resourceFile) {
        data.append('resource_file', resourceFile);
    }

    fetch(`${API_URL}?action=addResource`, {
        method: 'POST',
        body: data
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not add resource');
        ['resourceTitle', 'resourceDescription', 'resourceCategory', 'resourceUrl'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('resourceFile').value = '';
        showNotification('Resource added.', 'success');
        loadResourcesAdmin();
    })
    .catch(error => showNotification(error.message, 'danger'));
}

// Runtime slice from admin.js: loadResourcesAdmin.
function loadResourcesAdmin() {
    fetch(`${API_URL}?action=getResources`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('resourcesList');
        const resources = result.data || [];
        if (!resources.length) {
            container.innerHTML = '<p class="text-muted">No resources added yet.</p>';
            return;
        }
        container.innerHTML = resources.map(res => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <h5>${res.title}</h5>
                    <p>${res.description || ''}</p>
                    <small>${res.resource_type || res.type || 'resource'} ${res.category ? '- ' + res.category : ''}</small>
                </div>
                <div class="item-actions">
                    ${res.url || res.file_path ? `<a class="btn btn-sm btn-outline-primary" href="${resolveAdminUrl(res.url || res.file_path)}" target="_blank">Open</a>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteResource(${res.id})">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

// Runtime slice from admin.js: deleteResource.
function deleteResource(resourceId) {
    fetch(`${API_URL}?action=deleteResource`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete resource');
        showNotification('Resource deleted.', 'success');
        loadResourcesAdmin();
    })
    .catch(error => showNotification(error.message, 'danger'));
}
