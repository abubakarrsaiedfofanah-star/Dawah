// Runtime slice from officer.js: bootstrap.
const OFFICER_ROLES = ['chairlady', 'vice_chairlady_1', 'vice_chairlady_2', 'secretary', 'vice_secretary', 'treasurer', 'vice_treasurer', 'media', 'organizer', 'amir_director'];
const OFFICER_STATIC_HOSTS = [
    'localhost',
    '127.0.0.1',
    'github.io',
    'netlify.app',
    'vercel.app',
    'pages.dev',
    '66ghz.com',
    'www.66ghz.com'
];
const frontendOnly = location.protocol === 'file:' || OFFICER_STATIC_HOSTS.some(host =>
    location.hostname === host || location.hostname.endsWith(`.${host}`)
);
const blockStaticOfficerAccess = location.protocol === 'file:' || location.hostname === 'github.io' || location.hostname.endsWith('.github.io');
let officerCloudReadyPromise = Promise.resolve();
let officerResetEmail = '';
const OFFICER_RESET_CODE_STORE = 'dawaahPasswordResetCodes';
const OFFICER_RESET_CODE_TTL_MS = 15 * 60 * 1000;
const PORTAL_AUDIENCE_KEY = 'dawaahPortalAudience';
const OFFICER_LOCAL_API_BASES = ['http://localhost/dawaah/', 'http://127.0.0.1:8000/'];
const FULL_LOCAL_STORAGE_RESET_VERSION = '20260708-full-local-reset-v4';
const ACCOUNT_CLEAR_VERSION = '20260708-supabase-local-cache-reset-v4';
