// Runtime slice from daawah.js: bootstrap.
// UMMA University Da'awah Team - Complete JavaScript Implementation

// Global Variables
let currentUser = null;
let currentRole = null;
let registeredEvents = [];
let welfareRequests = [];
let donations = [];
let payments = [];
let leadershipRoles = [];
let allMembers = [];
let allEvents = [];
let databaseActivities = [];
let databaseVolunteerOpportunities = [];
let databaseVolunteerRecords = [];
let loginFailedAttempts = 0;
let loginLockedUntil = 0;
let hostingCapabilities = null;
let resetPasswordEmail = '';
const LOCAL_RESET_CODE_STORE = 'dawaahPasswordResetCodes';
const LOCAL_RESET_CODE_TTL_MS = 15 * 60 * 1000;
let researchRecorder = null;
let researchAudioStream = null;
let researchAudioChunks = [];
let latestResearchItem = null;
let deferredInstallPrompt = window.__dawaahDeferredInstallPrompt || null;
let pendingInstallClick = Boolean(window.__dawaahPendingInstallClick);
let activitiesLoadedAt = 0;
let roleDashboardRefreshTimer = null;
let roleDashboardRefreshRunning = false;
let roleRealtimeUnsubscribers = [];
const ROLE_DASHBOARD_REFRESH_MS = 1000;
const PORTAL_AUDIENCE_KEY = 'dawaahPortalAudience';
const ADMIN_PORTAL_CLOSED_KEY = 'dawaahAdminPortalClosed';
const LIVE_PUBLIC_STORE_KEYS = [
    'adminAnnouncements',
    'adminEvents',
    'adminPrayerTimes',
    'adminResources',
    'adminHadiths',
    'adminReligiousActivities',
    'volunteerOpportunities',
    'publicLeaders',
    'galleryItems',
    'siteSettings'
];
const uploadLimits = {
    profilePhoto: { bytes: 2 * 1024 * 1024, label: '2MB', types: ['image/'] },
    financeProof: { bytes: 3 * 1024 * 1024, label: '3MB', types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
    galleryImage: { bytes: 5 * 1024 * 1024, label: '5MB', types: ['image/'] },
    galleryVideo: { bytes: 50 * 1024 * 1024, label: '50MB', types: ['video/mp4', 'video/webm', 'video/ogg'] },
    voice: { bytes: 10 * 1024 * 1024, label: '10MB', types: ['audio/', 'video/webm'] }
};
const paymentAccounts = {
    mpesaStk: {
        label: 'M-Pesa STK Push',
        html: '<strong>M-Pesa STK Push:</strong><br>Enter your M-Pesa phone number, then check your phone for the Safaricom PIN prompt. Receipt is generated only after M-Pesa confirms success.'
    },
    bankTransfer: {
        label: 'Bank Transfer',
        html: "<strong>Bank Transfer:</strong><br>Official bank details have not been configured yet. Please contact the Treasurer or main admin before making a transfer."
    },
    numberTransfer: {
        label: 'Normal Transfer Number',
        html: "<strong>Normal Transfer:</strong><br>Official transfer number has not been configured yet. Please contact the Treasurer or main admin before making a transfer."
    },
    cash: {
        label: 'Cash Payment',
        html: "<strong>Cash Payment:</strong><br>Pay physically to the UMMA University Da'awah Team Treasurer and collect/keep your receipt."
    }
};

const schoolCourseCatalog = {
    'School of Business & Technology': {
        'Undergraduate Courses': [
            'Bachelor of Business Management (BBM)',
            'Bachelor of Commerce (BCom)',
            'Bachelor of Business Information Technology',
            'Bachelor of Science in Computer Science',
            'Bachelor of Science in Information Technology'
        ],
        'Masters Courses': ['Master of Business Administration (MBA)'],
        'Diploma Courses': [
            'Diploma in ICT',
            'Diploma in Business Management',
            'Diploma in Business IT & Business Management',
            'Diploma in Human Resource Management',
            'Diploma in Supply Chain Management',
            'Diploma in Islamic Banking and Finance'
        ],
        'Certificate Courses': [
            'Certificate in ICT',
            'Certificate in Business Management',
            'Certificate in Human Resource Management',
            'Certificate in Supply Chain Management',
            'Certificate in Business Information Technology'
        ],
        'TVET & Short Courses': ['Electrical Engineering', 'ICT', 'CISCO Networking', 'ICDL Courses']
    },
    'School of Sharia & Islamic Studies': {
        'Undergraduate Courses': ['Bachelor of Arts in Islamic Studies', 'Bachelor of Arts in Sharia'],
        'Masters Courses': ['Master of Arts in Islamic Studies'],
        'Diploma Courses': ['Diploma in Arabic Language and Islamic Studies', 'Diploma in Islamic Banking and Finance'],
        'Certificate Courses': ['Certificate in Arabic Language and Islamic Studies']
    },
    'School of Law and Shari’a': {
        'Undergraduate Courses': ['Bachelor of Laws (LL.B) with Sharia & Law'],
        'Diploma Courses': ['Diploma in Islamic Law and Legal Studies']
    },
    'School of Education & Social Sciences': {
        'Undergraduate Courses': ['Bachelor of Education (B.Ed.)', 'Bachelor of Education (Arts)'],
        'Diploma Courses': ['Diploma in Early Childhood Education'],
        'TVET & Short Courses': ['Clothing & Textile', 'Business & Liberal Studies']
    },
    'School of Nursing & Midwifery': {
        'Undergraduate Courses': ['Bachelor of Science in Nursing']
    }
};
const schoolOptions = Object.keys(schoolCourseCatalog);
const yearOptions = ['1', '2', '3', '4', '5', '6'];
const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const localStudentClearVersion = '2026-05-17-clear-student-accounts';
const defaultActivities = [];
const defaultVolunteerOpportunities = [];

const LEGACY_PHP_BASE_URL = String(window.DAWAAH_LEGACY_PHP_BASE_URL || '').replace(/\/?$/, '/');
const useLegacyPhpApi = Boolean(LEGACY_PHP_BASE_URL);
const STATIC_FRONTEND_HOSTS = [
    'localhost',
    '127.0.0.1',
    'github.io',
    'umma-university-da-awah-team.web.app',
    'umma-university-da-awah-team.firebaseapp.com',
    '66ghz.com',
    'www.66ghz.com'
];
const frontendOnly = STATIC_FRONTEND_HOSTS.some(host =>
    location.hostname === host || location.hostname.endsWith(`.${host}`)
);
let cloudStoresReadyPromise = Promise.resolve();
const realAppFetch = window.fetch.bind(window);
const ACCOUNT_CLEAR_VERSION = '20260526-firebase-reset-v1';
let contactVoiceRecorder = null;
let contactVoiceStream = null;
let contactVoiceChunks = [];
let contactVoiceBlob = null;
