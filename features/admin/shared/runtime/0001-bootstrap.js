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
    'umma-university-da-awah-team.web.app',
    'umma-university-da-awah-team.Supabaseapp.com',
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
