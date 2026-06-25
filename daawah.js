// Assembled from feature runtime files. Edit features/**/runtime/*.js, then run npm run runtime:assemble.
// Runtime slice from daawah.js: bootstrap.
// UMMA University Dawah Team - Complete JavaScript Implementation

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
const APP_VERSION = '2026.06.04.4';
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
        html: "<strong>Cash Payment:</strong><br>Pay physically to the UMMA University Dawah Team Treasurer and collect/keep your receipt."
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
    'School of Law and Shariâ€™a': {
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
    'netlify.app',
    'vercel.app',
    'pages.dev',
    '66ghz.com',
    'www.66ghz.com'
];
const frontendOnly = STATIC_FRONTEND_HOSTS.some(host =>
    location.hostname === host || location.hostname.endsWith(`.${host}`)
);
let cloudStoresReadyPromise = Promise.resolve();
const realAppFetch = window.fetch.bind(window);
const ACCOUNT_CLEAR_VERSION = '20260526-supabase-reset-v1';
let contactVoiceRecorder = null;
let contactVoiceStream = null;
let contactVoiceChunks = [];
let contactVoiceBlob = null;

// Runtime slice from daawah.js: clearStoredAccountsOnce.
function clearStoredAccountsOnce() {
    if (localStorage.getItem('DawaahAccountClearVersion') === ACCOUNT_CLEAR_VERSION) return;
    const savedUser = getStoredCurrentUser();
    const savedRole = localStorage.getItem('currentRole');
    const shouldKeepServerSession = savedUser && (savedUser.csrf_token || savedUser.dbUserId || savedUser.dbStudentId);
    [
        'currentUser',
        'currentRole',
        'allMembers',
        'profileData',
        'registeredEvents',
        'welfareRequests',
        'donations',
        'payments',
        'leadershipRoles',
        'volunteerRecords'
    ].forEach(key => localStorage.removeItem(key));
    ['dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid'].forEach(key => sessionStorage.removeItem(key));
    if (shouldKeepServerSession) {
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        if (savedRole || savedUser.role) localStorage.setItem('currentRole', savedRole || savedUser.role);
    }
    localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
}

// Runtime slice from daawah.js: initializeAiChatWidget.
function initializeAiChatWidget() {
    if (window.__aiChatWidgetSharedLoaded) {
        return;
    }
    const widget = document.getElementById('aiChatWidget');
    const toggle = document.getElementById('aiChatToggle');
    const close = document.getElementById('aiChatClose');
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    const messages = document.getElementById('aiChatMessages');
    const sendButton = document.getElementById('aiChatSend');

    if (!widget || !toggle || !close || !form || !input || !messages || !sendButton) {
        return;
    }

    const setOpen = isOpen => {
        widget.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            setTimeout(() => input.focus(), 60);
        }
    };

    const addMessage = (text, type = 'bot') => {
        const message = document.createElement('div');
        message.className = `ai-chat-message ai-chat-message--${type}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    };

    toggle.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));

    form.addEventListener('submit', event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) {
            return;
        }

        addMessage(question, 'user');
        input.value = '';
        input.style.height = '';
        sendButton.disabled = true;
        const waitingMessage = addMessage('Thinking...', 'bot');

        const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
        const endpoint = workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : 'chat_supabase-required-endpoint';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question, mode: 'groq_chat', context: 'student dashboard' })
        })
        .then(response => response.json().catch(() => {
            throw new Error('The server returned an unreadable response.');
        }))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'The research AI could not answer right now.');
            }
            waitingMessage.textContent = result.data?.answer || 'No answer was returned.';
        })
        .catch(error => {
            waitingMessage.textContent = error.message || 'The research AI could not answer right now.';
            waitingMessage.classList.add('ai-chat-message--error');
        })
        .finally(() => {
            sendButton.disabled = false;
            input.focus();
        });
    });

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });

    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
}

// The shared ai_assistant_widget.js owns the Research AI widget.

clearStoredAccountsOnce();

window.fetch = function(resource, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const isLocalPhpApi = typeof resource === 'string' && /^(api|admin_api|daawah|dawaah|mpesa_api)\.php/.test(resource);
    const isUnsafePhpRequest = isLocalPhpApi && ['POST', 'PUT', 'DELETE'].includes(method);
    if (isUnsafePhpRequest) options = attachUserCsrfHeader(options);
    if (isLocalPhpApi && !options.credentials) {
        options = { ...options, credentials: 'same-origin' };
    }
    const requestUrl = useLegacyPhpApi && isLocalPhpApi ? LEGACY_PHP_BASE_URL + resource : resource;

    const runRequest = requestOptions => realAppFetch(requestUrl, requestOptions);
    if (isUnsafePhpRequest) {
        return runRequest(options).then(response => {
            const copy = response.clone();
            return copy.text()
                .then(text => {
                    let result = null;
                    try {
                        result = JSON.parse(text);
                    } catch (error) {
                        return response;
                    }
                    if (!result || result.success !== false || !/security token expired/i.test(result.message || '')) {
                        return response;
                    }
                    return refreshUserSessionToken()
                        .then(() => runRequest(attachUserCsrfHeader(options)))
                        .catch(() => response);
                })
                .catch(() => response);
        });
    }
    if (useLegacyPhpApi && isLocalPhpApi) {
        return realAppFetch(requestUrl, options);
    }
    return realAppFetch(requestUrl, options);
};

// Runtime slice from daawah.js: getTreasurerWhatsappUrl.
function getTreasurerWhatsappUrl(message = '') {
    const settings = readStoredObject('siteSettings', {});
    const configured = settings.social_whatsapp || settings.contact_whatsapp || 'https://api.whatsapp.com/send?phone=23231422167';
    const base = String(configured).startsWith('http')
        ? configured.split('?')[0]
        : `https://wa.me/${String(configured).replace(/\D/g, '')}`;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}text=${encodeURIComponent(message)}`;
}

// Runtime slice from daawah.js: getStoredCurrentUser.
function getStoredCurrentUser() {
    return safeJsonParse(localStorage.getItem('currentUser'), null, 'currentUser');
}

// Runtime slice from daawah.js: getUserCsrfToken.
function getUserCsrfToken() {
    return currentUser?.csrf_token || getStoredCurrentUser()?.csrf_token || '';
}

// Runtime slice from daawah.js: attachUserCsrfHeader.
function attachUserCsrfHeader(options = {}) {
    const token = getUserCsrfToken();
    if (!token) return options;
    const headers = new Headers(options.headers || {});
    if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', token);
    return { ...options, headers };
}

// Runtime slice from daawah.js: refreshUserSessionToken.
function refreshUserSessionToken() {
    if (frontendOnly) return Promise.reject(new Error('No backend session available.'));
    return realAppFetch('supabase-required-endpoint?action=getSession', { credentials: 'same-origin', cache: 'no-store' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.csrf_token) {
                throw new Error(result.message || 'Session expired. Please login again.');
            }
            currentUser = { ...(currentUser || getStoredCurrentUser() || {}), ...result.data };
            currentRole = currentUser.role || currentRole;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (currentRole) localStorage.setItem('currentRole', currentRole);
            return currentUser.csrf_token;
        });
}

// Runtime slice from daawah.js: isHostingSecurityChallenge.
function isHostingSecurityChallenge(text) {
    return /src=["']\/aes\.js["']/i.test(text) && /document\.cookie=["']__test=/i.test(text);
}

// Runtime slice from daawah.js: parseJsonResponse.
function parseJsonResponse(response) {
    if (response && typeof response.text === 'function') {
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (error) {
                if (isHostingSecurityChallenge(text)) {
                    throw new Error('The free hosting security check interrupted this request. Please refresh the website once, wait for it to finish loading, then try registration again.');
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

// Runtime slice from daawah.js: safeJsonParse.
function safeJsonParse(rawValue, fallback = null, label = 'stored value') {
    if (rawValue === null || rawValue === undefined || rawValue === '') return fallback;
    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.error(`Could not parse ${label}; using fallback.`, error);
        return fallback;
    }
}

// Runtime slice from daawah.js: readStoredObject.
function readStoredObject(key, fallback = {}) {
    const value = safeJsonParse(localStorage.getItem(key), fallback, key);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

// Runtime slice from daawah.js: readList.
function readList(key) {
    const value = safeJsonParse(localStorage.getItem(key), [], key);
    return Array.isArray(value) ? value : [];
}

// Runtime slice from daawah.js: normalizeContactEmail.
function normalizeContactEmail(email) {
    return String(email || '').trim() === 'info@dawah.org' ? 'info@dawah.org' : email;
}

// Runtime slice from daawah.js: getLocalSiteSettings.
function getLocalSiteSettings() {
    const savedSettings = readStoredObject('siteSettings', {});
    const settings = {
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
        ...savedSettings
    };
    settings.contact_email = normalizeContactEmail(settings.contact_email);
    return settings;
}

// Runtime slice from daawah.js: writeLocalSiteSettings.
function writeLocalSiteSettings(settings) {
    localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...(settings || {}) }));
}

// Runtime slice from daawah.js: rememberPortalAudience.
function rememberPortalAudience(audience) {
    if (!audience) return;
    localStorage.setItem(PORTAL_AUDIENCE_KEY, audience);
    applyPortalAccessRules();
}

// Runtime slice from daawah.js: isAdminPortalClosed.
function isAdminPortalClosed() {
    const settings = readStoredObject('siteSettings', {});
    return localStorage.getItem(ADMIN_PORTAL_CLOSED_KEY) === '1' ||
        settings.admin_portal_closed === true ||
        String(settings.admin_portal_closed || '').toLowerCase() === 'true';
}

// Runtime slice from daawah.js: applyPortalAccessRules.
function applyPortalAccessRules() {
    const audience = localStorage.getItem(PORTAL_AUDIENCE_KEY) || '';
    const isAdminAudience = audience === 'admin';
    const hideAdminPortal = !isAdminAudience && (isAdminPortalClosed() || ['student', 'officer'].includes(audience));
    document.querySelectorAll('[data-admin-portal-card], .portal-card-admin').forEach(card => {
        card.classList.toggle('d-none', hideAdminPortal);
        card.setAttribute('aria-hidden', hideAdminPortal ? 'true' : 'false');
    });
    document.querySelectorAll('.portal-card-student, .portal-card-officer').forEach(card => {
        card.classList.toggle('d-none', isAdminAudience);
        card.setAttribute('aria-hidden', isAdminAudience ? 'true' : 'false');
    });
}

// Runtime slice from daawah.js: logLocalRoleActivity.
function logLocalRoleActivity(actionName, details = {}) {
    if (!currentUser) return;
    const logs = readList('roleActivityLogs');
    logs.push({
        id: Date.now(),
        user_id: currentUser.dbUserId || currentUser.user_id || currentUser.id || 0,
        username: currentUser.username || currentUser.studentId || currentUser.email || 'Member',
        email: currentUser.email || '',
        action: actionName,
        source: 'member_dashboard',
        details: {
            role: currentRole || currentUser.role || 'student',
            username: currentUser.username || currentUser.studentId || '',
            ...details
        },
        ip_address: 'local browser',
        created_at: new Date().toISOString()
    });
    localStorage.setItem('roleActivityLogs', JSON.stringify(logs.slice(-200)));
}

// Runtime slice from daawah.js: getStaticApiData.
function getStaticApiData(action) {
    switch (action) {
        case 'getLeaders':
            return { success: true, data: readList('publicLeaders') };
        case 'getGallery':
            return { success: true, data: readList('galleryItems') };
        case 'getSiteSettings':
            return { success: true, data: getLocalSiteSettings() };
        case 'getAnnouncements':
            return { success: true, data: readList('adminAnnouncements') };
        case 'getEvents':
            return { success: true, data: readList('adminEvents') };
        case 'getPrayerTimes':
            return { success: true, data: readStoredObject('adminPrayerTimes', null) };
        case 'getResources':
            return { success: true, data: readList('adminResources') };
        case 'getAllHadiths':
            return { success: true, data: readList('adminHadiths') };
        case 'getDailyHadith': {
            const hadiths = readList('adminHadiths');
            if (hadiths.length === 0) {
                return { success: false, data: null };
            }
            const index = new Date().getDate() % hadiths.length;
            return {
                success: true,
                data: hadiths[index],
                position: index + 1,
                total: hadiths.length
            };
        }
        default:
            return { success: false, data: [] };
    }
}

// PAGE NAVIGATION FUNCTIONS

// Runtime slice from daawah.js: showLanding.
function showLanding() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.add('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
    setPublicSectionVisibility('');
}

// Runtime slice from daawah.js: showPublicHashSection.
function showPublicHashSection() {
    const sectionId = String(window.location.hash || '').replace(/^#/, '');
    const publicSections = ['home', 'portals', 'about', 'mission', 'activities', 'leadership', 'gallery', 'contact'];
    if (!sectionId || !publicSections.includes(sectionId)) return false;
    if (getStoredCurrentUser()) return false;
    showLanding();
    setPublicSectionVisibility(sectionId);
    document.querySelectorAll('#landingNavbarNav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === `#${sectionId}`);
    });
    closeLandingNavbar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
}

// Runtime slice from daawah.js: showLoginPage.
function showLoginPage() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

// Runtime slice from daawah.js: activateAuthTab.
function activateAuthTab(tabName) {
    rememberPortalAudience('student');
    showLoginPage();
    const loginTrigger = document.querySelector('#loginTabBtn');
    const registerTrigger = document.querySelector('#registerTabBtn');
    if (!loginTrigger || !registerTrigger) return;
    if (tabName === 'register') {
        bootstrap.Tab.getOrCreateInstance(registerTrigger).show();
    } else {
        bootstrap.Tab.getOrCreateInstance(loginTrigger).show();
    }
}

// Runtime slice from daawah.js: scrollToSection.
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Runtime slice from daawah.js: setPublicSectionVisibility.
function setPublicSectionVisibility(sectionId) {
    const landingPage = document.getElementById('landingPage');
    if (!landingPage) return;
    const activeSectionId = sectionId || '';
    landingPage.classList.toggle('portal-view-active', activeSectionId === 'portals');
    const sections = landingPage.querySelectorAll('.landing-hero, .landing-section');
    sections.forEach(section => {
        const isPortalSection = section.id === 'portals';
        const shouldShow = (!activeSectionId && !isPortalSection)
            || (activeSectionId === 'home' && !isPortalSection)
            || section.id === activeSectionId;
        section.classList.toggle('public-section-hidden', !shouldShow);
    });
    applyPortalAccessRules();
}

// Runtime slice from daawah.js: closeLandingNavbar.
function closeLandingNavbar() {
    const nav = document.getElementById('landingNavbarNav');
    if (nav?.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }
}

// Runtime slice from daawah.js: showPublicSection.
function showPublicSection(sectionId, trigger = null) {
    showLanding();
    setPublicSectionVisibility(sectionId || 'home');
    document.querySelectorAll('#landingNavbarNav .nav-link').forEach(link => {
        link.classList.toggle('active', trigger && link === trigger);
    });
    closeLandingNavbar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
}

window.showLanding = showLanding;
window.showLoginPage = showLoginPage;
window.activateAuthTab = activateAuthTab;
window.scrollToSection = scrollToSection;
window.showPublicSection = showPublicSection;
window.showPublicHashSection = showPublicHashSection;

// LEADERSHIP AND GALLERY FUNCTIONS

// Runtime slice from daawah.js: showLeaderDetails.
function showLeaderDetails(leaderData) {
    const leader = typeof leaderData === 'string' ? JSON.parse(decodeURIComponent(leaderData)) : leaderData;
    const course = leader.course || '';
    const yearOfStudy = leader.year_of_study || leader.yearOfStudy || '';
    const photoUrl = leader.photo_url || leader.photoData || leader.photo || '';
    const addedAt = leader.created_at || leader.createdAt || '';

    document.getElementById('leaderModalTitle').textContent = `${leader.name} - ${leader.position}`;
    document.getElementById('leaderName').textContent = leader.name || '';
    document.getElementById('leaderPosition').textContent = leader.position || '';
    document.getElementById('leaderBio').textContent = leader.bio || 'No bio added yet.';
    document.getElementById('leaderDescription').textContent = leader.description || 'No description added yet.';
    document.getElementById('leaderEmail').textContent = leader.email || 'N/A';
    document.getElementById('leaderPhone').textContent = leader.phone || 'N/A';
    document.getElementById('leaderCourse').textContent = course || 'N/A';
    document.getElementById('leaderYearOfStudy').textContent = yearOfStudy || 'N/A';
    document.getElementById('leaderCourseRow').classList.toggle('d-none', !course);
    document.getElementById('leaderYearRow').classList.toggle('d-none', !yearOfStudy);
    document.getElementById('leaderAddedAt').textContent = addedAt ? new Date(addedAt).toLocaleString() : 'N/A';
    document.getElementById('leaderAddedRow').classList.toggle('d-none', !addedAt);

    const leaderPhotoImage = document.getElementById('leaderPhotoImage');
    const leaderPhotoIcon = document.getElementById('leaderPhotoIcon');
    if (photoUrl && leaderPhotoImage) {
        leaderPhotoImage.src = resolveAppUrl(photoUrl);
        leaderPhotoImage.alt = leader.name ? `${leader.name} profile photo` : 'Leader profile photo';
        leaderPhotoImage.classList.remove('d-none');
        leaderPhotoIcon?.classList.add('d-none');
        leaderPhotoImage.onerror = function() {
            leaderPhotoImage.classList.add('d-none');
            leaderPhotoIcon?.classList.remove('d-none');
        };
    } else {
        leaderPhotoImage?.classList.add('d-none');
        leaderPhotoIcon?.classList.remove('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('leaderDetailsModal'));
    modal.show();
}

// Runtime slice from daawah.js: encodeLeaderDetails.
function encodeLeaderDetails(leader) {
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
        photo_url: leader.photo_url || leader.photoData || leader.photo || '',
        created_at: leader.created_at || leader.createdAt || ''
    })).replace(/'/g, '%27');
}

// Runtime slice from daawah.js: getGalleryMediaType.
function getGalleryMediaType(url, file = null) {
    const fileType = (file?.type || '').toLowerCase();
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('image/')) return 'image';
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') || /^data:video\//i.test(url || '') ? 'video' : 'image';
}

// Runtime slice from daawah.js: encodeGalleryItem.
function encodeGalleryItem(item) {
    const mediaUrl = item.image_url || item.imageData || item.imageUrl || '';
    return encodeURIComponent(JSON.stringify({
        title: item.title || '',
        description: item.description || '',
        media_url: mediaUrl,
        media_type: item.media_type || getGalleryMediaType(mediaUrl)
    }));
}

// Runtime slice from daawah.js: showGalleryImage.
function showGalleryImage(encodedOrTitle, description = '', mediaUrl = '', mediaType = 'image') {
    let item = null;
    try {
        item = JSON.parse(decodeURIComponent(encodedOrTitle));
    } catch (error) {
        item = { title: encodedOrTitle, description, media_url: mediaUrl, media_type: mediaType };
    }

    const resolvedMediaUrl = resolveAppUrl(item.media_url || '');
    const resolvedMediaType = item.media_type || getGalleryMediaType(resolvedMediaUrl);
    const modalImage = document.getElementById('galleryModalImage');
    const modalVideo = document.getElementById('galleryModalVideo');

    document.getElementById('galleryModalTitle').textContent = item.title || 'Gallery Item';
    document.getElementById('galleryTitle').textContent = item.title || '';
    document.getElementById('galleryDescription').textContent = item.description || '';

    if (resolvedMediaType === 'video') {
        modalImage.src = '';
        modalImage.classList.add('d-none');
        modalVideo.src = resolvedMediaUrl;
        modalVideo.classList.remove('d-none');
    } else {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modalVideo.classList.add('d-none');
        modalImage.src = resolvedMediaUrl;
        modalImage.classList.remove('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('galleryImageModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    const galleryModal = document.getElementById('galleryImageModal');
    galleryModal?.addEventListener('hidden.bs.modal', function() {
        const modalVideo = document.getElementById('galleryModalVideo');
        if (!modalVideo) return;
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
    });
});

// LOAD DYNAMIC CONTENT FOR LANDING PAGE

// Runtime slice from daawah.js: loadLandingPageContent.
function loadLandingPageContent() {
    loadPublicSiteSettings();
    loadLeadershipContent();
    loadGalleryContent();
    loadPublicActivitiesPreview();
}

// Runtime slice from daawah.js: setTextById.
function setTextById(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
}

// Runtime slice from daawah.js: setContactLinkById.
function setContactLinkById(id, value, hrefPrefix) {
    const element = document.getElementById(id);
    if (!element) return;
    const text = String(value || '').trim();
    element.textContent = text;
    if (text) {
        element.href = `${hrefPrefix}${text}`;
    } else {
        element.removeAttribute('href');
    }
}

// Runtime slice from daawah.js: whatsappLabel.
function whatsappLabel(url, fallbackPhone = '') {
    const phone = String(fallbackPhone || '').trim();
    if (phone) return phone;
    const match = String(url || '').match(/(?:phone=|wa\.me\/)(\d+)/i);
    return match ? `+${match[1]}` : 'WhatsApp';
}

// Runtime slice from daawah.js: renderPublicSocialLinks.
function renderPublicSocialLinks(settings) {
    const container = document.getElementById('publicSocialLinks');
    if (!container) return;
    const links = [
        ['social_whatsapp', 'WhatsApp', 'fab fa-whatsapp'],
        ['contact_email', 'Email', 'fas fa-envelope', value => `mailto:${value}`],
        ['social_facebook', 'Facebook', 'fab fa-facebook'],
        ['social_x', 'X', 'fab fa-twitter'],
        ['social_instagram', 'Instagram', 'fab fa-instagram'],
        ['social_youtube', 'YouTube', 'fab fa-youtube'],
        ['social_tiktok', 'TikTok', 'fab fa-tiktok'],
        ['social_linkedin', 'LinkedIn', 'fab fa-linkedin']
    ];
    container.innerHTML = links
        .filter(([key]) => settings[key])
        .map(([key, label, icon, hrefBuilder]) => {
            const href = hrefBuilder ? hrefBuilder(settings[key]) : settings[key];
            const targetAttrs = key === 'contact_email' ? '' : ' target="_blank" rel="noopener"';
            return `<a href="${escapeHtml(href)}"${targetAttrs} aria-label="${escapeHtml(label)}"><i class="${icon}"></i></a>`;
        })
        .join('');
}

// Runtime slice from daawah.js: applyPublicSiteSettings.
function applyPublicSiteSettings(settings = {}) {
    const merged = { ...getLocalSiteSettings(), ...settings };
    merged.contact_email = normalizeContactEmail(merged.contact_email);
    applyPublicPageContent(merged);
    setTextById('publicContactLocation', merged.contact_location);
    setContactLinkById('publicContactPhone', merged.contact_phone, 'tel:');
    setContactLinkById('publicContactEmail', merged.contact_email, 'mailto:');
    setTextById('publicContactHours', merged.contact_hours);
    setTextById('footerContactLocation', merged.contact_location);
    setContactLinkById('footerContactPhone', merged.contact_phone, 'tel:');
    setContactLinkById('footerContactEmail', merged.contact_email, 'mailto:');
    setTextById('footerContactHours', merged.contact_hours);

    const whatsapp = document.getElementById('publicContactWhatsapp');
    if (whatsapp) {
        whatsapp.href = merged.social_whatsapp || '#contact';
        whatsapp.textContent = whatsappLabel(merged.social_whatsapp, merged.contact_phone);
        whatsapp.closest('.contact-item')?.classList.toggle('d-none', !merged.social_whatsapp);
    }
    const footerWhatsapp = document.getElementById('footerContactWhatsapp');
    if (footerWhatsapp) {
        footerWhatsapp.href = merged.social_whatsapp || '#contact';
        footerWhatsapp.textContent = whatsappLabel(merged.social_whatsapp, merged.contact_phone);
    }
    renderPublicSocialLinks(merged);
    applyPortalAccessRules();
}

// Runtime slice from daawah.js: applyPublicPageContent.
function applyPublicPageContent(settings = {}) {
    const textMap = {
        publicAboutTitle: settings.about_title,
        publicAboutHeading: settings.about_heading,
        publicAboutParagraph1: settings.about_paragraph_1,
        publicAboutParagraph2: settings.about_paragraph_2,
        publicAboutFeature1: settings.about_feature_1,
        publicAboutFeature2: settings.about_feature_2,
        publicAboutFeature3: settings.about_feature_3,
        publicAboutFeature4: settings.about_feature_4,
        publicWhatWeDoTitle: settings.what_we_do_title,
        publicWhatWeDo1Title: settings.what_we_do_1_title,
        publicWhatWeDo1Text: settings.what_we_do_1_text,
        publicWhatWeDo2Title: settings.what_we_do_2_title,
        publicWhatWeDo2Text: settings.what_we_do_2_text,
        publicWhatWeDo3Title: settings.what_we_do_3_title,
        publicWhatWeDo3Text: settings.what_we_do_3_text,
        publicWhatWeDo4Title: settings.what_we_do_4_title,
        publicWhatWeDo4Text: settings.what_we_do_4_text,
        publicWhatWeDo5Title: settings.what_we_do_5_title,
        publicWhatWeDo5Text: settings.what_we_do_5_text,
        publicWhatWeDo6Title: settings.what_we_do_6_title,
        publicWhatWeDo6Text: settings.what_we_do_6_text
    };
    Object.entries(textMap).forEach(([id, value]) => setTextById(id, value));
}

// Runtime slice from daawah.js: loadPublicSiteSettings.
function loadPublicSiteSettings() {
    const request = window.SupabaseBackend?.enabled
        ? window.SupabaseBackend.loadSiteSettings().then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getSiteSettings'))
        : fetch('supabase-required-endpoint?action=getSiteSettings').then(response => parseJsonResponse(response));

    return request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load site settings');
            writeLocalSiteSettings(result.data || {});
            applyPublicSiteSettings(result.data || {});
        })
        .catch(() => applyPublicSiteSettings(getLocalSiteSettings()));
}

// Runtime slice from daawah.js: loadLeadershipContent.
function loadLeadershipContent() {
    const leadershipContainer = document.getElementById('leadershipContainer');
    if (!leadershipContainer) return;

    const leadershipRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getLeaders'))
        : fetch('admin_supabase-required-endpoint?action=getLeaders').then(response => parseJsonResponse(response));

    leadershipRequest
    .then(result => {
        let leaders = result.data || [];

        // Fallback to localStorage if no database results
        if (leaders.length === 0) {
            leaders = readList('publicLeaders');
        }

        if (leaders.length === 0) {
            leadershipContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Leadership information will be updated soon.</p>
                </div>
            `;
            return;
        }

        leadershipContainer.innerHTML = leaders.map(leader => `
            <div class="col-md-6 col-lg-3 mb-4">
                <button type="button" class="leadership-card leadership-card-button" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')" aria-label="View ${escapeHtml(leader.name)} details">
                    <div class="leader-photo">
                        ${leader.photo_url ? `<img src="${resolveAppUrl(leader.photo_url)}" alt="${escapeHtml(leader.name)}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas fa-user-circle fa-5x" ${leader.photo_url ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${escapeHtml(leader.name)}</h6>
                    <p class="position">${escapeHtml(leader.position)}</p>
                    ${leader.course ? `<p class="bio"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                    ${leader.year_of_study ? `<p class="bio"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                    <p class="bio">${escapeHtml(leader.bio || '')}</p>
                </button>
            </div>
        `).join('');
    })
    .catch(() => {
        // Fallback to localStorage
        const publicLeaders = readList('publicLeaders');

        if (publicLeaders.length === 0) {
            leadershipContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Leadership information will be updated soon.</p>
                </div>
            `;
            return;
        }

        leadershipContainer.innerHTML = publicLeaders.map(leader => `
            <div class="col-md-6 col-lg-3 mb-4">
                <button type="button" class="leadership-card leadership-card-button" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')" aria-label="View ${escapeHtml(leader.name)} details">
                    <div class="leader-photo">
                        ${leader.photoData ? `<img src="${leader.photoData}" alt="${escapeHtml(leader.name)}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas fa-user-circle fa-5x" ${leader.photoData ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${escapeHtml(leader.name)}</h6>
                    <p class="position">${escapeHtml(leader.position)}</p>
                    ${leader.course ? `<p class="bio"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                    ${leader.year_of_study ? `<p class="bio"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                    <p class="bio">${escapeHtml(leader.bio)}</p>
                </button>
            </div>
        `).join('');
    });
}

// Runtime slice from daawah.js: loadGalleryContent.
function loadGalleryContent() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_supabase-required-endpoint?action=getGallery').then(response => parseJsonResponse(response));

    galleryRequest
    .then(result => {
        let galleryItems = result.data || [];

        // Fallback to localStorage if no database results
        if (galleryItems.length === 0) {
            galleryItems = readList('galleryItems');
        }

        if (galleryItems.length === 0) {
            galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Gallery items will be added soon.</p>
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = galleryItems.map(item => {
            const mediaUrl = item.image_url || item.imageData || item.imageUrl || '';
            const mediaType = item.media_type || getGalleryMediaType(mediaUrl);
            return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="gallery-item" onclick="showGalleryImage('${encodeGalleryItem(item)}')">
                    <div class="gallery-image">
                        ${mediaUrl && mediaType === 'video' ? `<video src="${resolveAppUrl(mediaUrl)}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" muted></video>` : ''}
                        ${mediaUrl && mediaType !== 'video' ? `<img src="${resolveAppUrl(mediaUrl)}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas ${mediaType === 'video' ? 'fa-video' : (item.icon || 'fa-images')} fa-4x" ${mediaUrl ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${item.title}</h6>
                    <p class="text-muted">${(item.description || '').substring(0, 50)}${(item.description || '').length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;
        }).join('');
    })
    .catch(() => {
        // Fallback to localStorage
        const galleryItems = readList('galleryItems');

        if (galleryItems.length === 0) {
            galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Gallery items will be added soon.</p>
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = galleryItems.map(item => {
            const mediaUrl = item.imageData || item.imageUrl || item.image_url || '';
            const mediaType = item.media_type || getGalleryMediaType(mediaUrl);
            return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="gallery-item" onclick="showGalleryImage('${encodeGalleryItem(item)}')">
                    <div class="gallery-image">
                        ${mediaUrl && mediaType === 'video' ? `<video src="${resolveAppUrl(mediaUrl)}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" muted></video>` : ''}
                        ${mediaUrl && mediaType !== 'video' ? `<img src="${resolveAppUrl(mediaUrl)}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas ${mediaType === 'video' ? 'fa-video' : (item.icon || 'fa-images')} fa-4x" ${mediaUrl ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${item.title}</h6>
                    <p class="text-muted">${(item.description || '').substring(0, 50)}${(item.description || '').length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;
        }).join('');
    });
}

// PUBLIC LEADERSHIP MANAGEMENT FUNCTIONS

// Runtime slice from daawah.js: showPublicLeadershipModal.
function showPublicLeadershipModal() {
    loadPublicLeadershipList();
    const modal = new bootstrap.Modal(document.getElementById('publicLeadershipModal'));
    modal.show();
}

// Runtime slice from daawah.js: showAddPublicLeaderModal.
function showAddPublicLeaderModal() {
    // Clear form
    document.getElementById('addPublicLeaderForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('addPublicLeaderModal'));
    modal.show();
}

// Runtime slice from daawah.js: savePublicLeader.
function savePublicLeader() {
    const name = document.getElementById('publicLeaderName').value.trim();
    const position = document.getElementById('publicLeaderPosition').value.trim();
    const bio = document.getElementById('publicLeaderBio').value.trim();
    const course = document.getElementById('publicLeaderCourse').value.trim();
    const yearOfStudy = document.getElementById('publicLeaderYearOfStudy').value.trim();
    const description = document.getElementById('publicLeaderDescription').value.trim();
    const email = document.getElementById('publicLeaderEmail').value.trim();
    const phone = document.getElementById('publicLeaderPhone').value.trim();
    const photoInput = document.getElementById('publicLeaderPhoto');

    if (!name || !position || !bio || !description || !email || !phone) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }

    let publicLeaders = readList('publicLeaders');

    const newLeader = {
        id: Date.now(),
        name: name,
        position: position,
        course: course,
        year_of_study: yearOfStudy,
        bio: bio,
        description: description,
        email: email,
        phone: phone,
        photoData: null,
        createdAt: new Date().toISOString()
    };

    // Handle photo upload if provided
    if (photoInput && photoInput.files && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            newLeader.photoData = e.target.result;
            publicLeaders.push(newLeader);
            localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
            bootstrap.Modal.getInstance(document.getElementById('addPublicLeaderModal')).hide();
            loadPublicLeadershipList();
            loadLeadershipContent(); // Refresh landing page
            showNotification('Leader added successfully!', 'success');
        };
        reader.readAsDataURL(file);
    } else {
        publicLeaders.push(newLeader);
        localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
        bootstrap.Modal.getInstance(document.getElementById('addPublicLeaderModal')).hide();
        loadPublicLeadershipList();
        loadLeadershipContent(); // Refresh landing page
        showNotification('Leader added successfully!', 'success');
    }
}

// Runtime slice from daawah.js: loadPublicLeadershipList.
function loadPublicLeadershipList() {
    const container = document.getElementById('publicLeadershipList');
    const publicLeaders = readList('publicLeaders');

    if (publicLeaders.length === 0) {
        container.innerHTML = '<p class="text-muted">No public leaders added yet.</p>';
        return;
    }

    container.innerHTML = publicLeaders.map(leader => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title">${escapeHtml(leader.name)}</h6>
                        <p class="card-subtitle mb-2 text-muted">${escapeHtml(leader.position)}</p>
                        ${leader.course ? `<p class="card-text small mb-1"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                        ${leader.year_of_study ? `<p class="card-text small mb-1"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                        <p class="card-text small">${escapeHtml(leader.bio)}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePublicLeader(${leader.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: deletePublicLeader.
function deletePublicLeader(id) {
    if (!confirm('Are you sure you want to delete this leader?')) return;

    let publicLeaders = readList('publicLeaders');
    publicLeaders = publicLeaders.filter(leader => leader.id !== id);
    localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
    loadPublicLeadershipList();
    loadLeadershipContent(); // Refresh landing page
    showNotification('Leader deleted successfully!', 'success');
}

// Runtime slice from daawah.js: updateDashboardStats.
function updateDashboardStats() {
    if (!currentUser) return;
    try {
        loadDashboardData();
    } catch (error) {
        console.error('Dashboard stats update failed:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp().catch(error => {
        console.error('App initialization failed:', error);
        document.documentElement.classList.remove('pending-auth-route');
        showLanding?.();
        showNotification?.('The app recovered from a startup problem. Please refresh if anything looks stale.', 'warning');
    });
    try {
        attachEventListeners();
        loadHostingCapabilities();
        attachWelfareSyncListeners();
        loadLandingPageContent(); // Load dynamic content for landing page
    } catch (error) {
        console.error('Startup listener setup failed:', error);
        document.documentElement.classList.remove('pending-auth-route');
    }
});

window.addEventListener('hashchange', function() {
    showPublicHashSection();
});

// Runtime slice from daawah.js: attachWelfareSyncListeners.
function attachWelfareSyncListeners() {
    window.addEventListener('storage', function(event) {
        if (event.key === 'welfareRequests') {
            welfareRequests = readList('welfareRequests');
            updateWelfareRequestsList();
            updateDashboardStats();
            refreshActiveRoleView();
        }
        if (['allMembers', 'payments', 'donations', 'registeredEvents', ...LIVE_PUBLIC_STORE_KEYS].includes(event.key)) {
            refreshLocalRoleStores();
            refreshActiveRoleView();
        }
    });

    window.addEventListener('focus', function() {
        if (currentUser) {
            syncWelfareRequestsFromAdmin().finally(() => updateWelfareRequestsList());
        }
    });

    setInterval(() => {
        const welfareView = document.getElementById('welfareView');
        if (currentUser && welfareView?.classList.contains('active')) {
            syncWelfareRequestsFromAdmin().finally(() => updateWelfareRequestsList());
        }
    }, 5000);
}

// INITIALIZATION

// Runtime slice from daawah.js: initializeApp.
async function initializeApp() {
    registerInstallableApp();
    checkForAppUpdate();
    // Load stored data before rendering any logged-in dashboard view.
    registeredEvents = readList('registeredEvents');
    welfareRequests = readList('welfareRequests');
    donations = readList('donations');
    payments = readList('payments');
    leadershipRoles = readList('leadershipRoles');
    allMembers = readList('allMembers');
    allEvents = readList('allEvents');
    cloudStoresReadyPromise = loadSharedMemberStore();
    await cloudStoresReadyPromise;
    clearCachedStudentAccountsOnce();

    if (new URLSearchParams(location.search).get('dashboard') === '1' && window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()) {
        const cloudMember = await window.SupabaseBackend.loadMyMember().catch(() => null);
        if (cloudMember && String(cloudMember.status || '').toLowerCase() === 'active') {
            localStorage.setItem('currentUser', JSON.stringify(cloudMember));
            localStorage.setItem('currentRole', cloudMember.role || 'student');
        }
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = getStoredCurrentUser();
        if (!currentUser) {
            localStorage.removeItem('currentUser');
            document.documentElement.classList.remove('pending-auth-route');
            return;
        }
        currentRole = currentUser.role || localStorage.getItem('currentRole') || 'student';
        localStorage.setItem('currentRole', currentRole);
        if (!frontendOnly && !currentUser.csrf_token) {
            refreshUserSessionToken().catch(() => {});
        }
        showDashboard();
    } else {
        document.documentElement.classList.remove('pending-auth-route');
        if (!showPublicHashSection()) {
            setPublicSectionVisibility('home');
        }
    }
}

// Runtime slice from daawah.js: loadSharedMemberStore.
async function loadSharedMemberStore() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    let member = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        member = await window.SupabaseBackend.loadMyMember().catch(error => {
            if (attempt === 3) {
                console.warn('Supabase member profile load failed:', error);
            }
            return null;
        });
        if (member) break;
        if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 600));
        }
    }
    if (member) {
        allMembers = mergeMemberIntoList(allMembers, member);
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
    }
}

// Runtime slice from daawah.js: memberIdentityValue.
function memberIdentityValue(member) {
    return memberIdentityKeys(member)[0] || '';
}

// Runtime slice from daawah.js: memberIdentityKeys.
function memberIdentityKeys(member) {
    return [
        member?.uid,
        member?.studentId,
        member?.username,
        member?.email,
        member?.authEmail
    ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
}

// Runtime slice from daawah.js: mergeMemberIntoList.
function mergeMemberIntoList(members, member) {
    const list = Array.isArray(members) ? [...members] : [];
    const identities = memberIdentityKeys(member);
    if (!identities.length) return list;
    const index = list.findIndex(item => {
        const keys = memberIdentityKeys(item);
        return keys.some(key => identities.includes(key));
    });
    if (index >= 0) {
        list[index] = { ...list[index], ...member };
    } else {
        list.push(member);
    }
    return list;
}

// Runtime slice from daawah.js: saveSharedMemberStore.
function saveSharedMemberStore(member = null, options = {}) {
    if (!window.SupabaseBackend?.enabled) return Promise.resolve();
    const profile = member || currentUser || allMembers[allMembers.length - 1];
    if (!profile) return Promise.resolve();
    return window.SupabaseBackend.saveMember(profile).then(savedProfile => {
        if (savedProfile) {
            allMembers = mergeMemberIntoList(allMembers, savedProfile);
            localStorage.setItem('allMembers', JSON.stringify(allMembers));
        }
        return savedProfile;
    }).catch(error => {
        console.error('Supabase member sync failed:', error);
        if (options.requireCloud) throw error;
        showNotification?.('Saved on this device, but backend member sync failed. Please try again online.', 'warning');
        return null;
    });
}

// Runtime slice from daawah.js: saveOwnedCloudRecord.
function saveOwnedCloudRecord(collection, record, storageKey) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession() || !record) return Promise.resolve(record);
    return window.SupabaseBackend.createRecord(collection, record)
        .then(saved => {
            if (storageKey && saved?.supabaseId) {
                const items = readList(storageKey);
                const next = items.map(item => String(item.id || '') === String(record.id || '') ? { ...item, supabaseId: saved.supabaseId } : item);
                localStorage.setItem(storageKey, JSON.stringify(next));
            }
            return saved;
        })
        .catch(error => {
            console.error(`Supabase ${collection} save failed:`, error);
            showNotification('Saved on this device, but cloud sync failed. Please try again online.', 'warning');
            return record;
        });
}

// Runtime slice from daawah.js: updateCloudRecord.
function updateCloudRecord(collection, record, patch) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession() || !record?.supabaseId) return Promise.resolve();
    return window.SupabaseBackend.updateRecord(collection, record.supabaseId, patch).catch(error => {
        console.error(`Supabase ${collection} update failed:`, error);
        showNotification('Local update saved, but cloud status sync failed.', 'warning');
    });
}

// Runtime slice from daawah.js: clearCachedStudentAccountsOnce.
function clearCachedStudentAccountsOnce() {
    if (window.SupabaseBackend?.enabled) return;
    if (localStorage.getItem('localStudentClearVersion') === localStudentClearVersion) {
        return;
    }

    allMembers = allMembers.filter(member => (member.role || 'student') !== 'student');
    localStorage.setItem('allMembers', JSON.stringify(allMembers));

    const cachedUser = getStoredCurrentUser();
    if (cachedUser && (cachedUser.role || 'student') === 'student') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        currentUser = null;
        currentRole = null;
    }

    localStorage.setItem('localStudentClearVersion', localStudentClearVersion);
}

// Runtime slice from daawah.js: attachEventListeners.
function attachEventListeners() {
    initializeAcademicSelectors();
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', handleForgotPassword);
    document.getElementById('contactForm')?.addEventListener('submit', submitContactVoiceMessage);
    document.getElementById('startVoiceRecording')?.addEventListener('click', startContactVoiceRecording);
    document.getElementById('stopVoiceRecording')?.addEventListener('click', stopContactVoiceRecording);
    document.getElementById('clearVoiceRecording')?.addEventListener('click', clearContactVoiceRecording);
    document.getElementById('contactVoiceFile')?.addEventListener('change', handleContactVoiceFileChange);
    document.getElementById('passportPhoto')?.addEventListener('change', handlePassportPhotoFileChange);
    document.getElementById('togglePassword')?.addEventListener('click', togglePasswordVisibility);
    document.getElementById('toggleRegPassword')?.addEventListener('click', () => togglePasswordField('regPassword', 'toggleRegPassword'));
    document.getElementById('toggleConfirmPassword')?.addEventListener('click', () => togglePasswordField('confirmPassword', 'toggleConfirmPassword'));
    document.getElementById('loginUsername')?.addEventListener('blur', populateLoginRoleFromUsername);
    document.getElementById('school')?.addEventListener('change', () => renderCourseOptions('course', document.getElementById('school').value));
    document.getElementById('editSchool')?.addEventListener('change', () => renderCourseOptions('editCourse', document.getElementById('editSchool').value));
    document.getElementById('yearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('yearOfStudy', 'semester'));
    document.getElementById('editYearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('editYearOfStudy', 'editSemester'));
    document.getElementById('regPassword')?.addEventListener('input', updatePasswordStrengthMeter);
    updateSemesterAvailability('yearOfStudy', 'semester');
    updatePasswordStrengthMeter();
}

// Runtime slice from daawah.js: loadHostingCapabilities.
function loadHostingCapabilities() {
    if (frontendOnly) {
        hostingCapabilities = { mpesa_stk_available: false };
        refreshPaymentMethodAvailability();
        return Promise.resolve(hostingCapabilities);
    }

    return fetch('supabase-required-endpoint?action=hostingCheck')
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (result.success) {
                hostingCapabilities = result.data || {};
                refreshPaymentMethodAvailability();
            }
            return hostingCapabilities;
        })
        .catch(error => {
            console.warn('Hosting capability check failed:', error);
            hostingCapabilities = { mpesa_stk_available: false };
            refreshPaymentMethodAvailability();
            return hostingCapabilities;
        });
}

// Runtime slice from daawah.js: canUseMpesaStk.
function canUseMpesaStk() {
    return !frontendOnly && hostingCapabilities && hostingCapabilities.mpesa_stk_available === true;
}

// Runtime slice from daawah.js: refreshPaymentMethodAvailability.
function refreshPaymentMethodAvailability() {
    ['paymentMethod', 'donationPaymentMethod'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const option = Array.from(select.options).find(item => item.value === 'mpesaStk');
        if (!option) return;
        option.disabled = !canUseMpesaStk();
        option.textContent = canUseMpesaStk() ? 'M-Pesa STK Push' : 'M-Pesa STK Push (not available here)';
        if (option.disabled && select.value === 'mpesaStk') {
            select.value = '';
            updatePaymentInstructions(selectId === 'donationPaymentMethod' ? 'donation' : 'payment');
        }
    });
}

// Runtime slice from daawah.js: validateUploadFile.
function validateUploadFile(file, limitKey) {
    if (!file || !uploadLimits[limitKey]) return true;
    const limit = uploadLimits[limitKey];
    const allowed = limit.types.some(type => type.endsWith('/') ? file.type.startsWith(type) : file.type === type);
    if (!allowed) {
        showNotification('Please choose a supported file type.', 'warning');
        return false;
    }
    if (file.size > limit.bytes) {
        showNotification(`File is too large. Maximum allowed size is ${limit.label}.`, 'warning');
        return false;
    }
    return true;
}

// Runtime slice from daawah.js: getGalleryUploadLimitKey.
function getGalleryUploadLimitKey(file) {
    return file?.type?.startsWith('video/') ? 'galleryVideo' : 'galleryImage';
}

// Runtime slice from daawah.js: handlePassportPhotoFileChange.
function handlePassportPhotoFileChange(event) {
    const file = event.target.files?.[0];
    if (file && !validateUploadFile(file, 'profilePhoto')) {
        event.target.value = '';
    }
}

// Runtime slice from daawah.js: initializeAcademicSelectors.
function initializeAcademicSelectors() {
    renderSchoolOptions('school');
    renderSchoolOptions('editSchool');
    renderCourseOptions('course', '');
    renderCourseOptions('editCourse', '');
    renderNumberOptions('yearOfStudy', yearOptions, 'Select Year', 'Year');
    renderNumberOptions('editYearOfStudy', yearOptions, 'Select Year', 'Year');
    renderNumberOptions('semester', semesterOptions, 'Select Semester', 'Semester');
    renderNumberOptions('editSemester', semesterOptions, 'Select Semester', 'Semester');
}

// Runtime slice from daawah.js: renderSchoolOptions.
function renderSchoolOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Select School</option>' +
        schoolOptions.map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`).join('');
}

// Runtime slice from daawah.js: renderCourseOptions.
function renderCourseOptions(selectId, school, selectedCourse = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const catalog = schoolCourseCatalog[school];
    if (!catalog) {
        select.innerHTML = '<option value="" disabled selected>Select a school first</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = '<option value="">Select Course</option>' + Object.entries(catalog).map(([group, courses]) => `
        <optgroup label="${escapeHtml(group)}">
            ${courses.map(course => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join('')}
        </optgroup>
    `).join('');
    select.value = selectedCourse;
}

// Runtime slice from daawah.js: renderNumberOptions.
function renderNumberOptions(selectId, values, placeholder, label) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>` +
        values.map(value => `<option value="${value}">${label} ${value}</option>`).join('');
}

// Runtime slice from daawah.js: escapeHtml.
function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Runtime slice from daawah.js: authPayload.
function authPayload(extra = {}) {
    return {
        ...extra,
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    };
}

// Runtime slice from daawah.js: authQuery.
function authQuery() {
    const params = new URLSearchParams({
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    });
    return params.toString();
}

// Runtime slice from daawah.js: updateSemesterAvailability.
function updateSemesterAvailability(yearSelectId, semesterSelectId) {
    const yearSelect = document.getElementById(yearSelectId);
    const semesterSelect = document.getElementById(semesterSelectId);
    if (!yearSelect || !semesterSelect) return;

    const hasYear = Boolean(yearSelect.value);
    semesterSelect.disabled = !hasYear;
    if (!hasYear) {
        semesterSelect.value = '';
    }
}

// Runtime slice from daawah.js: getPasswordStrength.
function getPasswordStrength(password = '') {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/i.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    if (password.length >= 12) score += 10;
    return Math.min(score, 100);
}

// Runtime slice from daawah.js: updatePasswordStrengthMeter.
function updatePasswordStrengthMeter() {
    const input = document.getElementById('regPassword');
    const wrapper = document.querySelector('.password-strength');
    const bar = document.getElementById('passwordStrengthBar');
    const text = document.getElementById('passwordStrengthText');
    if (!input || !wrapper || !bar || !text) return;

    const score = getPasswordStrength(input.value);
    bar.style.width = `${score}%`;
    wrapper.classList.toggle('is-medium', score >= 50 && score < 80);
    wrapper.classList.toggle('is-strong', score >= 80);
    text.textContent = score >= 80
        ? 'Strong password.'
        : score >= 50
            ? 'Good start. Add a symbol or more characters for stronger protection.'
            : 'Use 8+ characters with uppercase, lowercase, number, and symbol.';
}

// Runtime slice from daawah.js: normalizeStudentId.
function normalizeStudentId(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

// Runtime slice from daawah.js: isValidStudentId.
function isValidStudentId(value) {
    return /^[A-Z]{2,10}\/\d{4}\/\d{3,8}$/.test(normalizeStudentId(value));
}

// Runtime slice from daawah.js: getPasswordRequirementError.
function getPasswordRequirementError(password = '') {
    if (password.length < 8) {
        return 'Password must be at least 8 characters.';
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return 'Password must include uppercase, lowercase, number, and symbol.';
    }
    return '';
}

// Runtime slice from daawah.js: getFriendlyRegistrationError.
function getFriendlyRegistrationError(error) {
    const message = String(error?.message || error || '');
    if (/EMAIL_EXISTS|email-already-in-use|User already registered/i.test(message)) {
        return 'This email is already registered. Please login or use forgot password.';
    }
    if (/INVALID_EMAIL|invalid-email/i.test(message)) {
        return 'Please enter a valid email address.';
    }
    if (/WEAK_PASSWORD|weak-password|Password should be at least/i.test(message)) {
        return 'Password is too weak. Please use a stronger password (8+ characters recommended).';
    }
    if (/network|failed to fetch/i.test(message)) {
        return 'Registration could not connect. Check your internet, refresh this deployed link, and try again.';
    }
    return message || 'Registration failed. Please check your details and try again.';
}

// Runtime slice from daawah.js: recordSuspiciousActivity.
function recordSuspiciousActivity(type, details = {}) {
    const log = readStoredObject('suspiciousActivityLog', []);
    log.unshift({
        id: Date.now(),
        type,
        details,
        user: currentUser?.email || currentUser?.studentId || currentUser?.username || '',
        host: location.host,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('suspiciousActivityLog', JSON.stringify(log.slice(0, 300)));
}

// Runtime slice from daawah.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Runtime slice from daawah.js: populateLoginRoleFromUsername.
function populateLoginRoleFromUsername() {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const user = getRegisteredUser(username);
    const roleSelect = document.getElementById('userRole');
    if (user && roleSelect) {
        roleSelect.value = user.role;
    }
}

// AUTHENTICATION

// Runtime slice from daawah.js: getRegisteredUser.
function getRegisteredUser(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return allMembers.find(member =>
        String(member.uid || '').toLowerCase() === lookup ||
        String(member.authUid || '').toLowerCase() === lookup ||
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup ||
        String(member.authEmail || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup
    );
}

// Runtime slice from daawah.js: isUniqueRegistrationRole.
function isUniqueRegistrationRole(role) {
    return !['student', 'admin'].includes(String(role || 'student').toLowerCase());
}

// Runtime slice from daawah.js: getExistingRoleHolder.
function getExistingRoleHolder(role) {
    if (!isUniqueRegistrationRole(role)) return null;
    return allMembers.find(member =>
        String(member.role || '').toLowerCase() === String(role || '').toLowerCase() &&
        !['rejected', 'suspended'].includes(String(member.status || '').toLowerCase())
    );
}

// Runtime slice from daawah.js: handleLogin.
async function handleLogin(e) {
    e.preventDefault();

    const now = Date.now();
    if (loginLockedUntil > now) {
        const secondsLeft = Math.ceil((loginLockedUntil - now) / 1000);
        alert(`Too many failed login attempts. Please wait ${secondsLeft} seconds before trying again.`);
        return;
    }

    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please fill in all fields.');
        return;
    }
    if (!isEmailLoginIdentifier(username)) {
        alert('Please login with your registered email address only.');
        return;
    }

    if (frontendOnly && window.SupabaseBackend?.enabled) {
        try {
            await window.SupabaseBackend.loginEmail(username, password);
            await window.SupabaseBackend.ensureRealtimeAuth?.(username, password).catch(error => {
                console.warn('Realtime auth unavailable; using live refresh fallback:', error);
            });
            await loadSharedMemberStore();
        } catch (error) {
            recordFailedLoginAttempt(error.message || 'Login failed. Use your registered email address.');
            return;
        }
    } else {
        await cloudStoresReadyPromise;
    }

    if (!frontendOnly) {
        loginWithServerSession(username, password);
        return;
    }

    const user = getRegisteredUser(username);
    if (!user) {
        recordFailedLoginAttempt('No registered account found. Please register first.');
        return;
    }

    const authenticatedBySupabase = frontendOnly && window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.();
    if (!authenticatedBySupabase && user.password !== password) {
        recordFailedLoginAttempt('Invalid password.');
        return;
    }

    if (['inactive', 'pending', 'suspended'].includes(String(user.status || 'Active').toLowerCase())) {
        recordFailedLoginAttempt('This account is pending approval or inactive. Please contact the admin.');
        return;
    }

    loginFailedAttempts = 0;
    loginLockedUntil = 0;
    currentUser = user;
    currentRole = user.role || 'student';

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentRole', currentRole);

    document.getElementById('loginForm').reset();
    showDashboard();
}

// Runtime slice from daawah.js: loginWithServerSession.
function loginWithServerSession(username, password) {
    fetch('supabase-required-endpoint?action=loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Invalid username or password.');
        }

        const serverUser = result.data;

        return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(username)}`, {
            credentials: 'same-origin'
        })
        .then(response => parseJsonResponse(response))
        .then(studentResult => {
            const student = studentResult.success ? studentResult.data : {};
            const localUser = getRegisteredUser(username) || {};
            return {
                ...localUser,
                ...student,
                dbUserId: serverUser.id || student.user_id || localUser.dbUserId,
                dbStudentId: student.id || localUser.dbStudentId,
                username: serverUser.username || localUser.username || username,
                email: serverUser.email || student.email || localUser.email,
                role: serverUser.role,
                status: serverUser.status,
                fullName: localUser.fullName || `${student.first_name || ''} ${student.last_name || ''}`.trim() || serverUser.username,
                studentId: student.student_id || localUser.studentId || serverUser.username,
                school: student.school || localUser.school,
                course: student.course || localUser.course,
                yearOfStudy: student.year_of_study || localUser.yearOfStudy,
                semester: student.semester || localUser.semester,
                passport_photo: student.passport_photo || localUser.passport_photo,
                passportPhotoData: localUser.passportPhotoData || ''
            };
        });
    })
    .then(user => {
        loginFailedAttempts = 0;
        loginLockedUntil = 0;
        currentUser = user;
        currentRole = user.role;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        document.getElementById('loginForm').reset();
        showDashboard();
        checkForAppUpdate(true);
    })
    .catch(error => {
        recordFailedLoginAttempt(error.message || 'Login failed.');
    });
}

// Runtime slice from daawah.js: recordFailedLoginAttempt.
function recordFailedLoginAttempt(message) {
    loginFailedAttempts += 1;
    recordSuspiciousActivity('failed_student_login', { message, attempts: loginFailedAttempts });

    if (loginFailedAttempts >= 3) {
        loginLockedUntil = Date.now() + 10000;
        loginFailedAttempts = 0;
        alert(`${message}\nToo many failed attempts. Please wait 10 seconds before trying again.`);
        updateLoginLockoutButton();
        return;
    }

    alert(`${message}\nAttempt ${loginFailedAttempts} of 3.`);
}

// Runtime slice from daawah.js: updateLoginLockoutButton.
function updateLoginLockoutButton() {
    const button = document.getElementById('loginSubmitBtn');
    if (!button) return;

    const remaining = Math.ceil((loginLockedUntil - Date.now()) / 1000);
    if (remaining <= 0) {
        button.disabled = false;
        button.textContent = 'Login';
        return;
    }

    button.disabled = true;
    button.textContent = `Wait ${remaining}s`;
    setTimeout(updateLoginLockoutButton, 250);
}

// Runtime slice from daawah.js: handleRegistration.
async function handleRegistration(e) {
    e.preventDefault();
    await cloudStoresReadyPromise;

    const fullName = document.getElementById('fullName').value.trim();
    const studentId = normalizeStudentId(document.getElementById('studentId').value);
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const role = 'student';

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (!isValidStudentId(studentId)) {
        alert('Enter a valid Student ID like BSCS/2025/53736.');
        return;
    }

    const passwordError = getPasswordRequirementError(password);
    if (passwordError) {
        alert(passwordError);
        return;
    }

    if (getRegisteredUser(studentId) || getRegisteredUser(email)) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, reason: 'registered user match' });
        alert('A user with this Student ID or email is already registered. Please login or use forgot password.');
        return;
    }

    if (allMembers.some(member => normalizeStudentId(member.studentId || member.username) === studentId || String(member.email || '').toLowerCase() === email || (phone && String(member.phone || '').trim() === phone))) {
        recordSuspiciousActivity('duplicate_registration_attempt', { studentId, email, phone, reason: 'student/email/phone match' });
        alert('This Student ID, email, or phone number is already registered. Please login or contact admin.');
        return;
    }

    if (frontendOnly && allMembers.some(member => member.password && member.password === password)) {
        alert('Please choose a different password. Each student must use a unique password.');
        return;
    }

    const existingRoleHolder = getExistingRoleHolder(role);
    if (existingRoleHolder) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} role is already requested or assigned. Main admin must approve/reject or remove the existing holder first.`);
        return;
    }

    const passportPhotoInput = document.getElementById('passportPhoto');
    const passportPhotoFile = passportPhotoInput?.files?.[0];
    if (passportPhotoFile && !validateUploadFile(passportPhotoFile, 'profilePhoto')) {
        return;
    }

    const newUser = {
        username: studentId,
        fullName: fullName,
        studentId: studentId,
        role: role,
        school: document.getElementById('school').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        semester: document.getElementById('semester').value,
        gender: document.getElementById('gender').value,
        phone: phone,
        email: email,
        nationality: document.getElementById('nationality').value,
        homeAddress: document.getElementById('homeAddress').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        localGuardian: document.getElementById('localGuardian').value,
        passportPhoto: passportPhotoFile ? passportPhotoFile.name : '',
        passportPhotoData: '',
        passportPhotoFile: passportPhotoFile || null
    };

    if (passportPhotoFile) {
        readImageAsDataUrl(passportPhotoFile)
            .then(photoData => {
                newUser.passportPhotoData = photoData;
                continueRegistration(newUser, fullName, password);
            })
            .catch(() => {
                alert('Could not read the selected passport photo. Please choose another image.');
            });
        return;
    }

    continueRegistration(newUser, fullName, password);
}

// Runtime slice from daawah.js: readImageAsDataUrl.
function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Runtime slice from daawah.js: continueRegistration.
function continueRegistration(newUser, fullName, password) {
    if (frontendOnly && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.registerEmail(newUser.email, password)
            .then(() => window.SupabaseBackend.ensureRealtimeAuth?.(newUser.email, password).catch(error => {
                console.warn('Realtime auth unavailable after registration; using live refresh fallback:', error);
            }))
            .then(() => loadSharedMemberStore())
            .then(() => {
                if (getRegisteredUser(newUser.studentId) || getRegisteredUser(newUser.email)) {
                    throw new Error('A user with this Student ID or email is already registered.');
                }
                return completeLocalRegistration(newUser);
            })
            .catch(error => {
                console.error('Supabase Auth registration error:', error);
                alert(getFriendlyRegistrationError(error));
            });
        return;
    }

    if (!frontendOnly) {
        saveRegistrationToDatabase(newUser, fullName, password)
            .then(savedUser => completeLocalRegistration(savedUser))
            .catch(error => {
                console.error('Registration database error:', error);
                alert(getFriendlyRegistrationError(error));
            });
        return;
    }

    completeLocalRegistration({ ...newUser, password });
}

// Runtime slice from daawah.js: completeLocalRegistration.
async function completeLocalRegistration(newUser, options = {}) {
    const needsApproval = (newUser.role || 'student') !== 'student';
    const shouldStoreLocalPassword = Boolean(frontendOnly && !window.SupabaseBackend?.enabled && newUser.password);
    const { passportPhotoFile, password: localPassword, ...storableUserBase } = {
        ...newUser,
        status: newUser.status || (needsApproval ? 'Pending' : 'Active'),
        accountStatus: newUser.accountStatus || (needsApproval ? 'Pending Approval' : 'Active'),
        membershipStatus: newUser.membershipStatus || (needsApproval ? 'Pending Approval' : 'Membership Pending'),
        membershipStage: newUser.membershipStage || (needsApproval ? 'approval_pending' : 'registered_student'),
        membershipPaymentStatus: newUser.membershipPaymentStatus || 'No payment',
        registrationSource: newUser.registrationSource || 'public-web',
        registrationHost: location.host,
        registrationUserAgent: navigator.userAgent,
        registeredAt: newUser.registeredAt || new Date().toISOString()
    };
    const storableUser = shouldStoreLocalPassword
        ? { ...storableUserBase, password: localPassword }
        : storableUserBase;
    const existingIndex = allMembers.findIndex(member =>
        member.studentId === storableUser.studentId ||
        member.email === storableUser.email ||
        member.username === storableUser.username
    );

    if (existingIndex >= 0) {
        allMembers[existingIndex] = { ...allMembers[existingIndex], ...storableUser };
    } else {
        allMembers.push(storableUser);
    }

    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    const cloudSyncRequired = Boolean(window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.());
    try {
        await saveSharedMemberStore(storableUser, { requireCloud: cloudSyncRequired });
    } catch (error) {
        alert(error.message || 'Account was created, but the backend member profile could not be saved. Please contact admin before registering again.');
        return;
    }

    if (options.databaseSynced === false) {
        showNotification(options.message, 'warning');
    }
    if (!needsApproval) {
        localStorage.setItem(`studentOnboarding:${storableUser.email || storableUser.studentId || storableUser.username}`, '1');
    }
    rememberPortalAudience('student');

    alert(needsApproval
        ? 'Registration submitted. Admin must approve this role before login.'
        : 'Student account created. You can login now. Membership becomes active after dues payment.');
    document.getElementById('registrationForm').reset();
    document.querySelector('[data-bs-target="#loginTab"]').click();
}

// Runtime slice from daawah.js: saveRegistrationToDatabase.
function saveRegistrationToDatabase(newUser, fullName, password) {
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '-';

    return fetch('supabase-required-endpoint?action=registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: newUser.studentId,
            email: newUser.email,
            role: newUser.role
        })
    })
    .then(response => parseJsonResponse(response))
    .then(userResult => {
        if (!userResult.success) {
            throw new Error(userResult.message || 'Could not create user in database');
        }
        const userId = userResult.data.user_id;
        const studentData = new FormData();
        Object.entries({
            user_id: userId,
            first_name: firstName || fullName,
            last_name: lastName,
            student_id: newUser.studentId,
            email: newUser.email,
            phone: newUser.phone,
            gender: newUser.gender,
            nationality: newUser.nationality,
            school: newUser.school,
            course: newUser.course,
            year_of_study: newUser.yearOfStudy,
            semester: newUser.semester,
            degree_type: 'degree',
            passport_photo: newUser.passportPhoto,
            home_address: newUser.homeAddress,
            emergency_contact: newUser.emergencyContact,
            emergency_contact_phone: '',
            local_guardian: newUser.localGuardian,
            local_guardian_phone: ''
        }).forEach(([key, value]) => studentData.append(key, value || ''));
        if (newUser.passportPhotoFile) {
            studentData.append('passport_photo_file', newUser.passportPhotoFile);
        }

        return fetch('supabase-required-endpoint?action=registerStudent', {
            method: 'POST',
            body: studentData
        })
        .then(response => parseJsonResponse(response))
        .then(studentResult => {
            if (!studentResult.success) {
                throw new Error(studentResult.message || 'Could not create student record in database');
            }
            const uploadedPath = studentResult.data.passport_photo || '';
            return {
                ...newUser,
                dbUserId: userId,
                dbStudentId: studentResult.data.student_id,
                status: (newUser.role || 'student') === 'student' ? 'Active' : 'Pending',
                password: '',
                passportPhotoData: uploadedPath ? '' : newUser.passportPhotoData,
                passport_photo: uploadedPath || newUser.passport_photo || ''
            };
        });
    });
}

// Runtime slice from daawah.js: handleForgotPassword.
function handleForgotPassword(e) {
    e.preventDefault();
    sendResetLink();
}

// Runtime slice from daawah.js: showForgotPassword.
function showForgotPassword() {
    resetForgotPasswordModal();
    const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    modal.show();
}

// Runtime slice from daawah.js: resetForgotPasswordModal.
function resetForgotPasswordModal() {
    resetPasswordEmail = '';
    document.getElementById('forgotPasswordForm')?.reset();
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Send Code';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    if (resendButton) resendButton.classList.add('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    if (help) help.textContent = 'Use the same email you registered with. A verification code will be sent there.';
}

// Runtime slice from daawah.js: showResetCodeStep.
function showResetCodeStep(email, result) {
    resetPasswordEmail = email;
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Set New Password';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    resendButton?.classList.remove('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    const devCode = result?.data?.dev_code ? ` (Debug: ${result.data.dev_code})` : '';
    if (help) {
        help.textContent = `A verification code has been sent to ${email}. Please check your inbox. ${devCode}`;
    }
}

// Runtime slice from daawah.js: readLocalResetCodes.
function readLocalResetCodes() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_RESET_CODE_STORE) || '{}');
    } catch (error) {
        return {};
    }
}

// Runtime slice from daawah.js: writeLocalResetCodes.
function writeLocalResetCodes(codes) {
    localStorage.setItem(LOCAL_RESET_CODE_STORE, JSON.stringify(codes || {}));
}

// Runtime slice from daawah.js: createLocalResetCode.
function createLocalResetCode(email) {
    const lookup = String(email || '').trim().toLowerCase();
    const member = allMembers.find(item => String(item.email || '').trim().toLowerCase() === lookup);
    if (!member) {
        throw new Error('No local account was found for this email.');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = readLocalResetCodes();
    codes[lookup] = {
        code,
        expiresAt: Date.now() + LOCAL_RESET_CODE_TTL_MS
    };
    writeLocalResetCodes(codes);
    return { success: true, data: { mail_sent: false, dev_code: code } };
}

// Runtime slice from daawah.js: resetLocalPasswordWithCode.
function resetLocalPasswordWithCode(email, code, password) {
    const lookup = String(email || '').trim().toLowerCase();
    const codes = readLocalResetCodes();
    const request = codes[lookup];
    if (!request || request.code !== code) {
        throw new Error('Invalid reset code. Request a new 6-digit code and try again.');
    }
    if (Date.now() > Number(request.expiresAt || 0)) {
        delete codes[lookup];
        writeLocalResetCodes(codes);
        throw new Error('Reset code expired. Request a new 6-digit code.');
    }
    allMembers = allMembers.map(member =>
        String(member.email || '').trim().toLowerCase() === lookup
            ? { ...member, password, updated_at: new Date().toISOString() }
            : member
    );
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    delete codes[lookup];
    writeLocalResetCodes(codes);
    return { success: true };
}

// Runtime slice from daawah.js: togglePasswordVisibility.
function togglePasswordVisibility() {
    togglePasswordField('loginPassword', 'togglePassword');
}

// Runtime slice from daawah.js: togglePasswordField.
function togglePasswordField(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(buttonId);
    if (!passwordInput || !toggleBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.setAttribute('aria-label', 'Show password');
    }
}

// Runtime slice from daawah.js: sendResetLink.
function sendResetLink() {
    if (resetPasswordEmail) {
        submitPasswordResetWithCode();
        return;
    }

    const actionButton = document.getElementById('forgotPasswordActionButton');
    const resendButton = document.getElementById('forgotPasswordResendButton');
    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) {
        showNotification('Please enter your email address.', 'warning');
        return;
    }

    if (actionButton?.disabled) return;
    if (actionButton) {
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    if (resendButton) resendButton.disabled = true;

    const unlockResetButtons = () => {
        if (actionButton) {
            actionButton.disabled = false;
            actionButton.textContent = resetPasswordEmail ? 'Set New Password' : 'Send Code';
        }
        if (resendButton) resendButton.disabled = false;
    };

    if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
        window.SupabaseBackend.sendPasswordResetEmail(email)
            .then(() => {
                showNotification('Password reset email sent. Open your email link to set a new password.', 'success');
                bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'))?.hide();
                resetForgotPasswordModal();
            })
            .catch(error => showNotification(error.message || 'Could not send reset email.', 'danger'))
            .finally(unlockResetButtons);
        return;
    }

    const resetRequest = frontendOnly
        ? Promise.resolve(createLocalResetCode(email))
        : fetch('supabase-required-endpoint?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).then(response => parseJsonResponse(response));

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not record reset request');
        }
        showNotification(result.data?.mail_sent ? 'Verification code sent to your email.' : 'Code created. If email is not delivered, contact admin to check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not send reset code', 'danger'))
    .finally(unlockResetButtons);
}

// Runtime slice from daawah.js: resendResetCode.
function resendResetCode() {
    const actionButton = document.getElementById('forgotPasswordActionButton');
    const resendButton = document.getElementById('forgotPasswordResendButton');
    const email = resetPasswordEmail || document.getElementById('forgotEmail')?.value.trim();
    if (!email) {
        showNotification('Enter your registered email first.', 'warning');
        return;
    }

    if (resendButton?.disabled) return;
    if (resendButton) {
        resendButton.disabled = true;
        resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    if (actionButton) actionButton.disabled = true;

    const unlockResetButtons = () => {
        if (resendButton) {
            resendButton.disabled = false;
            resendButton.textContent = 'Resend Code';
        }
        if (actionButton) actionButton.disabled = false;
    };

    if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
        window.SupabaseBackend.sendPasswordResetEmail(email)
            .then(() => showNotification('New password reset email sent.', 'success'))
            .catch(error => showNotification(error.message || 'Could not resend reset email.', 'danger'))
            .finally(unlockResetButtons);
        return;
    }

    const resetRequest = frontendOnly
        ? Promise.resolve(createLocalResetCode(email))
        : fetch('supabase-required-endpoint?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).then(response => parseJsonResponse(response));

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not resend reset code');
        }
        document.getElementById('forgotCode').value = '';
        showNotification(result.data?.mail_sent ? 'New verification code sent.' : 'New code created. If email is not delivered, check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not resend reset code', 'danger'))
    .finally(unlockResetButtons);
}

// Runtime slice from daawah.js: submitPasswordResetWithCode.
function submitPasswordResetWithCode() {
    const code = document.getElementById('forgotCode').value.trim();
    const password = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;

    if (!/^\d{6}$/.test(code)) {
        showNotification('Enter the 6-digit code sent to your email.', 'warning');
        return;
    }
    if (!password || password.length < 6) {
        showNotification('New password must be at least 6 characters.', 'warning');
        return;
    }
    if (password !== confirmPassword) {
        showNotification('New passwords do not match.', 'warning');
        return;
    }

    const resetRequest = frontendOnly
        ? Promise.resolve(resetLocalPasswordWithCode(resetPasswordEmail, code, password))
        : fetch('supabase-required-endpoint?action=resetPasswordWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: resetPasswordEmail,
            code,
            password
        })
    }).then(response => parseJsonResponse(response));

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not reset password');
        }
        showNotification('Password reset successfully. Login with your new password.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'))?.hide();
        resetForgotPasswordModal();
    })
    .catch(error => showNotification(error.message || 'Could not reset password', 'danger'));
}

// DASHBOARD

// Runtime slice from daawah.js: showDashboard.
function showDashboard() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userNameDisplay').textContent = currentUser.name || currentUser.username;

    configureRoleMenus();
    switchView('dashboard');
    startRoleDashboardLiveRefresh();
    showInstallAppButton();
    updateInstallAppBanner();
    const onboardingKey = `studentOnboarding:${currentUser.email || currentUser.studentId || currentUser.username}`;
    if (localStorage.getItem(onboardingKey) === '1') {
        localStorage.removeItem(onboardingKey);
        setTimeout(() => showNotification('Welcome. Complete your profile, submit dues payment, then apply or print your membership card after approval.', 'info'), 700);
    }
    setTimeout(() => {
        loadDashboardData();
        initializeCharts();
    }, 500);
}

// Runtime slice from daawah.js: startRoleDashboardLiveRefresh.
function startRoleDashboardLiveRefresh() {
    if (roleDashboardRefreshTimer) return;
    startRoleRealtimeListeners();
    refreshRoleDashboardSharedData();
    roleDashboardRefreshTimer = setInterval(refreshRoleDashboardSharedData, ROLE_DASHBOARD_REFRESH_MS);
}

// Runtime slice from daawah.js: stopRoleDashboardLiveRefresh.
function stopRoleDashboardLiveRefresh() {
    stopRoleRealtimeListeners();
    if (!roleDashboardRefreshTimer) return;
    clearInterval(roleDashboardRefreshTimer);
    roleDashboardRefreshTimer = null;
    roleDashboardRefreshRunning = false;
}

// Runtime slice from daawah.js: stopRoleRealtimeListeners.
function stopRoleRealtimeListeners() {
    roleRealtimeUnsubscribers.forEach(unsubscribe => {
        try {
            unsubscribe?.();
        } catch (error) {
            console.warn('Realtime dashboard unsubscribe failed:', error);
        }
    });
    roleRealtimeUnsubscribers = [];
}

// Runtime slice from daawah.js: startRoleRealtimeListeners.
function startRoleRealtimeListeners() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.() || roleRealtimeUnsubscribers.length) return;
    window.SupabaseBackend.watchStores?.(LIVE_PUBLIC_STORE_KEYS, (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
        refreshActiveRoleView();
    }).then(unsubscribe => {
        roleRealtimeUnsubscribers.push(unsubscribe);
    }).catch(error => console.warn('Public realtime listener unavailable; using live refresh fallback:', error));

    if (hasPermission('manage_members')) {
        window.SupabaseBackend.watchCollection?.('members', records => {
            allMembers = records;
            localStorage.setItem('allMembers', JSON.stringify(allMembers));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Member realtime listener unavailable; using live refresh fallback:', error));
    }

    if (hasPermission('manage_payments')) {
        ['payments', 'donations'].forEach(collection => {
            window.SupabaseBackend.watchCollection?.(collection, records => {
                if (collection === 'payments') {
                    payments = records;
                } else {
                    donations = records;
                }
                localStorage.setItem(collection, JSON.stringify(records));
                refreshActiveRoleView();
            }).then(unsubscribe => {
                roleRealtimeUnsubscribers.push(unsubscribe);
            }).catch(error => console.warn(`${collection} realtime listener unavailable; using live refresh fallback:`, error));
        });
    } else {
        startOwnedFinanceRealtimeListeners('payments');
        startOwnedFinanceRealtimeListeners('donations');
    }

    if (hasPermission('manage_welfare')) {
        window.SupabaseBackend.watchCollection?.('welfareRequests', records => {
            welfareRequests = records;
            localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Welfare realtime listener unavailable; using live refresh fallback:', error));
    }

    if (hasPermission('manage_events')) {
        window.SupabaseBackend.watchCollection?.('eventRegistrations', records => {
            registeredEvents = records;
            localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Event realtime listener unavailable; using live refresh fallback:', error));
    }
}

// Runtime slice from daawah.js: startOwnedFinanceRealtimeListeners.
function startOwnedFinanceRealtimeListeners(collection) {
    const records = collection === 'payments' ? payments : donations;
    const docIds = records.map(record => record.supabaseId).filter(Boolean);
    if (!docIds.length) return;
    window.SupabaseBackend.watchDocuments?.(collection, docIds, record => {
        const currentRecords = collection === 'payments' ? payments : donations;
        const nextRecords = currentRecords.map(item =>
            item.supabaseId === record.supabaseId ? { ...item, ...record } : item
        );
        if (collection === 'payments') {
            payments = nextRecords;
        } else {
            donations = nextRecords;
        }
        localStorage.setItem(collection, JSON.stringify(nextRecords));
        refreshActiveRoleView();
    }).then(unsubscribe => {
        roleRealtimeUnsubscribers.push(unsubscribe);
    }).catch(error => console.warn(`${collection} owned realtime listener unavailable; using live refresh fallback:`, error));
}

// Runtime slice from daawah.js: refreshRoleDashboardSharedData.
async function refreshRoleDashboardSharedData() {
    if (!currentUser || roleDashboardRefreshRunning) return;
    roleDashboardRefreshRunning = true;
    try {
        await refreshLocalRoleStores();
        if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
            await refreshCloudRoleStores();
        }
        refreshActiveRoleView();
    } catch (error) {
        console.warn('Role dashboard live refresh failed:', error);
    } finally {
        roleDashboardRefreshRunning = false;
    }
}

// Runtime slice from daawah.js: refreshLocalRoleStores.
function refreshLocalRoleStores() {
    allMembers = readList('allMembers');
    payments = readList('payments');
    donations = readList('donations');
    welfareRequests = readList('welfareRequests');
    registeredEvents = readList('registeredEvents');
    return Promise.resolve();
}

// Runtime slice from daawah.js: refreshCloudRoleStores.
async function refreshCloudRoleStores() {
    const tasks = [];
    tasks.push(window.SupabaseBackend.loadStores(LIVE_PUBLIC_STORE_KEYS)
        .then(stores => {
            Object.entries(stores || {}).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
        })
        .catch(error => console.warn('Public content live refresh skipped:', error)));
    if (hasPermission('manage_members')) {
        tasks.push(window.SupabaseBackend.listMembers()
            .then(members => {
                if (Array.isArray(members)) {
                    allMembers = members;
                    localStorage.setItem('allMembers', JSON.stringify(allMembers));
                }
            })
            .catch(error => console.warn('Member live refresh skipped:', error)));
    } else {
        tasks.push(window.SupabaseBackend.loadMyMember?.()
            .then(member => {
                if (member) {
                    allMembers = mergeMemberIntoList(allMembers, member);
                    currentUser = { ...currentUser, ...member };
                    localStorage.setItem('allMembers', JSON.stringify(allMembers));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            })
            .catch(error => console.warn('Profile live refresh skipped:', error)));
    }
    if (hasPermission('manage_payments')) {
        tasks.push(window.SupabaseBackend.listRecords('payments')
            .then(records => {
                if (Array.isArray(records)) {
                    payments = records;
                    localStorage.setItem('payments', JSON.stringify(payments));
                }
            })
            .catch(error => console.warn('Payment live refresh skipped:', error)));
        tasks.push(window.SupabaseBackend.listRecords('donations')
            .then(records => {
                if (Array.isArray(records)) {
                    donations = records;
                    localStorage.setItem('donations', JSON.stringify(donations));
                }
            })
            .catch(error => console.warn('Donation live refresh skipped:', error)));
    } else {
        tasks.push(refreshOwnedCloudRecords('payments', payments)
            .then(records => {
                if (records) {
                    payments = records;
                    localStorage.setItem('payments', JSON.stringify(payments));
                }
            }));
        tasks.push(refreshOwnedCloudRecords('donations', donations)
            .then(records => {
                if (records) {
                    donations = records;
                    localStorage.setItem('donations', JSON.stringify(donations));
                }
            }));
    }
    if (hasPermission('manage_welfare')) {
        tasks.push(window.SupabaseBackend.listRecords('welfareRequests')
            .then(records => {
                if (Array.isArray(records)) {
                    welfareRequests = records;
                    localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
                }
            })
            .catch(error => console.warn('Welfare live refresh skipped:', error)));
    }
    if (hasPermission('manage_events')) {
        tasks.push(window.SupabaseBackend.listRecords('eventRegistrations')
            .then(records => {
                if (Array.isArray(records)) {
                    registeredEvents = records;
                    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
                }
            })
            .catch(error => console.warn('Event registration live refresh skipped:', error)));
    }
    await Promise.all(tasks);
}

// Runtime slice from daawah.js: refreshOwnedCloudRecords.
async function refreshOwnedCloudRecords(collection, records) {
    if (!window.SupabaseBackend?.loadRecord || !Array.isArray(records) || !records.some(record => record.supabaseId)) {
        return null;
    }
    const refreshed = await Promise.all(records.map(async record => {
        if (!record.supabaseId) return record;
        return window.SupabaseBackend.loadRecord(collection, record.supabaseId)
            .then(remoteRecord => remoteRecord ? { ...record, ...remoteRecord } : record)
            .catch(error => {
                console.warn(`${collection} record live refresh skipped:`, error);
                return record;
            });
    }));
    return refreshed;
}

// Runtime slice from daawah.js: refreshActiveRoleView.
function refreshActiveRoleView() {
    const activeView = document.querySelector('.view-container.active');
    const viewName = activeView?.id?.replace(/View$/, '') || 'dashboard';
    if (viewName === 'dashboard') {
        loadDashboardData();
        return;
    }
    if (['memberDatabase', 'dues', 'donations', 'reports', 'adminWelfare', 'events'].includes(viewName)) {
        loadViewData(viewName);
    } else {
        updateDashboardStats();
    }
}

// VIEW SWITCHING

// Runtime slice from daawah.js: switchView.
function switchView(viewName) {
    const requiredPermission = getViewPermission(viewName);
    if (requiredPermission && !hasPermission(requiredPermission)) {
        showNotification('Your role does not have access to that section.', 'warning');
        switchView('dashboard');
        return;
    }

    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
    }

    const activeEvent = typeof event !== 'undefined' ? event : null;
    if (activeEvent && activeEvent.target && activeEvent.target.classList) {
        activeEvent.target.classList.add('active');
    }

    loadViewData(viewName);
}

window.showDashboard = showDashboard;
window.switchView = switchView;

// Runtime slice from daawah.js: getViewPermission.
function getViewPermission(viewName) {
    const viewPermissions = {
        profile: 'view_profile',
        membershipStatus: 'view_membership',
        prayer: 'view_prayer_times',
        events: 'register_events',
        activities: 'view_announcements',
        announcements: 'view_announcements',
        resources: 'view_resources',
        research: 'view_resources',
        settings: null,
        welfare: 'welfare_request',
        dues: 'view_payments',
        donations: 'view_donations',
        volunteer: 'register_volunteer',
        memberDatabase: 'manage_members',
        adminEvents: 'manage_events',
        adminWelfare: 'manage_welfare',
        leadership: 'manage_leadership',
        reports: 'view_reports',
        adminGallery: 'manage_gallery',
        adminContact: 'manage_contact',
        officerHadiths: 'manage_hadiths'
    };

    return viewPermissions[viewName] || null;
}

// Runtime slice from daawah.js: configureRoleMenus.
function configureRoleMenus() {
    const roleAdminMenu = document.getElementById('roleAdminMenu');
    const roleToolLinks = document.querySelectorAll('.role-tool-link');
    let visibleRoleTools = 0;

    roleToolLinks.forEach(link => {
        const permission = link.dataset.permission;
        const canUse = permission && hasPermission(permission);
        link.style.display = canUse ? '' : 'none';
        if (canUse) {
            visibleRoleTools++;
        }
    });

    if (roleAdminMenu) {
        roleAdminMenu.style.display = visibleRoleTools > 0 ? '' : 'none';
    }
}

// Runtime slice from daawah.js: loadViewData.
function loadViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'membershipStatus':
            loadMembershipStatus();
            break;
        case 'prayer':
            loadPrayerTimes();
            break;
        case 'events':
            loadEventsData();
            break;
        case 'activities':
            loadActivitiesData();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'resources':
            loadResources();
            break;
        case 'research':
            loadResearchAssistant();
            break;
        case 'settings':
            loadWorkspaceSettings();
            break;
        case 'welfare':
            loadWelfareData();
            break;
        case 'dues':
            loadDuesData();
            break;
        case 'donations':
            loadDonationsData();
            break;
        case 'volunteer':
            loadVolunteerData();
            break;
        case 'memberDatabase':
            loadMemberDatabase();
            break;
        case 'adminEvents':
            loadAdminEvents();
            break;
        case 'adminWelfare':
            loadAdminWelfare();
            break;
        case 'leadership':
            loadLeadership();
            break;
        case 'reports':
            loadReportsData();
            setTimeout(() => initializeCharts(), 300);
            break;
        case 'adminGallery':
            loadAdminGallery();
            break;
        case 'adminContact':
            loadAdminContact();
            break;
        case 'officerHadiths':
            loadOfficerHadiths();
            break;
    }
}

// ACTIVITIES

// Runtime slice from daawah.js: loadActivitiesData.
function loadActivitiesData() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(() => {
        const managerPanel = document.getElementById('activityManagerPanel');
        managerPanel?.classList.toggle('d-none', !hasPermission('manage_activities'));
        renderActivityGroup('daily', 'dailyActivitiesList');
        renderActivityGroup('weekly', 'weeklyActivitiesList');
        renderActivityGroup('monthly', 'monthlyActivitiesList');
    });
}

// Runtime slice from daawah.js: loadPublicActivitiesPreview.
function loadPublicActivitiesPreview() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(renderPublicActivitiesPreview);
}

// Runtime slice from daawah.js: loadActivitiesFromApi.
function loadActivitiesFromApi() {
    if (frontendOnly) {
        databaseActivities = [];
        return Promise.resolve([]);
    }
    if (databaseActivities.length && Date.now() - activitiesLoadedAt < 5 * 60 * 1000) {
        return Promise.resolve(databaseActivities);
    }

    return fetch('supabase-required-endpoint?action=getActivities', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not load activities');
            }
            databaseActivities = (result.data || []).map(normalizeDatabaseActivity);
            activitiesLoadedAt = Date.now();
            return databaseActivities;
        })
        .catch(error => {
            console.warn('Database activities unavailable:', error);
            databaseActivities = [];
            return [];
        });
}

// Runtime slice from daawah.js: normalizeDatabaseActivity.
function normalizeDatabaseActivity(activity) {
    return {
        id: `db-${activity.id}`,
        dbActivityId: Number(activity.id),
        source: 'database',
        title: activity.title || "UMMA University Dawah Team Activity",
        period: normalizeActivityPeriod(activity.period),
        date: activity.activity_date || activity.date || '',
        time: activity.activity_time || activity.time || '',
        schedule: activity.schedule_note || activity.schedule || '',
        location: activity.location || 'Location will be announced',
        description: activity.description || 'Activity details will be shared soon.',
        createdBy: activity.created_by_name || ''
    };
}

// Runtime slice from daawah.js: getActivities.
function getActivities() {
    const savedActivities = readList('adminActivities').map(activity => ({
        ...activity,
        source: activity.source || 'local',
        period: normalizeActivityPeriod(activity.period)
    }));
    return [...databaseActivities, ...savedActivities, ...defaultActivities].filter((activity, index, list) => {
        const key = `${activity.period}-${activity.id || activity.title}`;
        return index === list.findIndex(item => `${item.period}-${item.id || item.title}` === key);
    });
}

// Runtime slice from daawah.js: normalizeActivityPeriod.
function normalizeActivityPeriod(value = '', dateValue = '') {
    const text = String(value || '').toLowerCase();
    if (text.includes('daily')) return 'daily';
    if (text.includes('weekly')) return 'weekly';
    if (text.includes('monthly')) return 'monthly';

    const parsedDate = dateValue ? new Date(dateValue) : null;
    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        const daysAway = Math.ceil((parsedDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysAway <= 1) return 'daily';
        if (daysAway <= 7) return 'weekly';
    }

    return 'monthly';
}

// Runtime slice from daawah.js: formatActivityDateTime.
function formatActivityDateTime(activity = {}) {
    const dateText = activity.date ? formatDisplayDate(activity.date) : '';
    const timeText = activity.time ? formatDisplayTime(activity.time) : '';
    const dateTimeText = [dateText, timeText].filter(Boolean).join(' at ');
    return dateTimeText || activity.schedule || 'Schedule will be announced';
}

// Runtime slice from daawah.js: formatDisplayDate.
function formatDisplayDate(value) {
    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Runtime slice from daawah.js: formatDisplayTime.
function formatDisplayTime(value) {
    const [hours = '', minutes = ''] = String(value).split(':');
    if (!hours || !minutes) return value;
    const parsedDate = new Date();
    parsedDate.setHours(Number(hours), Number(minutes), 0, 0);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Runtime slice from daawah.js: renderActivityGroup.
function renderActivityGroup(period, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const activities = getActivities().filter(activity => activity.period === period);
    if (!activities.length) {
        container.innerHTML = renderEmptyState('fa-calendar-plus', 'No activities yet', 'Organizer can add activities for this period.');
        return;
    }

    container.innerHTML = activities.map(activity => renderActivityCard(activity, false)).join('');
}

// Runtime slice from daawah.js: renderPublicActivitiesPreview.
function renderPublicActivitiesPreview() {
    const container = document.getElementById('publicActivitiesPreview');
    if (!container) return;

    const periods = ['daily', 'weekly', 'monthly'];
    container.innerHTML = periods.map(period => {
        const activities = getActivities().filter(item => item.period === period);
        if (!activities.length) return '';
        const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
        return `
            <section class="activity-preview-group activity-preview-group--${period}">
                <div class="activity-preview-group__header">
                    <span class="activity-preview-group__icon"><i class="fas ${getActivityPeriodIcon(period)}"></i></span>
                    <div>
                        <h3>${periodLabel}</h3>
                        <p>${activities.length} ${activities.length === 1 ? 'activity' : 'activities'} available</p>
                    </div>
                </div>
                <div class="activity-preview-group__list">
                    ${activities.map(activity => renderActivityCard(activity, true)).join('')}
                </div>
            </section>
        `;
    }).join('') || '<div class="text-center text-muted">Activities will be updated soon.</div>';
}

// Runtime slice from daawah.js: renderEmptyState.
function renderEmptyState(icon, title, message, actionLabel = '', action = '') {
    return `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h5>${escapeHtml(title)}</h5>
            <p class="text-muted mb-0">${escapeHtml(message)}</p>
            ${actionLabel && action ? `<button type="button" class="btn btn-sm btn-outline-primary mt-3" onclick="${action}">${escapeHtml(actionLabel)}</button>` : ''}
        </div>
    `;
}

// Runtime slice from daawah.js: getActivityPeriodIcon.
function getActivityPeriodIcon(period) {
    if (period === 'daily') return 'fa-sun';
    if (period === 'weekly') return 'fa-calendar-week';
    return 'fa-calendar-days';
}

// Runtime slice from daawah.js: renderActivityCard.
function renderActivityCard(activity, compact = false) {
    const periodLabel = activity.period ? activity.period.charAt(0).toUpperCase() + activity.period.slice(1) : 'Activity';
    const dateTimeLabel = formatActivityDateTime(activity);
    const scheduleNote = activity.schedule && activity.schedule !== dateTimeLabel ? activity.schedule : '';
    const canDelete = !compact && hasPermission('manage_activities') && (activity.source === 'database' || String(activity.id || '').startsWith('custom-'));
    return `
        <div class="activity-card ${compact ? 'activity-card--public' : ''}">
            <div class="activity-card__top">
                <span class="activity-badge">${escapeHtml(periodLabel)}</span>
                <span class="activity-card__schedule"><i class="fas fa-calendar-days"></i> ${escapeHtml(dateTimeLabel)}</span>
            </div>
            <h5>${escapeHtml(activity.title || "UMMA University Dawah Team Activity")}</h5>
            <p>${escapeHtml(activity.description || 'Activity details will be shared soon.')}</p>
            <div class="activity-card__meta">
                <span><i class="fas fa-location-dot"></i> ${escapeHtml(activity.location || 'Location will be announced')}</span>
                ${scheduleNote ? `<span><i class="fas fa-clock"></i> ${escapeHtml(scheduleNote)}</span>` : ''}
                ${canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteActivity('${escapeHtml(activity.id)}')"><i class="fas fa-trash"></i> Remove</button>` : ''}
            </div>
        </div>
    `;
}

// Runtime slice from daawah.js: saveActivity.
function saveActivity(event) {
    event.preventDefault();
    if (!hasPermission('manage_activities')) {
        showNotification('Only the Organizer can add activities.', 'warning');
        return;
    }

    const activity = {
        id: `custom-${Date.now()}`,
        title: document.getElementById('activityTitle').value.trim(),
        period: document.getElementById('activityPeriod').value,
        date: document.getElementById('activityDate').value,
        time: document.getElementById('activityTime').value,
        schedule: document.getElementById('activitySchedule').value.trim(),
        location: document.getElementById('activityLocation').value.trim(),
        description: document.getElementById('activityDescription').value.trim()
    };

    if (!activity.title || !activity.period || !activity.date || !activity.time || !activity.location || !activity.description) {
        showNotification('Please fill in all activity fields.', 'warning');
        return;
    }

    if (!frontendOnly) {
        saveActivityToDatabase(activity)
            .then(() => {
                document.getElementById('activityForm').reset();
                logLocalRoleActivity('saveActivity', { title: activity.title, period: activity.period, date: activity.date, time: activity.time, schedule: activity.schedule });
                return loadActivitiesFromApi();
            })
            .then(() => {
                loadActivitiesData();
                renderPublicActivitiesPreview();
                renderDashboardActivityCalendar();
                showNotification('Activity saved to the database.', 'success');
            })
            .catch(error => {
                console.error('Activity database save error:', error);
                showNotification(error.message || 'Could not save activity to database.', 'danger');
            });
        return;
    }

    const savedActivities = readList('adminActivities');
    savedActivities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(savedActivities));
    document.getElementById('activityForm').reset();
    logLocalRoleActivity('saveActivity', { title: activity.title, period: activity.period, date: activity.date, time: activity.time, schedule: activity.schedule });
    loadActivitiesData();
    renderPublicActivitiesPreview();
    showNotification('Activity added successfully.', 'success');
}

// Runtime slice from daawah.js: saveActivityToDatabase.
function saveActivityToDatabase(activity) {
    return fetch('supabase-required-endpoint?action=createActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({
            title: activity.title,
            period: activity.period,
            date: activity.date,
            time: activity.time,
            schedule: activity.schedule,
            location: activity.location,
            description: activity.description,
            created_by: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0
        }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not save activity');
        }
        return result.data || {};
    });
}

// Runtime slice from daawah.js: deleteActivity.
function deleteActivity(activityId) {
    if (!hasPermission('manage_activities')) {
        showNotification('Only the Organizer can remove activities.', 'warning');
        return;
    }
    if (!confirm('Remove this activity?')) return;

    const activity = getActivities().find(item => String(item.id) === String(activityId));
    if (activity?.source === 'database' && activity.dbActivityId) {
        fetch(`supabase-required-endpoint?action=deleteActivity&id=${encodeURIComponent(activity.dbActivityId)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(authPayload({ activity_id: activity.dbActivityId }))
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not delete activity');
            logLocalRoleActivity('deleteActivity', { activity_id: activity.dbActivityId });
            return loadActivitiesFromApi();
        })
        .then(() => {
            loadActivitiesData();
            renderPublicActivitiesPreview();
            renderDashboardActivityCalendar();
            showNotification('Activity deleted from the database.', 'success');
        })
        .catch(error => showNotification(error.message || 'Could not delete activity', 'danger'));
        return;
    }

    const savedActivities = readList('adminActivities').filter(activity => activity.id !== activityId);
    localStorage.setItem('adminActivities', JSON.stringify(savedActivities));
    logLocalRoleActivity('deleteActivity', { activity_id: activityId });
    loadActivitiesData();
    renderPublicActivitiesPreview();
    showNotification('Activity removed.', 'success');
}

// PROFILE

// Runtime slice from daawah.js: loadProfileData.
function loadProfileData() {
    const storedProfile = readStoredObject('profileData', {});
    const profileData = currentUser || storedProfile || {};
    const profilePhoto = getMemberPhoto(profileData);
    const profilePhotoImage = document.getElementById('profilePhotoImage');
    const profilePhotoIcon = document.getElementById('profilePhotoIcon');

    if (profilePhoto && profilePhotoImage) {
        profilePhotoImage.src = profilePhoto;
        profilePhotoImage.classList.remove('d-none');
        profilePhotoIcon?.classList.add('d-none');
    } else if (profilePhotoImage) {
        profilePhotoImage.src = '';
        profilePhotoImage.classList.add('d-none');
        profilePhotoIcon?.classList.remove('d-none');
    }

    document.getElementById('profileName').textContent = profileData.fullName || profileData.name || 'Student Name';
    document.getElementById('profileFullName').textContent = profileData.fullName || profileData.name || '-';
    document.getElementById('profileStudentId').textContent = profileData.studentId || profileData.username || '-';
    document.getElementById('profileStudentIdDetail').textContent = profileData.studentId || profileData.username || '-';
    document.getElementById('profileSchool').textContent = profileData.school || '-';
    document.getElementById('profileDepartment').textContent = profileData.course || '-';
    document.getElementById('profileYear').textContent = profileData.yearOfStudy || '-';
    document.getElementById('profileSemester').textContent = profileData.semester || '-';
    document.getElementById('profileGender').textContent = profileData.gender || '-';
    document.getElementById('profileEmail').textContent = profileData.email || '-';
    document.getElementById('profilePhone').textContent = profileData.phone || '-';
    document.getElementById('profileAddress').textContent = profileData.homeAddress || '-';
    document.getElementById('profileNationality').textContent = profileData.nationality || '-';
    document.getElementById('profileEmergencyContact').textContent = profileData.emergencyContact || '-';
    document.getElementById('profileLocalGuardian').textContent = profileData.localGuardian || '-';
}

// Runtime slice from daawah.js: getMemberPhoto.
function getMemberPhoto(member) {
    return resolveAppAsset(member?.passportPhotoData || member?.photoData || member?.photo_url || member?.passport_photo || '');
}

// Runtime slice from daawah.js: resolveAppAsset.
function resolveAppAsset(path) {
    if (!path) return '';
    if (/^(data:|blob:|https?:)/i.test(path)) return path;
    if (useLegacyPhpApi) {
        return LEGACY_PHP_BASE_URL + String(path).replace(/^\/+/, '');
    }
    return path;
}

// Runtime slice from daawah.js: renderMemberPhoto.
function renderMemberPhoto(member) {
    const photo = getMemberPhoto(member);
    if (!photo) {
        return '<i class="fas fa-user-circle fa-2x text-muted"></i>';
    }
    return `<img class="member-photo-thumb" src="${photo}" alt="${member.fullName || member.name || member.username || 'Member photo'}">`;
}

// Runtime slice from daawah.js: editProfile.
function editProfile() {
    const profileData = currentUser || {};
    document.getElementById('editFullName').value = profileData.fullName || profileData.name || '';
    document.getElementById('editStudentId').value = profileData.studentId || profileData.username || '';
    document.getElementById('editEmail').value = profileData.email || '';
    document.getElementById('editPhone').value = profileData.phone || '';
    document.getElementById('editSchool').value = profileData.school || '';
    renderCourseOptions('editCourse', profileData.school || '', profileData.course || '');
    document.getElementById('editYearOfStudy').value = profileData.yearOfStudy || '';
    updateSemesterAvailability('editYearOfStudy', 'editSemester');
    document.getElementById('editSemester').value = profileData.semester || '';
    document.getElementById('editGender').value = profileData.gender || 'male';
    document.getElementById('editNationality').value = profileData.nationality || '';
    document.getElementById('editEmergencyContact').value = profileData.emergencyContact || '';
    document.getElementById('editLocalGuardian').value = profileData.localGuardian || '';
    document.getElementById('editHomeAddress').value = profileData.homeAddress || '';
    const editPhotoInput = document.getElementById('editPassportPhoto');
    if (editPhotoInput) {
        editPhotoInput.value = '';
    }
    const removePhotoInput = document.getElementById('removeProfilePhoto');
    if (removePhotoInput) {
        removePhotoInput.checked = false;
    }

    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
}

// Runtime slice from daawah.js: saveProfileChanges.
function saveProfileChanges() {
    const fullName = document.getElementById('editFullName').value.trim();
    const studentId = document.getElementById('editStudentId').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const school = document.getElementById('editSchool').value;
    const course = document.getElementById('editCourse').value;
    const yearOfStudy = document.getElementById('editYearOfStudy').value;
    const semester = document.getElementById('editSemester').value;
    const editPhotoFile = document.getElementById('editPassportPhoto')?.files?.[0] || null;
    const removePhoto = document.getElementById('removeProfilePhoto')?.checked || false;

    if (!fullName || !studentId || !email || !phone || !school || !course || !yearOfStudy || !semester) {
        alert('Please fill in full name, student ID, email, phone, school, course, year of study, and semester.');
        return;
    }

    const updatedProfile = {
        ...currentUser,
        name: fullName,
        fullName: fullName,
        studentId: studentId,
        username: currentUser?.username || studentId,
        email: email,
        phone: phone,
        school: school,
        course: course,
        yearOfStudy: yearOfStudy,
        semester: semester,
        gender: document.getElementById('editGender').value,
        nationality: document.getElementById('editNationality').value.trim(),
        emergencyContact: document.getElementById('editEmergencyContact').value.trim(),
        localGuardian: document.getElementById('editLocalGuardian').value.trim(),
        homeAddress: document.getElementById('editHomeAddress').value.trim(),
        passportPhotoFile: editPhotoFile,
        removePhoto: removePhoto
    };

    const saveUpdatedProfile = () => {
        if (!frontendOnly) {
            saveProfileToDatabase(updatedProfile)
                .then(savedProfile => completeProfileSave({
                    ...updatedProfile,
                    ...savedProfile,
                    passportPhotoData: savedProfile.passport_photo || updatedProfile.removePhoto ? '' : updatedProfile.passportPhotoData,
                    passport_photo: updatedProfile.removePhoto ? '' : (savedProfile.passport_photo || updatedProfile.passport_photo || '')
                }))
                .catch(error => {
                    console.error('Profile update error:', error);
                    alert(error.message || 'Profile could not be saved to the database.');
                });
            return;
        }

        completeProfileSave(updatedProfile);
    };

    if (editPhotoFile) {
        readImageAsDataUrl(editPhotoFile)
            .then(photoData => {
                updatedProfile.passportPhoto = editPhotoFile.name;
                updatedProfile.passportPhotoData = photoData;
                updatedProfile.removePhoto = false;
                saveUpdatedProfile();
            })
            .catch(() => alert('Could not read the selected profile photo. Please choose another image.'));
        return;
    }

    if (removePhoto) {
        updatedProfile.passportPhoto = '';
        updatedProfile.passportPhotoData = '';
        updatedProfile.passport_photo = '';
    }

    saveUpdatedProfile();
}

// Runtime slice from daawah.js: saveProfileToDatabase.
function saveProfileToDatabase(profile) {
    const [firstName, ...lastParts] = profile.fullName.split(/\s+/);
    return getCurrentStudentId()
        .then(studentDbId => {
            const profileData = new FormData();
            Object.entries({
                student_db_id: studentDbId,
                first_name: firstName || profile.fullName,
                last_name: lastParts.join(' ') || '-',
                student_id: profile.studentId,
                email: profile.email,
                phone: profile.phone,
                degree_type: 'degree',
                school: profile.school,
                course: profile.course,
                year_of_study: profile.yearOfStudy,
                semester: profile.semester,
                gender: profile.gender,
                nationality: profile.nationality,
                emergency_contact: profile.emergencyContact,
                local_guardian: profile.localGuardian,
                home_address: profile.homeAddress,
                remove_photo: profile.removePhoto ? '1' : ''
            }).forEach(([key, value]) => profileData.append(key, value || ''));
            if (profile.passportPhotoFile) {
                profileData.append('passport_photo_file', profile.passportPhotoFile);
            }

            return fetch('supabase-required-endpoint?action=updateStudentProfile', {
                method: 'POST',
                body: profileData
            });
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not update profile');
            }
            return result.data || {};
        });
}

// Runtime slice from daawah.js: completeProfileSave.
function completeProfileSave(updatedProfile) {
    const { passportPhotoFile, removePhoto, ...storableProfile } = updatedProfile;
    currentUser = storableProfile;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('profileData', JSON.stringify(currentUser));

    allMembers = allMembers.map(member => {
        const sameMember = member.studentId === storableProfile.studentId ||
            member.username === storableProfile.username ||
            member.email === storableProfile.email ||
            member.dbStudentId === storableProfile.dbStudentId;
        return sameMember ? { ...member, ...storableProfile } : member;
    });
    localStorage.setItem('allMembers', JSON.stringify(allMembers));

    loadProfileData();
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) {
        nameDisplay.textContent = currentUser.name || currentUser.fullName || currentUser.username;
    }
    updateDashboardStats();
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
    showNotification('Profile updated successfully.', 'success');
}

// MEMBERSHIP

// Runtime slice from daawah.js: isCompletedStatus.
function isCompletedStatus(status) {
    return String(status || '').toLowerCase() === 'completed';
}

// Runtime slice from daawah.js: isMembershipDuesPayment.
function isMembershipDuesPayment(payment) {
    return String(payment?.type || '').toLowerCase() === 'membershipdues';
}

// Runtime slice from daawah.js: getCompletedMembershipDuesPayment.
function getCompletedMembershipDuesPayment() {
    return payments
        .filter(payment => isMembershipDuesPayment(payment) && isCompletedStatus(payment.status))
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0] || null;
}

// Runtime slice from daawah.js: getMembershipCardPaymentStatus.
function getMembershipCardPaymentStatus() {
    return getCompletedMembershipDuesPayment() ? 'Paid' : 'No payment';
}

// Runtime slice from daawah.js: getMembershipValidityYears.
function getMembershipValidityYears(member = currentUser) {
    const course = String(member?.course || '').toLowerCase();
    return course.includes('nursing') ? 4 : 3;
}

// Runtime slice from daawah.js: addYearsIso.
function addYearsIso(dateValue, years) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) date.setTime(Date.now());
    date.setFullYear(date.getFullYear() + Number(years || 3));
    return date.toISOString();
}

// Runtime slice from daawah.js: formatMembershipDate.
function formatMembershipDate(value, fallback = 'After payment') {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
}

// Runtime slice from daawah.js: hasActiveMembership.
function hasActiveMembership() {
    return Boolean(getCompletedMembershipDuesPayment())
        || String(currentUser?.membershipCardPaymentStatus || '').toLowerCase() === 'paid'
        || String(currentUser?.membershipCardRecordStatus || '').toLowerCase() === 'active';
}

// Runtime slice from daawah.js: getMembershipDisplayState.
function getMembershipDisplayState() {
    const isMember = hasActiveMembership();
    return {
        isMember,
        status: isMember ? 'Active Member' : 'Not member',
        tier: isMember ? 'Full Member' : 'Registered Student',
        badgeClass: isMember ? 'bg-success' : 'bg-secondary',
        sinceLabel: isMember ? 'Member Since' : 'Registered Since'
    };
}

// Runtime slice from daawah.js: updateStoredMembershipCardState.
function updateStoredMembershipCardState(patch = {}) {
    if (!currentUser) return;
    currentUser = {
        ...currentUser,
        ...patch,
        membershipCardPaymentStatus: getMembershipCardPaymentStatus(),
        membershipCardPaymentUpdatedAt: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('profileData', JSON.stringify(currentUser));
    saveSharedMemberStore(currentUser);
}

// Runtime slice from daawah.js: generateMembershipCardId.
function generateMembershipCardId() {
    const year = new Date().getFullYear();
    const random = (globalThis.crypto?.getRandomValues
        ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(5))).map(value => value.toString(36).padStart(2, '0')).join('')
        : Math.random().toString(36).slice(2, 12)).replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase();
    return `UMMA-CARD-${year}-${random}`;
}

// Runtime slice from daawah.js: getActiveMembershipCard.
function getActiveMembershipCard() {
    if (!currentUser?.membershipCardId || currentUser?.membershipCardRecordStatus === 'Revoked') return null;
    return {
        cardId: currentUser.membershipCardId,
        status: currentUser.membershipCardRecordStatus || 'Active',
        issuedAt: currentUser.membershipCardIssuedAt || '',
        expiresAt: currentUser.membershipCardExpiresAt || '',
        validityYears: currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser),
        receiptNumber: currentUser.membershipCardReceiptNumber || ''
    };
}

// Runtime slice from daawah.js: buildMembershipCardRecord.
function buildMembershipCardRecord(completedPayment, cardId = currentUser?.membershipCardId || generateMembershipCardId()) {
    const name = currentUser.fullName || currentUser.name || currentUser.username || 'Member';
    const studentId = currentUser.studentId || currentUser.username || 'Not set';
    const issuedAt = currentUser.membershipCardIssuedAt || new Date().toISOString();
    const validityYears = getMembershipValidityYears(currentUser);
    const expiresAt = currentUser.membershipCardExpiresAt || addYearsIso(issuedAt, validityYears);
    return {
        cardId,
        fullName: name,
        username: currentUser.username || studentId,
        studentId,
        email: currentUser.email || '',
        role: currentUser.role || currentRole || 'student',
        status: 'Active',
        memberStatus: formatMemberStatus(currentUser.status || 'Active'),
        course: currentUser.course || '',
        paymentStatus: 'Paid',
        paymentId: completedPayment?.id || completedPayment?.supabaseId || completedPayment?.dbPaymentId || '',
        receiptNumber: completedPayment?.receiptNumber || completedPayment?.transactionRef || '',
        issuedAt,
        expiresAt,
        validityYears,
        updatedAt: new Date().toISOString()
    };
}

// Runtime slice from daawah.js: saveMembershipCardRecord.
function saveMembershipCardRecord(cardRecord) {
    const localCards = readStoredObject('membershipCards', {});
    localCards[cardRecord.cardId] = cardRecord;
    localStorage.setItem('membershipCards', JSON.stringify(localCards));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()) {
        window.SupabaseBackend.saveMembershipCard?.(cardRecord).catch(error => {
            console.error('Membership card sync failed:', error);
            showNotification('Card is ready on this device, but cloud verification sync failed. Try again online.', 'warning');
        });
    }
}

// Runtime slice from daawah.js: ensureActiveMembershipCard.
function ensureActiveMembershipCard(completedPayment = getCompletedMembershipDuesPayment()) {
    if (!currentUser || !completedPayment) return null;
    const activeCard = getActiveMembershipCard();
    const cardRecord = buildMembershipCardRecord(completedPayment, activeCard?.cardId || generateMembershipCardId());
    updateStoredMembershipCardState({
        membershipCardAppliedAt: currentUser.membershipCardAppliedAt || new Date().toISOString(),
        membershipCardStatus: 'Ready after payment',
        membershipCardId: cardRecord.cardId,
        membershipCardRecordStatus: 'Active',
        membershipCardIssuedAt: cardRecord.issuedAt,
        membershipCardExpiresAt: cardRecord.expiresAt,
        membershipCardValidityYears: cardRecord.validityYears,
        membershipCardPaymentId: cardRecord.paymentId,
        membershipCardReceiptNumber: cardRecord.receiptNumber
    });
    saveMembershipCardRecord(cardRecord);
    return cardRecord;
}

// Runtime slice from daawah.js: loadMembershipStatus.
function loadMembershipStatus() {
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const membershipState = getMembershipDisplayState();
    const paymentStatus = completedMembershipPayment ? 'Paid' : 'No payment';
    const applicationStatus = currentUser?.membershipCardAppliedAt
        ? (completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment')
        : 'Not applied';
    const membershipInfo = {
        status: membershipState.status,
        expiryDate: membershipState.isMember ? formatMembershipDate(currentUser?.membershipCardExpiresAt || getActiveMembershipCard()?.expiresAt) : 'After payment',
        joinDate: currentUser?.createdAt
            ? new Date(currentUser.createdAt).toLocaleDateString()
            : (currentUser?.membershipCardAppliedAt ? new Date(currentUser.membershipCardAppliedAt).toLocaleDateString() : 'Not set'),
        tier: membershipState.tier
    };

    const statusEl = document.getElementById('membershipDetailStatus');
    const joinDateEl = document.getElementById('membershipDetailJoinDate');
    const expiryDateEl = document.getElementById('membershipDetailExpiryDate');
    const paymentStatusEl = document.getElementById('membershipDetailPaymentStatus');
    const applicationPanel = document.getElementById('membershipCardApplicationPanel');

    if (statusEl) {
        statusEl.textContent = membershipInfo.status;
        statusEl.className = `badge ${membershipState.badgeClass}`;
    }
    if (joinDateEl) joinDateEl.textContent = membershipInfo.joinDate;
    if (expiryDateEl) expiryDateEl.textContent = membershipInfo.expiryDate;
    if (paymentStatusEl) {
        paymentStatusEl.textContent = paymentStatus;
        paymentStatusEl.className = `badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}`;
    }
    if (applicationPanel) {
        const activeCard = getActiveMembershipCard();
        const paymentLine = completedMembershipPayment
            ? `Paid by ${escapeHtml(completedMembershipPayment.paymentMethod || 'payment')} on ${escapeHtml(completedMembershipPayment.date || 'recently')}.`
            : 'No completed membership dues payment is recorded yet.';
        applicationPanel.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between gap-2">
                <div>
                    <strong>Membership card application:</strong> ${escapeHtml(applicationStatus)}
                    <br><small class="text-muted">${paymentLine}</small>
                    <br><small class="text-muted">Card ID: ${escapeHtml(activeCard?.cardId || 'Not issued')}</small>
                </div>
                <span class="badge align-self-start ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${paymentStatus}</span>
            </div>
        `;
    }

    const container = document.getElementById('membershipStatusDetails');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <p><strong>Status:</strong> <span class="badge ${membershipState.badgeClass}">${membershipInfo.status}</span></p>
                    <p><strong>Membership Expiry:</strong> ${membershipInfo.expiryDate}</p>
                    <p><strong>${membershipState.sinceLabel}:</strong> ${membershipInfo.joinDate}</p>
                    <p><strong>Tier:</strong> ${membershipInfo.tier}</p>
                    <p><strong>Card Payment:</strong> <span class="badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${paymentStatus}</span></p>
                    <button class="btn btn-primary mt-3" onclick="applyForMembershipCard()">Apply for Membership Card</button>
                </div>
            </div>
        `;
    }
}

// Runtime slice from daawah.js: renewMembership.
function renewMembership() {
    showMembershipDuesPayment();
}

// Runtime slice from daawah.js: applyForMembershipCard.
function applyForMembershipCard() {
    if (!currentUser) return;
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const cardRecord = completedMembershipPayment ? ensureActiveMembershipCard(completedMembershipPayment) : null;
    updateStoredMembershipCardState({
        membershipCardAppliedAt: currentUser.membershipCardAppliedAt || new Date().toISOString(),
        membershipCardStatus: completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment',
        membershipCardId: cardRecord?.cardId || currentUser.membershipCardId || '',
        membershipCardRecordStatus: cardRecord?.status || currentUser.membershipCardRecordStatus || '',
        membershipCardIssuedAt: cardRecord?.issuedAt || currentUser.membershipCardIssuedAt || '',
        membershipCardExpiresAt: cardRecord?.expiresAt || currentUser.membershipCardExpiresAt || '',
        membershipCardValidityYears: cardRecord?.validityYears || currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser),
        membershipCardPaymentId: completedMembershipPayment?.id || completedMembershipPayment?.supabaseId || '',
        membershipCardReceiptNumber: completedMembershipPayment?.receiptNumber || completedMembershipPayment?.transactionRef || ''
    });
    loadMembershipStatus();
    updateDashboardStats();
    showNotification(
        completedMembershipPayment
            ? 'Membership card application saved. Payment status: Paid.'
            : 'Membership card application saved. Payment status: No payment.',
        completedMembershipPayment ? 'success' : 'warning'
    );
}

// Runtime slice from daawah.js: showMembershipDuesPayment.
function showMembershipDuesPayment() {
    showPaymentModal('membershipDues');
}

// PRAYER TIMES

// Runtime slice from daawah.js: loadPrayerTimes.
function loadPrayerTimes() {
    const container = document.getElementById('prayerTimesDetails');
    const managerPanel = document.getElementById('officerPrayerManagerPanel');
    managerPanel?.classList.toggle('d-none', !hasPermission('manage_prayer_times'));
    loadReligiousActivities();
    if (!container) return;

    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()
        ? window.SupabaseBackend.loadStore('adminPrayerTimes').then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_supabase-required-endpoint?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));

    prayerRequest
    .then(result => {
        const data = result.data || {};
        populateOfficerPrayerForm(data);
        const prayerTimes = [
            { name: 'Fajr', time: data.fajr },
            { name: 'Dhuhr', time: data.dhuhr },
            { name: 'Asr', time: data.asr },
            { name: 'Maghrib', time: data.maghrib },
            { name: 'Isha', time: data.isha },
            { name: 'Jumu\'ah', time: data.jummah_time }
        ];
        container.innerHTML = `<div class="prayer-schedule">${prayerTimes.map(prayer => `
            <div class="prayer-item">
                <span class="prayer-label">${prayer.name}</span>
                <span class="prayer-time">${prayer.time || 'Not set'}</span>
            </div>
        `).join('')}</div>`;
    })
    .catch(() => {
        container.innerHTML = '<p class="text-muted">Prayer timetable has not been added yet.</p>';
    });
}

// Runtime slice from daawah.js: populateOfficerPrayerForm.
function populateOfficerPrayerForm(data = {}) {
    if (!hasPermission('manage_prayer_times')) return;
    const today = new Date().toISOString().slice(0, 10);
    const fieldMap = {
        officerPrayerDate: data.date || today,
        officerPrayerFajr: (data.fajr || '').slice(0, 5),
        officerPrayerDhuhr: (data.dhuhr || '').slice(0, 5),
        officerPrayerAsr: (data.asr || '').slice(0, 5),
        officerPrayerMaghrib: (data.maghrib || '').slice(0, 5),
        officerPrayerIsha: (data.isha || '').slice(0, 5),
        officerPrayerJummah: (data.jummah_time || '').slice(0, 5)
    };
    Object.entries(fieldMap).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input && !input.value) input.value = value;
    });
}

// Runtime slice from daawah.js: saveOfficerPrayerTimes.
function saveOfficerPrayerTimes(event) {
    event?.preventDefault?.();
    if (!hasPermission('manage_prayer_times')) {
        showNotification('Only the Amir/Director of Dawah Team can update prayer times.', 'warning');
        return;
    }

    const data = {
        date: document.getElementById('officerPrayerDate')?.value || new Date().toISOString().slice(0, 10),
        fajr: document.getElementById('officerPrayerFajr')?.value || '',
        dhuhr: document.getElementById('officerPrayerDhuhr')?.value || '',
        asr: document.getElementById('officerPrayerAsr')?.value || '',
        maghrib: document.getElementById('officerPrayerMaghrib')?.value || '',
        isha: document.getElementById('officerPrayerIsha')?.value || '',
        jummah_time: document.getElementById('officerPrayerJummah')?.value || '',
        updatedBy: currentUser?.email || currentUser?.username || '',
        updatedAt: new Date().toISOString()
    };

    const button = document.getElementById('officerPrayerSaveButton');
    const originalHtml = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    const saveRequest = window.SupabaseBackend?.enabled
        ? window.SupabaseBackend.saveStore('adminPrayerTimes', data)
        : Promise.resolve(data);

    saveRequest
        .then(() => {
            localStorage.setItem('adminPrayerTimes', JSON.stringify(data));
            logLocalRoleActivity('setPrayerTimes', { date: data.date });
            loadPrayerTimes();
            loadDashboardPrayerTimes();
            showNotification('Prayer timetable saved.', 'success');
        })
        .catch(error => {
            console.error('Prayer timetable save failed:', error);
            showNotification(error.message || 'Could not save prayer times.', 'danger');
        })
        .finally(() => {
            if (button) {
                button.disabled = false;
                button.innerHTML = originalHtml || '<i class="fas fa-save"></i> Save Prayer Times';
            }
        });
}

// Runtime slice from daawah.js: getReligiousActivities.
function getReligiousActivities() {
    return readStoredObject('adminReligiousActivities', {
        jummah: [],
        ramadan: [],
        lectures: []
    });
}

// Runtime slice from daawah.js: loadReligiousActivities.
function loadReligiousActivities() {
    const data = getReligiousActivities();
    renderJummahReminders(data.jummah || []);
    renderRamadanSchedule(data.ramadan || []);
    renderIslamicLectures(data.lectures || []);
}

// Runtime slice from daawah.js: renderJummahReminders.
function renderJummahReminders(items) {
    const container = document.getElementById('jummahDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<p class="text-center text-muted mb-3">No Jumu\'ah reminders have been added yet.</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Khutbah Topic</th>
                        <th>Speaker</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.date || '-'}</td>
                            <td>${item.time || '-'}</td>
                            <td>${item.topic || '-'}</td>
                            <td>${item.speaker || '-'}</td>
                        </tr>
                        ${item.note ? `<tr><td colspan="4" class="text-muted">${item.note}</td></tr>` : ''}
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Runtime slice from daawah.js: renderRamadanSchedule.
function renderRamadanSchedule(items) {
    const container = document.getElementById('ramadanDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<p class="text-center text-muted mb-0">No Ramadan schedule has been added yet.</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.event || '-'}</td>
                            <td>${item.date || '-'}</td>
                            <td>${item.time || '-'}</td>
                            <td>${item.note || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Runtime slice from daawah.js: renderIslamicLectures.
function renderIslamicLectures(items) {
    const container = document.getElementById('lecturesDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted mb-0">No Islamic lectures have been added yet.</p></div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="card-header">
                    <h6 class="mb-0">${item.title || 'Islamic Lecture'}</h6>
                </div>
                <div class="card-body">
                    <small class="d-block text-muted">${item.schedule || '-'}</small>
                    ${item.speaker ? `<p class="mb-2"><strong>Speaker:</strong> ${item.speaker}</p>` : ''}
                    <p class="mb-0">${item.description || 'Details will be shared soon.'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// EVENTS

// Runtime slice from daawah.js: loadEventsData.
function loadEventsData() {
    loadEventsFromApi().finally(() => {
        renderAvailableEvents();
        populateEventSelect();
        updateRegisteredEventsList();
        const eventsList = document.getElementById('eventsList');
        if (eventsList) {
            eventsList.style.display = '';
        }
    });
}

// Runtime slice from daawah.js: getAvailableEvents.
function getAvailableEvents() {
    return [...allEvents, ...readList('adminEvents')].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}

// Runtime slice from daawah.js: mergeEvents.
function mergeEvents(events) {
    allEvents = [...allEvents, ...events].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}

// Runtime slice from daawah.js: loadEventsFromApi.
function loadEventsFromApi() {
    const eventsRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getEvents'))
        : fetch('admin_supabase-required-endpoint?action=getEvents&limit=100').then(response => parseJsonResponse(response));

    return eventsRequest
        .then(result => {
            if (result.success && Array.isArray(result.data)) {
                mergeEvents(result.data);
            }
            return allEvents;
        })
        .catch(() => {
            return allEvents;
        });
}

// Runtime slice from daawah.js: renderAvailableEvents.
function renderAvailableEvents() {
    const container = document.getElementById('eventsList');
    if (!container) return;

    const events = getAvailableEvents();
    if (events.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No events have been added yet.</div>';
        return;
    }

    container.innerHTML = events.map(event => {
        const id = event.id || event.eventId || Date.now();
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || 'Date not set';
        const location = event.location || 'Location not set';
        const description = event.description || '';

        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card event-card">
                    <div class="card-header event-header">
                        <h6 class="mb-0">${title}</h6>
                        <small>${date}</small>
                    </div>
                    <div class="card-body">
                        <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                        <p class="text-muted">${description}</p>
                        <button class="btn btn-sm btn-primary" onclick="registerEvent('${id}')">Register</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Runtime slice from daawah.js: populateEventSelect.
function populateEventSelect() {
    const select = document.getElementById('eventSelect');
    if (!select) return;

    const events = getAvailableEvents();
    select.innerHTML = '<option value="">Choose an event</option>' + events.map(event => {
        const id = event.id || event.eventId || event.title || event.name;
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || '';
        return `<option value="${id}">${title}${date ? ' - ' + date : ''}</option>`;
    }).join('');
}

// Runtime slice from daawah.js: showEventModal.
function showEventModal() {
    populateEventSelect();
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

// Runtime slice from daawah.js: registerEvent.
function registerEvent(eventId) {
    document.getElementById('eventSelect').value = eventId;
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

// Runtime slice from daawah.js: submitEventRegistration.
function submitEventRegistration() {
    const eventSelect = document.getElementById('eventSelect').value;
    const attendeeCount = document.getElementById('attendeeCount').value;
    const requirements = document.getElementById('eventRequirements').value;

    if (!eventSelect) {
        showNotification('Please select an event', 'warning');
        return;
    }

    const selectedEvent = getAvailableEvents().find(event =>
        String(event.id || event.eventId || event.title || event.name) === String(eventSelect)
    );
    const eventName = selectedEvent ? (selectedEvent.title || selectedEvent.name) : eventSelect;

    const registration = {
        id: Date.now(),
        eventName: eventName,
        eventId: eventSelect,
        attendees: attendeeCount,
        requirements: requirements,
        date: selectedEvent ? (selectedEvent.event_date || selectedEvent.date || new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
        registrationDate: new Date().toLocaleDateString(),
        status: 'Registered'
    };

    if (!frontendOnly && selectedEvent && selectedEvent.id) {
        getCurrentStudentId()
        .then(studentId => fetch('supabase-required-endpoint?action=registerEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_id: selectedEvent.id,
                student_id: studentId
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not register for event in the database');
            }
            saveEventRegistrationLocally(registration);
        })
        .catch(error => {
            console.error('Event registration database error:', error);
            alert(error.message || 'Event registration could not be saved to the database.');
        });
        return;
    }

    saveEventRegistrationLocally(registration);
}

// Runtime slice from daawah.js: saveEventRegistrationLocally.
function saveEventRegistrationLocally(registration) {
    registeredEvents.push(registration);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    saveOwnedCloudRecord('eventRegistrations', registration, 'registeredEvents');

    showNotification('Event registration successful! ' + registration.eventName, 'success');

    document.getElementById('eventForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
    updateRegisteredEventsList();
}

// Runtime slice from daawah.js: cancelEventRegistration.
function cancelEventRegistration(eventId) {
    registeredEvents = registeredEvents.filter(e => e.eventId !== eventId);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    updateRegisteredEventsList();
    showNotification('Event registration cancelled.', 'info');
}

// Runtime slice from daawah.js: updateRegisteredEventsList.
function updateRegisteredEventsList() {
    const tbody = document.getElementById('registeredEventsList');

    if (registeredEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No registered events</td></tr>';
        return;
    }

    tbody.innerHTML = registeredEvents.map(event => `
        <tr>
            <td>${event.eventName}</td>
            <td>${event.date}</td>
            <td><span class="badge bg-success">${event.status}</span></td>
            <td><button class="btn btn-sm btn-danger" onclick="cancelEventRegistration('${event.eventId}')">Cancel</button></td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: showCreateEventModal.
function showCreateEventModal() {
    const modal = new bootstrap.Modal(document.getElementById('createEventModal'));
    modal.show();
}

// Runtime slice from daawah.js: saveEvent.
function saveEvent() {
    const eventName = document.getElementById('createEventName').value;
    const eventDate = document.getElementById('createEventDate').value;
    const eventTime = document.getElementById('createEventTime').value;
    const eventLocation = document.getElementById('createEventLocation').value;
    const eventDescription = document.getElementById('createEventDescription').value;

    const eventData = {
        name: eventName,
        title: eventName,
        date: eventDate,
        time: eventTime,
        event_date: eventTime ? `${eventDate} ${eventTime}` : eventDate,
        location: eventLocation,
        description: eventDescription,
        createdDate: new Date().toLocaleDateString(),
        status: 'Upcoming'
    };

    if (!frontendOnly) {
        fetch('admin_supabase-required-endpoint?action=createEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: eventName,
                description: eventDescription,
                event_date: eventData.event_date,
                location: eventLocation,
                category: 'general',
                status: 'upcoming',
                max_participants: 100
            })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Error creating event');
            }
            mergeEvents([eventData]);
            loadEventsData();
            alert('Event created successfully!');
            bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error creating event. Please try again.', 'danger');
        });
        return;
    }

    allEvents.push(eventData);

    localStorage.setItem('allEvents', JSON.stringify(allEvents));
    alert('Event created successfully!');
    bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
}

// Runtime slice from daawah.js: viewEventDetails.
function viewEventDetails(eventName) {
    const event = allEvents.find(item => item.name === eventName || item.title === eventName);
    const details = event
        ? `${event.name || event.title}\nDate: ${event.date || event.event_date || 'Not set'}\nLocation: ${event.location || 'Not set'}\n${event.description || ''}`
        : 'Event details for: ' + eventName;
    alert(details);
}

// Runtime slice from daawah.js: editEvent.
function editEvent(eventName) {
    const event = allEvents.find(item => item.name === eventName || item.title === eventName);
    if (!event) {
        showNotification('Use Create New Event to add updated details.', 'info');
        return;
    }

    document.getElementById('newEventName').value = event.name || event.title || '';
    document.getElementById('newEventDate').value = event.date || '';
    document.getElementById('newEventTime').value = event.time || '';
    document.getElementById('newEventLocation').value = event.location || '';
    document.getElementById('newEventDescription').value = event.description || '';
    showCreateEventModal();
}

// ANNOUNCEMENTS

// Runtime slice from daawah.js: loadAnnouncements.
function loadAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    document.getElementById('announcementManagerPanel')?.classList.toggle('d-none', !hasPermission('create_announcements'));

    const announcementRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAnnouncements'))
        : fetch('admin_supabase-required-endpoint?action=getAnnouncements').then(response => parseJsonResponse(response));

    announcementRequest
    .then(result => {
        const announcements = (result.data || []).map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at || ann.published_at ? new Date(ann.created_at || ann.published_at).toLocaleDateString() : 'Recently',
            icon: 'bell'
        }));

        if (announcements.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No announcements have been added yet.</p>';
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5><i class="fas fa-${ann.icon}"></i> ${ann.title}</h5>
                        <small class="text-muted">${ann.time}</small>
                    </div>
                    <p>${ann.text}</p>
                </div>
            </div>
        `).join('');
    })
    .catch(() => {
        const announcements = readList('adminAnnouncements').map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently',
            icon: 'bell'
        }));

        if (announcements.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No announcements have been added yet.</p>';
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5><i class="fas fa-${ann.icon}"></i> ${ann.title}</h5>
                        <small class="text-muted">${ann.time}</small>
                    </div>
                    <p>${ann.text}</p>
                </div>
            </div>
        `).join('');
    });
}

// Runtime slice from daawah.js: saveAnnouncement.
function saveAnnouncement(event) {
    event.preventDefault();
    if (!hasPermission('create_announcements')) {
        showNotification('Only the secretary and admins can publish announcements.', 'warning');
        return;
    }

    const announcement = {
        title: document.getElementById('announcementTitle').value.trim(),
        content: document.getElementById('announcementContent').value.trim(),
        priority: document.getElementById('announcementPriority').value || 'normal',
        author_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0
    };

    if (!announcement.title || !announcement.content) {
        showNotification('Please enter an announcement title and message.', 'warning');
        return;
    }

    const finishSave = () => {
        document.getElementById('announcementForm').reset();
        loadAnnouncements();
        showNotification('Announcement published.', 'success');
    };

    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=createAnnouncement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcement)
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not publish announcement');
            }
            finishSave();
        })
        .catch(error => showNotification(error.message || 'Could not publish announcement', 'danger'));
        return;
    }

    const announcements = readList('adminAnnouncements');
    announcements.unshift({
        id: Date.now(),
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
    logLocalRoleActivity('createAnnouncement', { title: announcement.title, priority: announcement.priority });
    finishSave();
}

// RESOURCES

// Runtime slice from daawah.js: loadResources.
function loadResources() {
    const container = document.getElementById('resourcesGrid');
    if (!container) return;

    const resourceRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getResources'))
        : fetch('admin_supabase-required-endpoint?action=getResources').then(response => parseJsonResponse(response));

    resourceRequest
    .then(result => {
        const resources = result.data || [];
        if (!resources.length) {
            container.innerHTML = '<p class="text-center text-muted">No resources have been added yet.</p>';
            return;
        }
        window.currentResources = resources;
        container.innerHTML = `<div class="row">${resources.map(res => `
            <div class="col-md-4 mb-3">
                <div class="card resource-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-${getResourceIcon(res.resource_type || res.type)} fa-3x mb-3" style="color: var(--primary-color);"></i>
                        <h6>${res.title}</h6>
                        <p class="text-muted small">${res.description || ''}</p>
                        <button class="btn btn-sm btn-primary" onclick="openResource(${resources.indexOf(res)})">View</button>
                    </div>
                </div>
            </div>
        `).join('')}</div>`;
    })
    .catch(error => {
        console.error('Resource loading error:', error);
        container.innerHTML = '<p class="text-center text-danger">Resources could not load. Please open the site through http://localhost/comahs/index.html and try again.</p>';
    });
}

// Runtime slice from daawah.js: getResourceIcon.
function getResourceIcon(type) {
    if (type === 'video') return 'video';
    if (type === 'download') return 'download';
    if (type === 'article') return 'newspaper';
    return 'link';
}

// Runtime slice from daawah.js: openResource.
function openResource(resourceIndex) {
    const resource = Array.isArray(window.currentResources) ? window.currentResources[resourceIndex] : null;
    if (!resource) {
        alert('Resource was not found. Please refresh and try again.');
        return;
    }

    const resourceUrl = resource.url || resource.file_path || '';
    if (resourceUrl) {
        window.open(resolveAppUrl(resourceUrl), '_blank');
        return;
    }
    alert(`${resource.title}\n\n${resource.description || 'No details available.'}`);
}

// Runtime slice from daawah.js: resolveAppUrl.
function resolveAppUrl(url) {
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|data:|blob:)/i.test(url)) return url;
    const cleanUrl = url.replace(/^\/+/, '');
    if (useLegacyPhpApi) {
        return LEGACY_PHP_BASE_URL + cleanUrl;
    }
    return cleanUrl;
}

// RESEARCH ASSISTANT

// Runtime slice from daawah.js: getResearchHistory.
function getResearchHistory() {
    return readList('studentResearchHistory');
}

// Runtime slice from daawah.js: mergeResearchHistory.
function mergeResearchHistory(remoteItems = []) {
    if (!Array.isArray(remoteItems) || !remoteItems.length) return;
    const local = getResearchHistory();
    const mapped = remoteItems.map(item => ({
        id: item.id,
        question: item.question,
        mode: item.mode,
        answer: item.answer,
        sources: item.sources || [],
        model: item.model || '',
        createdAt: item.created_at || item.createdAt || new Date().toISOString()
    }));
    const merged = [...mapped, ...local].filter((item, index, list) =>
        index === list.findIndex(other => String(other.id) === String(item.id) || (other.question === item.question && other.createdAt === item.createdAt))
    );
    localStorage.setItem('studentResearchHistory', JSON.stringify(merged.slice(0, 25)));
}

// Runtime slice from daawah.js: saveResearchHistoryItem.
function saveResearchHistoryItem(item) {
    const history = getResearchHistory();
    history.unshift(item);
    localStorage.setItem('studentResearchHistory', JSON.stringify(history.slice(0, 25)));
    latestResearchItem = item;
    renderResearchHistory();
}

// Runtime slice from daawah.js: loadResearchAssistant.
function loadResearchAssistant() {
    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=getResearchHistory', { credentials: 'same-origin' })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (result.success) mergeResearchHistory(result.data || []);
                renderResearchHistory();
            })
            .catch(() => renderResearchHistory());
    } else {
        renderResearchHistory();
    }
    const status = document.getElementById('researchStatus');
    if (status) {
        status.textContent = 'Research uses web sources when the server OpenAI key is configured. Verify religious rulings with qualified scholars.';
    }
}

// Runtime slice from daawah.js: formatSourceHost.
function formatSourceHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
        return 'source';
    }
}

// Runtime slice from daawah.js: renderResearchSources.
function renderResearchSources(sources) {
    if (!sources.length) return '';
    return `
        <hr>
        <h6>Sources</h6>
        <div class="research-source-grid">
            ${sources.map((source, index) => `
                <a class="research-source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">
                    <span class="research-source-card__index">${index + 1}</span>
                    <span>
                        <strong>${escapeHtml(source.title || formatSourceHost(source.url))}</strong>
                        <small>${escapeHtml(formatSourceHost(source.url))}</small>
                    </span>
                    <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
            `).join('')}
        </div>
    `;
}

// Runtime slice from daawah.js: setResearchBusy.
function setResearchBusy(isBusy, message) {
    const button = document.getElementById('researchRunBtn');
    const status = document.getElementById('researchStatus');
    if (button) {
        button.disabled = isBusy;
        button.innerHTML = isBusy ? '<i class="fas fa-spinner fa-spin"></i> Researching...' : '<i class="fas fa-magnifying-glass"></i> Research';
    }
    if (status && message) status.textContent = message;
}

// Runtime slice from daawah.js: runStudentResearch.
function runStudentResearch() {
    const baseQuestion = document.getElementById('researchQuestion')?.value.trim() || '';
    const question = `${baseQuestion}${getResearchPhotoContext()}`.trim();
    const mode = document.getElementById('researchMode')?.value || 'quick';
    if (!baseQuestion && !getResearchPhotoFile()) {
        showNotification('Type or record a research question first.', 'warning');
        return;
    }
    const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
    if (frontendOnly && !workerUrl) {
        showNotification('Research Assistant needs the AI Worker configuration.', 'warning');
        return;
    }
    const endpoint = workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : 'supabase-required-endpoint?action=studentResearch';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question,
            mode,
            context: `student research dashboard; mode=${mode}; return concise sources and label Islamic evidence separately when relevant`
        })
    };
    if (!workerUrl) {
        requestOptions.credentials = 'same-origin';
    }
    setResearchBusy(true, 'Searching and preparing your answer...');
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
    .catch(error => {
        if (workerUrl && !frontendOnly) {
            return fetch('supabase-required-endpoint?action=studentResearch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ question, mode })
            }).then(response => parseJsonResponse(response));
        }
        throw error;
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Research failed');
        const item = {
            id: Date.now(),
            question,
            mode,
            answer: result.data?.answer || '',
            sources: result.data?.sources || [],
            model: result.data?.model || '',
            fallback: !!result.data?.fallback,
            createdAt: new Date().toISOString()
        };
        renderResearchResult(item);
        saveResearchHistoryItem(item);
        if (!frontendOnly) saveResearchHistoryToServer(item);
        showNotification(item.fallback ? 'Basic research answer prepared. AI quota needs attention for full research.' : 'Research completed.', item.fallback ? 'warning' : 'success');
    })
    .catch(error => {
        showNotification(error.message || 'Research failed', 'danger');
    })
    .finally(() => setResearchBusy(false, 'Research complete. You can edit the question and search again.'));
}

// Runtime slice from daawah.js: saveResearchHistoryToServer.
function saveResearchHistoryToServer(item) {
    if (!item?.question || !item?.answer) return;
    fetch('supabase-required-endpoint?action=saveResearchHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            question: item.question,
            answer: item.answer,
            mode: item.mode || 'quick',
            model: item.model || '',
            sources: item.sources || [],
            transcript: item.transcript || ''
        })
    }).catch(() => {});
}

// Runtime slice from daawah.js: renderResearchResult.
function renderResearchResult(item) {
    const container = document.getElementById('researchResult');
    if (!container) return;
    latestResearchItem = item;
    const sources = Array.isArray(item.sources) ? item.sources.filter(source => source?.url) : [];
    container.innerHTML = `
        <div class="mb-3">
            <span class="badge bg-primary">${escapeHtml(item.mode || 'research')}</span>
            ${item.model ? `<span class="badge bg-secondary">${escapeHtml(item.model)}</span>` : ''}
        </div>
        <h6>${escapeHtml(item.question || '')}</h6>
        ${item.fallback ? '<div class="alert alert-info py-2">This is a basic fallback answer because the live AI research service is unavailable. Add OpenAI quota for full AI research.</div>' : ''}
        <div class="alert alert-warning py-2">
            AI research can contain mistakes. Check the sources, and verify Islamic rulings with qualified scholars before relying on them.
        </div>
        <div class="research-answer">${escapeHtml(item.answer || '').replace(/\n/g, '<br>')}</div>
        ${sources.length ? `<p class="small text-muted mt-3 mb-2">${sources.length} source(s) attached. Open sources before using the answer officially.</p>` : '<p class="small text-muted mt-3 mb-2">No live source link was returned for this answer.</p>'}
        ${renderResearchSources(sources)}
    `;
}

// Runtime slice from daawah.js: renderResearchHistory.
function renderResearchHistory() {
    const container = document.getElementById('researchHistory');
    if (!container) return;
    const history = getResearchHistory();
    if (!history.length) {
        container.innerHTML = '<p class="text-muted mb-0">No research saved yet.</p>';
        return;
    }
    container.innerHTML = history.map(item => `
        <div class="border-bottom py-2 d-flex justify-content-between gap-3 align-items-start">
            <div>
                <button type="button" class="btn btn-link p-0 text-start" onclick="openResearchHistory(${Number(item.id)})">${escapeHtml(item.question || 'Research item')}</button>
                <div><small class="text-muted">${new Date(item.createdAt || Date.now()).toLocaleString()} | ${escapeHtml(item.mode || 'research')}</small></div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" onclick="deleteResearchHistoryItem(${Number(item.id)})" title="Delete this research message" aria-label="Delete this research message">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: openResearchHistory.
function openResearchHistory(id) {
    const item = getResearchHistory().find(entry => Number(entry.id) === Number(id));
    if (item) renderResearchResult(item);
}

// Runtime slice from daawah.js: deleteResearchHistoryItem.
function deleteResearchHistoryItem(id) {
    const history = getResearchHistory();
    const item = history.find(entry => Number(entry.id) === Number(id));
    if (!item) return;
    if (!confirm('Delete this research message from your history?')) return;
    const next = history.filter(entry => Number(entry.id) !== Number(id));
    localStorage.setItem('studentResearchHistory', JSON.stringify(next));
    if (latestResearchItem && Number(latestResearchItem.id) === Number(id)) {
        latestResearchItem = null;
        const result = document.getElementById('researchResult');
        if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    }
    renderResearchHistory();
    showNotification('Research message deleted.', 'success');
}

// Runtime slice from daawah.js: clearResearchHistory.
function clearResearchHistory() {
    const history = getResearchHistory();
    if (!history.length) {
        showNotification('No research history to clear.', 'info');
        return;
    }
    if (!confirm('Delete all research history from this device?')) return;
    localStorage.removeItem('studentResearchHistory');
    latestResearchItem = null;
    clearResearchPhoto();
    const result = document.getElementById('researchResult');
    if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    renderResearchHistory();
    showNotification('Research history cleared.', 'success');
}

// Runtime slice from daawah.js: exportLatestResearch.
function exportLatestResearch() {
    const item = latestResearchItem;
    if (!item) {
        alert('No research result to export yet.');
        return;
    }
    const sources = (item.sources || []).map((source, index) => `${index + 1}. ${source.title || source.url}\n${source.url}`).join('\n\n');
    const text = `UMMA University Dawah Team Research Assistant\n\nQuestion:\n${item.question}\n\nMode: ${item.mode}\nDate: ${new Date(item.createdAt || Date.now()).toLocaleString()}\n\nAnswer:\n${item.answer}\n\nSources:\n${sources || 'No sources returned.'}\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Runtime slice from daawah.js: getResearchPhotoFile.
function getResearchPhotoFile() {
    return document.getElementById('researchPhotoUpload')?.files?.[0] || null;
}

// Runtime slice from daawah.js: getResearchPhotoContext.
function getResearchPhotoContext() {
    const file = getResearchPhotoFile();
    if (!file) return '';
    return `\n\nPhoto attached for research context: ${file.name || 'camera photo'} (${file.type || 'image'}, ${Math.max(1, Math.round(file.size / 1024))} KB). Describe what should be checked from the photo in the question.`;
}

// Runtime slice from daawah.js: handleResearchPhotoUpload.
function handleResearchPhotoUpload() {
    const file = getResearchPhotoFile();
    const preview = document.getElementById('researchPhotoPreview');
    const image = document.getElementById('researchPhotoPreviewImage');
    const name = document.getElementById('researchPhotoName');
    if (!file || !preview || !image) return;
    if (!String(file.type || '').startsWith('image/')) {
        showNotification('Please choose an image from camera or gallery.', 'warning');
        clearResearchPhoto();
        return;
    }
    if (file.size > uploadLimits.galleryImage.bytes) {
        showNotification(`Photo must be ${uploadLimits.galleryImage.label} or smaller.`, 'warning');
        clearResearchPhoto();
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        image.src = event.target?.result || '';
        if (name) name.textContent = file.name || 'Camera photo attached';
        preview.classList.remove('d-none');
        const status = document.getElementById('researchStatus');
        if (status) status.textContent = 'Photo attached. Type what you want the Research AI to check, then click Research.';
    };
    reader.onerror = () => showNotification('Could not read the selected photo.', 'danger');
    reader.readAsDataURL(file);
}

// Runtime slice from daawah.js: clearResearchPhoto.
function clearResearchPhoto() {
    const input = document.getElementById('researchPhotoUpload');
    const preview = document.getElementById('researchPhotoPreview');
    const image = document.getElementById('researchPhotoPreviewImage');
    if (input) input.value = '';
    if (image) image.src = '';
    preview?.classList.add('d-none');
}

// Runtime slice from daawah.js: clearResearchResult.
function clearResearchResult() {
    latestResearchItem = null;
    const result = document.getElementById('researchResult');
    if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    const status = document.getElementById('researchStatus');
    if (status) status.textContent = 'Result cleared. You can run a new research question.';
    showNotification('Research result cleared.', 'success');
}

// Runtime slice from daawah.js: setResearchRecordingState.
function setResearchRecordingState(isRecording) {
    const button = document.getElementById('researchRecordBtn');
    const status = document.getElementById('researchStatus');
    if (button) {
        button.classList.toggle('btn-danger', isRecording);
        button.classList.toggle('btn-outline-secondary', !isRecording);
        button.innerHTML = isRecording ? '<i class="fas fa-stop"></i> Stop' : '<i class="fas fa-microphone"></i> Record';
    }
    if (status) status.textContent = isRecording ? 'Recording voice question...' : 'Processing voice question...';
}

// Runtime slice from daawah.js: toggleResearchRecording.
function toggleResearchRecording() {
    if (researchRecorder && researchRecorder.state === 'recording') {
        researchRecorder.stop();
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        showNotification('Voice recording is not supported in this browser.', 'warning');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            researchAudioStream = stream;
            researchAudioChunks = [];
            researchRecorder = new MediaRecorder(stream);
            researchRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) researchAudioChunks.push(event.data);
            };
            researchRecorder.onstop = () => {
                setResearchRecordingState(false);
                researchAudioStream?.getTracks().forEach(track => track.stop());
                const blob = new Blob(researchAudioChunks, { type: researchRecorder.mimeType || 'audio/webm' });
                transcribeResearchBlob(blob, 'research-question.webm');
            };
            researchRecorder.start();
            setResearchRecordingState(true);
        })
        .catch(() => showNotification('Microphone permission was not granted.', 'warning'));
}

// Runtime slice from daawah.js: uploadResearchAudio.
function uploadResearchAudio() {
    const file = document.getElementById('researchAudioUpload')?.files?.[0];
    if (!file) return;
    transcribeResearchBlob(file, file.name || 'research-audio.webm');
}

// Runtime slice from daawah.js: transcribeResearchBlob.
function transcribeResearchBlob(blob, filename) {
    if (frontendOnly) {
        showNotification('Voice research needs the hosted backend and OpenAI API key.', 'warning');
        return;
    }
    if (blob.size > uploadLimits.voice.bytes) {
        showNotification(`Voice file must be ${uploadLimits.voice.label} or smaller.`, 'warning');
        return;
    }
    const status = document.getElementById('researchStatus');
    if (status) status.textContent = `Uploading voice question (${Math.max(1, Math.round(blob.size / 1024))} KB)...`;
    const formData = new FormData();
    formData.append('audio', blob, filename);
    fetch('supabase-required-endpoint?action=transcribeResearchAudio', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not transcribe audio');
        const field = document.getElementById('researchQuestion');
        if (field) field.value = result.data?.text || '';
        if (status) status.textContent = 'Transcript ready. Review or edit it, then click Research.';
        showNotification('Voice question transcribed.', 'success');
    })
    .catch(error => {
        if (status) status.textContent = 'Voice transcription unavailable.';
        showNotification(error.message || 'Could not transcribe audio', 'danger');
    });
}

// WELFARE

// Runtime slice from daawah.js: loadWelfareData.
function loadWelfareData() {
    updateWelfareRequestsList();
    syncWelfareRequestsFromAdmin();
}

// Runtime slice from daawah.js: showWelfareModal.
function showWelfareModal() {
    const modal = new bootstrap.Modal(document.getElementById('welfareModal'));
    modal.show();
}

// Runtime slice from daawah.js: submitWelfareRequest.
function submitWelfareRequest() {
    const type = document.getElementById('welfareType').value;
    const description = document.getElementById('welfareDescription').value;
    const amount = document.getElementById('welfareAmount').value;

    if (!type || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const request = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount || 'Not specified',
        dateSubmitted: new Date().toLocaleDateString(),
        status: 'Pending Review',
        submittedBy: currentUser.name || currentUser.fullName || currentUser.username,
        submittedByKey: getCurrentWelfareUserKey(),
        submittedByName: currentUser.fullName || currentUser.name || currentUser.username,
        submittedByEmail: currentUser.email || '',
        submittedByPhone: currentUser.phone || '',
        submittedByStudentId: currentUser.studentId || currentUser.username || '',
        submittedByCourse: currentUser.course || '',
        submittedByYear: currentUser.yearOfStudy || ''
    };

    if (!frontendOnly) {
        getCurrentStudentId()
        .then(studentId => fetch('supabase-required-endpoint?action=createWelfareRequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                category: type,
                description: description,
                amount: amount || 0,
                submitted_by_name: request.submittedByName,
                submitted_by_key: request.submittedByKey,
                submitted_by_email: request.submittedByEmail,
                submitted_by_phone: request.submittedByPhone,
                submitted_by_student_id: request.submittedByStudentId,
                submitted_by_course: request.submittedByCourse,
                submitted_by_year: request.submittedByYear
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save welfare request to database');
            }
            request.id = result.data?.request_id || request.id;
            request.databaseSynced = true;
            saveWelfareRequestLocally(request);
        })
        .catch(error => {
            console.error('Welfare database error:', error);
            request.databaseSynced = false;
            request.databaseSyncError = error.message || 'Database save unavailable';
            saveWelfareRequestLocally(request);
            showNotification('Request saved locally. Database sync is unavailable.', 'warning');
        });
        return;
    }

    saveWelfareRequestLocally(request);
}

// Runtime slice from daawah.js: saveWelfareRequestLocally.
function saveWelfareRequestLocally(request) {
    const existingIndex = welfareRequests.findIndex(item => Number(item.id) === Number(request.id));
    if (existingIndex >= 0) {
        welfareRequests[existingIndex] = { ...welfareRequests[existingIndex], ...request };
    } else {
        welfareRequests.push(request);
    }
    localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
    saveOwnedCloudRecord('welfareRequests', request, 'welfareRequests');
    alert('Welfare request submitted successfully!');

    document.getElementById('welfareForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('welfareModal')).hide();
    updateWelfareRequestsList();
    updateDashboardStats();
}

// Runtime slice from daawah.js: updateWelfareRequestsList.
function updateWelfareRequestsList() {
    const tbody = document.getElementById('welfareRequestsTableBody');
    if (!tbody) return;

    welfareRequests = readList('welfareRequests');
    const userKey = getCurrentWelfareUserKey();
    const userRequests = welfareRequests.filter(request => {
        if (!userKey) return true;
        return request.submittedByKey === userKey ||
            request.submittedByStudentId === currentUser?.studentId ||
            request.submittedByStudentId === currentUser?.username ||
            request.submittedByEmail === currentUser?.email ||
            request.submittedBy === currentUser?.fullName ||
            request.submittedBy === currentUser?.name ||
            request.submittedBy === currentUser?.username;
    });

    if (!userRequests.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No welfare requests submitted yet.</td></tr>';
        return;
    }

    tbody.innerHTML = userRequests.map(request => `
        <tr>
            <td>${request.type || request.category || 'Welfare Request'}</td>
            <td>${request.dateSubmitted || request.created_at || '-'}</td>
            <td><span class="badge bg-${getWelfareStatusColor(request.status)}"><i class="fas ${getWelfareStatusIcon(request.status)} me-1"></i>${formatWelfareStatus(request.status)}</span></td>
            <td>${formatWelfareAmount(request.amount || request.amount_needed)}</td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: formatWelfareStatus.
function formatWelfareStatus(status) {
    const normalized = String(status || 'Pending Review').toLowerCase();
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'completed') return 'Completed';
    return 'Pending Review';
}

// Runtime slice from daawah.js: getWelfareStatusColor.
function getWelfareStatusColor(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'success';
    if (normalized === 'rejected') return 'danger';
    return 'warning text-dark';
}

// Runtime slice from daawah.js: getWelfareStatusIcon.
function getWelfareStatusIcon(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'fa-circle-check';
    if (normalized === 'rejected') return 'fa-circle-xmark';
    return 'fa-clock';
}

// Runtime slice from daawah.js: formatWelfareAmount.
function formatWelfareAmount(amount) {
    if (amount === undefined || amount === null || amount === '' || amount === 'Not specified') {
        return 'Not specified';
    }
    return 'KSh ' + Number(amount).toLocaleString();
}

// Runtime slice from daawah.js: getCurrentWelfareUserKey.
function getCurrentWelfareUserKey() {
    return currentUser?.username || currentUser?.studentId || currentUser?.email || currentUser?.fullName || currentUser?.name || '';
}

// Runtime slice from daawah.js: syncWelfareRequestsFromAdmin.
function syncWelfareRequestsFromAdmin() {
    if (!currentUser || frontendOnly) return Promise.resolve();

    return fetch('admin_supabase-required-endpoint?action=getWelfareRequests')
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const userKey = getCurrentWelfareUserKey();
            const userName = currentUser.fullName || currentUser.name || currentUser.username || '';
            const current = readList('welfareRequests');
            const synced = result.data
                .filter(item => {
                    const dbStudentId = item.student_id || item.student_number || '';
                    const dbName = [item.first_name, item.last_name].filter(Boolean).join(' ');
                    return dbStudentId === currentUser.studentId ||
                        dbStudentId === currentUser.username ||
                        item.email === currentUser.email ||
                        dbName === userName ||
                        item.submittedByKey === userKey;
                })
                .map(item => ({
                    id: item.id,
                    type: item.type || item.category || 'Welfare Request',
                    description: item.description || '',
                    amount: item.amount || item.amount_needed || 'Not specified',
                    dateSubmitted: item.dateSubmitted || item.created_at || '-',
                    status: item.status || 'Pending Review',
                    submittedBy: userName,
                    submittedByKey: userKey,
                    submittedByName: userName,
                    submittedByEmail: currentUser.email || '',
                    submittedByPhone: currentUser.phone || '',
                    submittedByStudentId: currentUser.studentId || currentUser.username || '',
                    submittedByCourse: currentUser.course || '',
                    submittedByYear: currentUser.yearOfStudy || '',
                    databaseSynced: true
                }));

            const merged = [...current];
            synced.forEach(item => {
                const index = merged.findIndex(existing => Number(existing.id) === Number(item.id));
                if (index >= 0) {
                    merged[index] = { ...merged[index], ...item };
                } else {
                    merged.push(item);
                }
            });

            welfareRequests = merged;
            localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
            updateWelfareRequestsList();
        })
        .catch(() => {});
}

// Runtime slice from daawah.js: approveWelfare.
function approveWelfare() {
    alert('Welfare request approved!');
}

// Runtime slice from daawah.js: rejectWelfare.
function rejectWelfare() {
    if (confirm('Are you sure you want to reject this welfare request?')) {
        alert('Welfare request rejected.');
    }
}

// DUES & PAYMENTS

// Runtime slice from daawah.js: loadDuesData.
function loadDuesData() {
    const duesInfo = {
        amount: 'KSh 50',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString(),
        status: 'Pending',
        description: 'Annual membership dues'
    };

    const container = document.getElementById('duesDetails');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Dues Payment Information</h5>
                </div>
                <div class="card-body">
                    <p><strong>Amount Due:</strong> ${duesInfo.amount}</p>
                    <p><strong>Due Date:</strong> ${duesInfo.dueDate}</p>
                    <p><strong>Status:</strong> <span class="badge bg-warning">${duesInfo.status}</span></p>
                    <p><strong>Description:</strong> ${duesInfo.description}</p>
                    <button class="btn btn-primary mt-3" onclick="showPaymentModal()">Pay Now</button>
                </div>
            </div>
        `;
    }
    syncTreasurerPaymentRecords();
    renderMpesaReadinessPanel();
    renderPaymentStatusSummary();
    renderPaymentHistory();
}

// Runtime slice from daawah.js: renderPaymentStatusSummary.
function renderPaymentStatusSummary() {
    const statusContainer = document.getElementById('paymentStatusSummary');
    const summaryContainer = document.getElementById('paymentSummaryDetails');
    const completedPayments = payments.filter(payment => payment.status === 'Completed');
    const totalPaid = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    if (statusContainer) {
        if (!completedPayments.length) {
            statusContainer.innerHTML = '<p class="text-muted mb-0">No payment has been made yet.</p>';
        } else {
            statusContainer.innerHTML = completedPayments.map(payment => `
                <div class="payment-status-item">
                    <p><strong>${formatPaymentType(payment.type)}</strong></p>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-success" style="width: 100%">Paid</div>
                    </div>
                    <small class="text-muted">Amount: KSh ${payment.amount} | Paid: ${payment.date} | ${payment.paymentMethod || 'Method not specified'}</small>
                </div>
            `).join('<hr>');
        }
    }

    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <table class="table table-borderless">
                <tr>
                    <td><strong>Total Due:</strong></td>
                    <td>${completedPayments.length ? 'KSh 0' : 'Not paid yet'}</td>
                </tr>
                <tr>
                    <td><strong>Total Paid:</strong></td>
                    <td>KSh ${totalPaid.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Next Due Date:</strong></td>
                    <td>Not set</td>
                </tr>
            </table>
            <button class="btn btn-primary w-100" onclick="showPaymentModal()">Make Payment</button>
        `;
    }
}

// Runtime slice from daawah.js: formatPaymentType.
function formatPaymentType(type) {
    const labels = {
        membershipDues: 'Membership Dues',
        activityFee: 'Activity Fee',
        specialEvents: 'Special Events Fee',
        other: 'Other Payment'
    };
    return labels[type] || type || 'Payment';
}

// Runtime slice from daawah.js: toDisplayStatus.
function toDisplayStatus(status) {
    const normalized = String(status || '').toLowerCase();
    const labels = {
        pending: 'Pending Approval',
        completed: 'Completed',
        failed: 'Failed',
        rejected: 'Rejected',
        late: 'Late',
        waived: 'Waived',
        pending_main_approval: 'Pending Main Approval',
        reversed: 'Reversed'
    };
    return labels[normalized] || status || 'Pending Approval';
}

// Runtime slice from daawah.js: statusBadgeClass.
function statusBadgeClass(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'completed') return 'bg-success';
    if (['failed', 'rejected', 'late', 'reversed'].includes(normalized)) return 'bg-danger';
    if (normalized === 'waived') return 'bg-secondary';
    return 'bg-warning text-dark';
}

// Runtime slice from daawah.js: normalizedDisplayStatus.
function normalizedDisplayStatus(status) {
    return String(status || '').toLowerCase();
}

// Runtime slice from daawah.js: transactionMatchesFilter.
function transactionMatchesFilter(record, search, filter) {
    const status = normalizedDisplayStatus(record.status);
    const filterMatch = filter === 'all'
        || (filter === 'pending' && (status.includes('pending') || status.includes('m-pesa')))
        || (filter === 'failed' && (status.includes('failed') || status.includes('rejected') || status.includes('late')))
        || (filter === 'completed' && status.includes('completed'))
        || (filter === 'waived' && status.includes('waived'));
    if (!filterMatch) return false;

    const haystack = [
        record.memberName,
        record.donor,
        record.studentId,
        record.type,
        record.paymentMethod,
        record.transactionRef,
        record.receiptNumber,
        record.proofUrl,
        record.proofMethod,
        record.amount,
        record.status
    ].join(' ').toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
}

// Runtime slice from daawah.js: sortTransactions.
function sortTransactions(records) {
    const priority = status => {
        const normalized = normalizedDisplayStatus(status);
        if (normalized.includes('pending')) return 0;
        if (normalized.includes('failed') || normalized.includes('rejected')) return 1;
        if (normalized.includes('waived') || normalized.includes('late')) return 2;
        return 3;
    };
    return [...records].sort((a, b) => priority(a.status) - priority(b.status));
}

// Runtime slice from daawah.js: renderMpesaReadinessPanel.
function renderMpesaReadinessPanel() {
    const panel = document.getElementById('mpesaReadinessPanel');
    if (!panel) return;
    const ready = canUseMpesaStk();
    const caps = hostingCapabilities || {};
    panel.innerHTML = `
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div>
                    <h6 class="mb-1">M-Pesa STK Status</h6>
                    <small class="text-muted">${ready ? 'Live STK Push is available for member payments.' : 'STK Push is not configured here. Manual payment methods remain available.'}</small>
                </div>
                <span class="badge ${ready ? 'bg-success' : 'bg-warning text-dark'}">${ready ? 'Configured' : 'Manual mode'}</span>
            </div>
            <div class="row g-2 mt-3 small">
                <div class="col-6">cURL: <strong>${caps.curl_loaded ? 'Ready' : 'Missing'}</strong></div>
                <div class="col-6">Daraja: <strong>${caps.mpesa_configured ? 'Configured' : 'Not set'}</strong></div>
                <div class="col-12">Callback URL must be public HTTPS and include the optional secret when configured.</div>
            </div>
        </div>
    `;
}

// Runtime slice from daawah.js: mergeByDatabaseId.
function mergeByDatabaseId(localRecords, remoteRecords, idKey) {
    const merged = [...localRecords];
    remoteRecords.forEach(record => {
        const index = merged.findIndex(item => Number(item[idKey]) === Number(record[idKey]));
        if (index >= 0) {
            merged[index] = { ...merged[index], ...record };
        } else {
            merged.push(record);
        }
    });
    return merged;
}

// Runtime slice from daawah.js: syncTreasurerPaymentRecords.
function syncTreasurerPaymentRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`supabase-required-endpoint?action=getPaymentRecords&${authQuery()}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const remotePayments = result.data.map(row => {
                const memberName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
                return {
                    dbPaymentId: Number(row.id),
                    memberName: memberName || row.student_id || row.email || 'Member',
                    studentId: row.student_id || '',
                    type: row.payment_type || 'Payment',
                    amount: row.amount,
                    date: row.created_at ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString() : 'Recently',
                    status: toDisplayStatus(row.status),
                    paymentMethod: row.payment_method || 'Not specified',
                    transactionRef: row.transaction_id || '',
        receiptNumber: row.receipt_number || row.transaction_id || '',
                    proofUrl: row.proof_url || '',
                    proofMethod: row.proof_url ? 'Proof link/file' : 'Reference only',
                    notes: row.notes || '',
                    approvedBy: row.approved_by || '',
                    approvedAt: row.approved_at || ''
                };
            });
            payments = mergeByDatabaseId(payments, remotePayments, 'dbPaymentId');
            localStorage.setItem('payments', JSON.stringify(payments));
            renderPaymentStatusSummary();
            renderPaymentHistory();
        })
        .catch(error => console.error('Payment records sync error:', error));
}

// Runtime slice from daawah.js: showPaymentModal.
function showPaymentModal(defaultType = '') {
    const typeSelect = document.getElementById('paymentType');
    const amountInput = document.getElementById('paymentAmount');
    if (typeSelect && defaultType) {
        typeSelect.value = defaultType;
    }
    if (amountInput && defaultType === 'membershipDues' && !amountInput.value) {
        amountInput.value = '50';
    }
    updatePaymentInstructions('payment');
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

// Runtime slice from daawah.js: normalizeMpesaPhone.
function normalizeMpesaPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
    return digits;
}

// Runtime slice from daawah.js: updatePaymentInstructions.
function updatePaymentInstructions(context) {
    const isDonation = context === 'donation';
    const prefix = isDonation ? 'donation' : 'payment';
    const select = document.getElementById(`${prefix}PaymentMethod`);
    const box = document.getElementById(`${prefix}PaymentInstructions`);

    if (!select || !box) return;

    const method = select.value;
    const isStk = method === 'mpesaStk';
    const mpesaAvailable = canUseMpesaStk();

    // Helper to toggle visibility for related UI groups
    const toggle = (id, condition) => {
        document.getElementById(`${prefix}${id}`)?.classList.toggle('d-none', condition);
    };

    toggle('MpesaPhoneGroup', !isStk || !mpesaAvailable);
    toggle('ReferenceGroup', isStk);
    toggle('ProofGroup', isStk);
    toggle('ProofLinkGroup', isStk);

    if (isStk && !mpesaAvailable) {
        box.innerHTML = '<strong>M-Pesa STK Push is not available on this server yet.</strong><br>Use Bank Transfer, Normal Transfer, or Cash Payment and the Treasurer can confirm it from the admin panel.';
        box.classList.remove('d-none');
        return;
    }

    const account = paymentAccounts[method];
    if (!account) {
        box.innerHTML = '';
        box.classList.add('d-none');
        return;
    }

    const userRef = currentUser?.studentId || currentUser?.username || 'my record';
    const whatsappUrl = getTreasurerWhatsappUrl(`Assalamu alaikum Treasurer, I want to send payment proof for ${userRef}.`);
    const note = isStk
        ? 'Receipt is generated only after Safaricom confirms the M-Pesa payment.'
        : 'Enter the real transaction reference. The Treasurer confirms it before a receipt is generated.';

    const proofHelp = isStk ? '' : `<br><br><strong>Free proof option:</strong> Keep the transaction reference here, then either paste a Google Drive proof link or send the screenshot on <a href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>.`;
    
    box.innerHTML = `${account.html}<hr class="my-2"><strong>Important:</strong> ${note}${proofHelp}`;
    box.classList.remove('d-none');
}

// Runtime slice from daawah.js: readFinanceProof.
function readFinanceProof(inputId) {
    const input = document.getElementById(inputId);
    const file = input?.files?.[0];
    if (!file) return Promise.resolve('');
    if (!validateUploadFile(file, 'financeProof')) {
        input.value = '';
        return Promise.reject(new Error('Payment proof must be a JPG, PNG, WebP, or PDF file and 3MB or smaller.'));
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read payment proof file.'));
        reader.readAsDataURL(file);
    });
}

// Runtime slice from daawah.js: normalizeFinanceReference.
function normalizeFinanceReference(reference) {
    return String(reference || '').trim().toUpperCase().replace(/\s+/g, '');
}

// Runtime slice from daawah.js: isDuplicateFinanceReference.
function isDuplicateFinanceReference(reference) {
    const normalized = normalizeFinanceReference(reference);
    if (!normalized || normalized.startsWith('CASH-')) return false;
    return payments.concat(donations).some(item => normalizeFinanceReference(item.transactionRef) === normalized);
}

// Runtime slice from daawah.js: buildReceiptVerificationPayload.
function buildReceiptVerificationPayload(kind, record) {
    return {
        kind,
        receiptNumber: record.receiptNumber || '',
        amount: Number(record.amount || 0),
        status: record.status || 'Completed',
        type: record.type || kind,
        name: kind === 'Donation'
            ? (record.donor || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Donor')
            : (currentUser?.fullName || currentUser?.name || currentUser?.username || 'Member'),
        method: record.paymentMethod || 'Not specified',
        transactionRef: record.transactionRef || '',
        approvedBy: record.approvedBy || getFinanceActorName(),
        approvedAt: record.approvedAt || new Date().toISOString(),
        createdAt: record.createdAt || record.date || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: Array.isArray(record.auditTrail) ? record.auditTrail : []
    };
}

// Runtime slice from daawah.js: processPayment.
function processPayment() {
    const paymentType = document.getElementById('paymentType').value;
    const amount = document.getElementById('paymentAmount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const reference = document.getElementById('paymentReference')?.value.trim() || '';
    const proofLink = document.getElementById('paymentProofLink')?.value.trim() || '';

    if (!paymentType || !amount || !paymentMethod) {
        alert('Please fill in all payment details');
        return;
    }
    if (Number(amount) <= 0) {
        alert('Enter a valid positive amount.');
        return;
    }

    if (paymentMethod === 'mpesaStk') {
        if (!canUseMpesaStk()) {
            alert('M-Pesa STK Push is not available on this hosting setup yet. Please use Bank Transfer, Normal Transfer, or Cash Payment.');
            return;
        }
        startMpesaPayment({
            source: 'payment',
            type: paymentType,
            amount: amount,
            phone: document.getElementById('paymentMpesaPhone').value
        });
        return;
    }

    if (paymentMethod !== 'cash' && !reference) {
        alert('Enter the real transaction code or bank reference.');
        return;
    }

    const transactionRef = reference || `CASH-${Date.now()}`;
    if (paymentMethod !== 'cash' && isDuplicateFinanceReference(transactionRef)) {
        recordSuspiciousActivity('duplicate_payment_reference', { transactionRef, type: paymentType });
        alert('This transaction reference is already recorded. Please check the code before submitting again.');
        return;
    }
    if (proofLink && !/^https?:\/\/.+/i.test(proofLink)) {
        alert('Paste a valid Google Drive proof link starting with https://');
        return;
    }
    if (paymentMethod !== 'cash' && !confirm('Before submitting: confirm the transaction reference is correct and you pasted a Google Drive proof link or will send the screenshot by WhatsApp. Continue?')) {
        return;
    }
    readFinanceProof('paymentProof')
        .then(proofData => {
            const payment = {
                id: Date.now(),
                type: paymentType,
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'Pending Approval',
                paymentMethod: paymentAccounts[paymentMethod].label,
                transactionRef: transactionRef,
                receiptNumber: '',
                proofUrl: proofLink || (proofData ? 'Attached proof' : ''),
                proofMethod: proofLink ? 'Google Drive link' : (proofData ? 'Local attachment' : 'WhatsApp/manual')
            };
            if (frontendOnly) {
                savePaymentLocally(payment);
                return null;
            }
            return getCurrentStudentId()
        .then(studentId => fetch('supabase-required-endpoint?action=recordPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                payment_type: paymentType,
                amount: amount,
                due_date: new Date().toISOString().slice(0, 10),
                payment_method: payment.paymentMethod,
                        transaction_id: transactionRef,
                notes: 'Payment submitted by member and awaiting treasurer confirmation.',
                        proof_data: proofData,
                        proof_url: proofLink
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save payment to database');
            }
            payment.dbPaymentId = result.data.payment_id;
                    if (result.data.proof_url) payment.proofUrl = result.data.proof_url;
            savePaymentLocally(payment);
                });
        })
        .catch(error => {
            console.error('Payment database error:', error);
            alert(error.message || 'Payment could not be saved to the database.');
        });
}

// Runtime slice from daawah.js: startMpesaPayment.
function startMpesaPayment(details) {
    const phone = normalizeMpesaPhone(details.phone);
    if (!phone || phone.length !== 12 || !phone.startsWith('254')) {
        alert('Please enter a valid M-Pesa phone number, for example 254712345678.');
        return;
    }

    if (frontendOnly) {
        alert('M-Pesa STK Push needs the hosted backend, so it is not available on the GitHub Pages demo. Please use Bank Transfer, Normal Transfer, or Cash on the live demo.');
        return;
    }

    if (!canUseMpesaStk()) {
        alert('M-Pesa STK Push is not ready on this server. Please use Bank Transfer, Normal Transfer, or Cash Payment.');
        return;
    }

    const payload = {
        source: details.source,
        amount: details.amount,
        phone: phone
    };

    if (details.source === 'payment') {
        payload.payment_type = details.type;
    } else {
        payload.donation_type = details.type;
        payload.purpose = "UMMA University Dawah Team donation";
        payload.donor_id = currentUser?.dbUserId || 0;
        payload.donor_name = details.anonymous ? 'Anonymous' : (currentUser?.name || currentUser?.fullName || currentUser?.username || 'Donor');
        payload.donor_email = currentUser?.email || 'anonymous@dawaah.local';
    }

    const ready = details.source === 'payment'
        ? getCurrentStudentId().then(studentId => ({ ...payload, student_id: studentId }))
        : Promise.resolve(payload);

    ready
        .then(body => fetch('mpesa_supabase-required-endpoint?action=initiateStkPush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not start M-Pesa STK Push');
            }

            const localRecord = {
                type: details.type,
                amount: details.amount,
                date: new Date().toLocaleDateString(),
                status: 'Pending M-Pesa',
                paymentMethod: 'M-Pesa STK Push',
                transactionRef: result.data.checkout_request_id,
                receiptNumber: '',
                checkoutRequestId: result.data.checkout_request_id
            };

            if (details.source === 'payment') {
                localRecord.dbPaymentId = result.data.payment_id;
                payments.push(localRecord);
                localStorage.setItem('payments', JSON.stringify(payments));
                bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
                renderPaymentHistory();
            } else {
                localRecord.purpose = "UMMA University Dawah Team donation";
                localRecord.anonymous = details.anonymous;
                localRecord.donor = payload.donor_name;
                localRecord.dbDonationId = result.data.donation_id;
                donations.push(localRecord);
                localStorage.setItem('donations', JSON.stringify(donations));
                bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
                renderDonationHistory();
            }

            alert('STK Push sent. Enter your M-Pesa PIN on your phone. Receipt will appear after Safaricom confirms payment.');
            pollMpesaStatus(result.data.checkout_request_id, details.source);
        })
        .catch(error => {
            console.error('M-Pesa STK error:', error);
            alert(error.message || 'M-Pesa STK Push failed.');
        });
}

// Runtime slice from daawah.js: pollMpesaStatus.
function pollMpesaStatus(checkoutRequestId, source, attempts = 0) {
    if (attempts > 20) {
        alert('M-Pesa confirmation is taking longer than expected. Check the admin panel or refresh later.');
        return;
    }

    setTimeout(() => {
        fetch(`mpesa_supabase-required-endpoint?action=getTransactionStatus&checkout_request_id=${encodeURIComponent(checkoutRequestId)}`)
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success || !result.data) {
                    pollMpesaStatus(checkoutRequestId, source, attempts + 1);
                    return;
                }

                const tx = result.data;
                if (tx.status === 'completed') {
                    markLocalMpesaCompleted(checkoutRequestId, source, tx.mpesa_receipt || tx.transaction_id);
                    alert('M-Pesa payment confirmed. Receipt is now available.');
                    return;
                }

                if (tx.status === 'failed') {
                    markLocalMpesaFailed(checkoutRequestId, source);
                    alert('M-Pesa payment was not completed.');
                    return;
                }

                pollMpesaStatus(checkoutRequestId, source, attempts + 1);
            })
            .catch(() => pollMpesaStatus(checkoutRequestId, source, attempts + 1));
    }, 3000);
}

// Runtime slice from daawah.js: markLocalMpesaCompleted.
function markLocalMpesaCompleted(checkoutRequestId, source, receiptNumber) {
    const updateRecord = record => record.checkoutRequestId === checkoutRequestId
        ? { ...record, status: 'Completed', receiptNumber: receiptNumber || ('MPESA-' + Date.now()), transactionRef: receiptNumber || checkoutRequestId }
        : record;

    if (source === 'payment') {
        payments = payments.map(updateRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        if (getCompletedMembershipDuesPayment()) {
            if (currentUser?.membershipCardAppliedAt) {
                ensureActiveMembershipCard();
            } else {
                updateStoredMembershipCardState({
                    membershipCardStatus: currentUser?.membershipCardStatus || ''
                });
            }
        }
        renderPaymentStatusSummary();
        loadMembershipStatus();
        updateDashboardStats();
        renderPaymentHistory();
    } else {
        donations = donations.map(updateRecord);
        localStorage.setItem('donations', JSON.stringify(donations));
        renderDonationHistory();
    }
}

// Runtime slice from daawah.js: markLocalMpesaFailed.
function markLocalMpesaFailed(checkoutRequestId, source) {
    const updateRecord = record => record.checkoutRequestId === checkoutRequestId ? { ...record, status: 'Failed' } : record;
    if (source === 'payment') {
        payments = payments.map(updateRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        renderPaymentHistory();
    } else {
        donations = donations.map(updateRecord);
        localStorage.setItem('donations', JSON.stringify(donations));
        renderDonationHistory();
    }
}

// Runtime slice from daawah.js: savePaymentLocally.
function savePaymentLocally(payment) {
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    saveOwnedCloudRecord('payments', payment, 'payments');
    const sendProof = confirm('Payment submitted. The treasurer must confirm it before a receipt is available.\n\nDo you want to send proof screenshot by WhatsApp now?');
    if (sendProof) {
        const message = `Assalamu alaikum Treasurer, payment proof for ${currentUser?.fullName || currentUser?.username || 'student'} (${currentUser?.studentId || ''}). Reference: ${payment.transactionRef}. Amount: KSh ${payment.amount}.`;
        window.open(getTreasurerWhatsappUrl(message), '_blank', 'noopener');
    }

    document.getElementById('paymentForm').reset();
    updatePaymentInstructions('payment');
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    renderPaymentStatusSummary();
    loadMembershipStatus();
    updateDashboardStats();
    renderPaymentHistory();
}

// Runtime slice from daawah.js: getCurrentStudentId.
function getCurrentStudentId() {
    if (currentUser?.dbStudentId) {
        return Promise.resolve(currentUser.dbStudentId);
    }

    const identifier = currentUser?.studentId || currentUser?.email || currentUser?.username;
    if (!identifier) {
        return Promise.reject(new Error('Student record is missing. Please register/login again.'));
    }

    return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.id) {
                return ensureCurrentUserStudentRecord();
            }
            currentUser.dbStudentId = result.data.id;
            currentUser.dbUserId = result.data.user_id;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return result.data.id;
        });
}

// Runtime slice from daawah.js: ensureCurrentUserStudentRecord.
function ensureCurrentUserStudentRecord() {
    return fetch('supabase-required-endpoint?action=ensureStudentRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser?.username || currentUser?.studentId || currentUser?.email,
            student_id: currentUser?.studentId || currentUser?.username,
            email: currentUser?.email,
            password: currentUser?.password,
            role: currentUser?.role || currentRole || 'student',
            full_name: currentUser?.fullName || currentUser?.name || currentUser?.username,
            phone: currentUser?.phone,
            gender: currentUser?.gender,
            nationality: currentUser?.nationality,
            school: currentUser?.school,
            course: currentUser?.course,
            year_of_study: currentUser?.yearOfStudy,
            semester: currentUser?.semester,
            degree_type: 'degree',
            home_address: currentUser?.homeAddress,
            emergency_contact: currentUser?.emergencyContact,
            local_guardian: currentUser?.localGuardian
        })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data?.student_id) {
            throw new Error(result.message || 'Could not create student record in the database.');
        }
        currentUser.dbStudentId = result.data.student_id;
        currentUser.dbUserId = result.data.user_id;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return result.data.student_id;
    });
}

// Runtime slice from daawah.js: renderPaymentHistory.
function renderPaymentHistory() {
    const tbody = document.getElementById('paymentHistoryList');
    if (!tbody) return;

    notifyFinanceStatusChanges('payments', payments);
    const controls = document.getElementById('paymentReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && payments.length < 2);
    renderFinanceSummary('paymentFinanceSummary', payments);
    const statusFilter = document.getElementById('paymentStatusFilter')?.value || 'all';
    const search = document.getElementById('paymentSearchInput')?.value || '';
    const visiblePayments = sortTransactions(payments.map((payment, index) => ({ ...payment, originalIndex: index })))
        .filter(payment => transactionMatchesFilter(payment, search, statusFilter));

    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">${renderEmptyState('fa-receipt', 'No payments yet', 'Payment history will appear here after dues are submitted.')}</td></tr>`;
        return;
    }

    if (visiblePayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No matching payments found.</td></tr>';
        return;
    }

    tbody.innerHTML = visiblePayments.map((payment) => `
        <tr>
            <td>${payment.date}</td>
            <td>${formatPaymentType(payment.type)}${payment.memberName ? `<br><small class="text-muted">${escapeHtml(payment.memberName)}</small>` : ''}</td>
            <td>KSh ${payment.amount}</td>
            <td>${payment.paymentMethod || 'Not specified'}${payment.transactionRef ? `<br><small class="text-muted">${escapeHtml(payment.transactionRef)}</small>` : ''}${renderProofLink(payment.proofUrl)}</td>
            <td><span class="badge ${statusBadgeClass(payment.status)}">${payment.status}</span></td>
            <td>${renderPaymentActions(payment, payment.originalIndex)}</td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: renderFinanceSummary.
function renderFinanceSummary(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!hasPermission('manage_payments')) {
        container.innerHTML = '';
        return;
    }
    const completed = records.filter(item => item.status === 'Completed');
    const pending = records.filter(item => ['Pending Approval', 'Pending M-Pesa'].includes(item.status));
    const rejected = records.filter(item => ['Failed', 'Rejected'].includes(item.status));
    const total = completed.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const cards = [
        ['Completed', completed.length, `KSh ${total.toLocaleString()}`],
        ['Pending Review', pending.length, 'Needs confirmation'],
        ['Rejected/Failed', rejected.length, 'Closed items']
    ];
    container.innerHTML = cards.map(([label, value, helper]) => `
        <div class="col-md-4">
            <div class="payment-mini">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${label}</strong>
                    <span>${value}</span>
                </div>
                <small class="text-muted">${helper}</small>
            </div>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: memberVerificationUrl.
function memberVerificationUrl(member = currentUser) {
    const identifier = member?.studentId || member?.username || member?.email || 'member';
    const base = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
    return `${base}verify-member.html?id=${encodeURIComponent(identifier)}`;
}

// Runtime slice from daawah.js: membershipCardVerificationUrl.
function membershipCardVerificationUrl(cardId) {
    const base = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
    return `${base}verify-member.html?card=${encodeURIComponent(cardId || '')}`;
}

// Runtime slice from daawah.js: openMemberDigitalCard.
function openMemberDigitalCard() {
    if (!currentUser) return;
    const body = document.getElementById('memberDigitalCardBody');
    if (!body) return;
    const name = currentUser.fullName || currentUser.name || currentUser.username || 'Member';
    const studentId = currentUser.studentId || currentUser.username || 'Not set';
    const membershipState = getMembershipDisplayState();
    const status = membershipState.status;
    const role = formatRoleName(currentUser.role || currentRole || 'student');
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const issuedCard = completedMembershipPayment && currentUser.membershipCardAppliedAt
        ? ensureActiveMembershipCard(completedMembershipPayment)
        : null;
    const cardPaymentStatus = completedMembershipPayment ? 'Paid' : 'No payment';
    const cardApplicationStatus = currentUser.membershipCardAppliedAt
        ? (completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment')
        : 'Not applied';
    const cardId = issuedCard?.cardId || currentUser.membershipCardId || 'Not issued';
    const verifyUrl = issuedCard ? membershipCardVerificationUrl(cardId) : memberVerificationUrl(currentUser);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(verifyUrl)}`;
    const settings = getLocalSiteSettings();
    const signatureName = displaySignatureName(settings.finance_signature_name, 'Imam');
    const signatureTitle = displaySignatureTitle(settings.finance_signature_title, 'Imam');
    const signatureImage = isReceiptSignatureImage(settings.finance_signature_image) ? settings.finance_signature_image : '';
    const printButton = document.getElementById('memberDigitalCardPrintButton');
    if (printButton) {
        printButton.disabled = !completedMembershipPayment || !issuedCard;
        printButton.title = completedMembershipPayment ? 'Print membership card' : 'Complete membership dues payment before printing';
    }
    body.innerHTML = `
        <section id="memberDigitalCard" class="border rounded p-3 bg-white">
            <div class="d-flex justify-content-between gap-3 align-items-start">
                <div>
                    <div class="small text-muted">UMMA University Dawah Team</div>
                    <h4 class="mb-1">${escapeHtml(name)}</h4>
                    <div class="badge ${membershipState.badgeClass}">${escapeHtml(status)}</div>
                </div>
                <img src="assets/umma-university-logo-color.png?v=20260522-logo2" alt="UMMA University logo" style="width:64px;height:64px;object-fit:contain;">
            </div>
            <hr>
            <div class="row g-2">
                <div class="col-12"><small class="text-muted">Unique Card ID</small><br><strong>${escapeHtml(cardId)}</strong></div>
                <div class="col-6"><small class="text-muted">Student ID</small><br><strong>${escapeHtml(studentId)}</strong></div>
                <div class="col-6"><small class="text-muted">Role</small><br><strong>${escapeHtml(role)}</strong></div>
                <div class="col-12"><small class="text-muted">Course</small><br><strong>${escapeHtml(currentUser.course || 'Not set')}</strong></div>
                <div class="col-6"><small class="text-muted">Card Application</small><br><strong>${escapeHtml(cardApplicationStatus)}</strong></div>
                <div class="col-6"><small class="text-muted">Payment</small><br><span class="badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${escapeHtml(cardPaymentStatus)}</span></div>
                <div class="col-6"><small class="text-muted">Issued</small><br><strong>${issuedCard?.issuedAt ? escapeHtml(new Date(issuedCard.issuedAt).toLocaleDateString()) : 'After payment'}</strong></div>
                <div class="col-6"><small class="text-muted">Expires</small><br><strong>${escapeHtml(formatMembershipDate(issuedCard?.expiresAt || currentUser.membershipCardExpiresAt, 'After issue'))}</strong></div>
                <div class="col-6"><small class="text-muted">Validity</small><br><strong>${escapeHtml(String(issuedCard?.validityYears || currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser)))} years</strong></div>
                <div class="col-6"><small class="text-muted">Receipt</small><br><strong>${escapeHtml(issuedCard?.receiptNumber || 'Not issued')}</strong></div>
            </div>
            <div class="d-flex justify-content-between align-items-end gap-3 mt-3">
                <div>
                    <small class="text-muted d-block">Issuer signature</small>
                    ${signatureImage ? `<img src="${signatureImage}" alt="Issuer signature" style="max-width:180px;max-height:52px;object-fit:contain;">` : '<div style="height:42px;border-bottom:1px solid #111;width:180px;"></div>'}
                    <strong class="d-block small">${escapeHtml(signatureName)}</strong>
                    <span class="small text-muted">${escapeHtml(signatureTitle)}</span>
                </div>
                <div class="text-end">
                <small class="text-muted d-block">Scan to verify this exact card.</small>
                <img src="${qrUrl}" alt="Member verification QR code" style="width:112px;height:112px;">
                </div>
            </div>
            ${completedMembershipPayment ? '' : '<div class="alert alert-warning mt-3 mb-0">Printing is locked until membership dues payment is completed.</div>'}
        </section>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('memberDigitalCardModal')).show();
}

// Runtime slice from daawah.js: printMemberDigitalCard.
function printMemberDigitalCard() {
    if (!getCompletedMembershipDuesPayment() || !getActiveMembershipCard()) {
        showNotification('Complete membership dues payment before printing the membership card.', 'warning');
        return;
    }
    const card = document.getElementById('memberDigitalCard');
    if (!card) return;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print the member card.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Member Card</title><link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-4">${card.outerHTML}<script>window.print()<\/script></body></html>`);
    win.document.close();
}

window.openMemberDigitalCard = openMemberDigitalCard;
window.printMemberDigitalCard = printMemberDigitalCard;

// Runtime slice from daawah.js: notifyFinanceStatusChanges.
function notifyFinanceStatusChanges(kind, records) {
    if (!Array.isArray(records) || !currentUser) return;
    const key = `financeStatusSeen:${kind}:${currentUser.email || currentUser.username || currentUser.studentId || 'user'}`;
    let seen = {};
    try {
        seen = readStoredObject(key, {});
    } catch (error) {
        seen = {};
    }
    let changed = false;
    records.forEach(record => {
        const id = String(record.id || record.dbPaymentId || record.dbDonationId || record.transactionRef || '');
        if (!id) return;
        const status = String(record.status || '');
        if (!status || seen[id] === status) return;
        if (seen[id] && ['Completed', 'Rejected', 'Failed', 'Reversed'].includes(status)) {
            const label = kind === 'donations' ? 'Donation' : 'Payment';
            const message = `${label} ${status.toLowerCase()}. ${status === 'Completed' ? 'Receipt is ready.' : 'Please check the details.'}`;
            showNotification(message, status === 'Completed' ? 'success' : 'warning');
            sendBrowserNotification(`UMMA ${label} Update`, message);
        }
        seen[id] = status;
        changed = true;
    });
    if (changed) localStorage.setItem(key, JSON.stringify(seen));
}

// Runtime slice from daawah.js: enableBrowserNotifications.
function enableBrowserNotifications() {
    if (!('Notification' in window)) {
        showNotification('Browser notifications are not supported on this device.', 'warning');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            localStorage.setItem('dawaahBrowserNotifications', '1');
            sendBrowserNotification('UMMA University Dawah Team', 'Browser alerts are enabled.');
            showNotification('Browser alerts enabled.', 'success');
        } else {
            showNotification('Browser alerts were not enabled.', 'warning');
        }
    });
}

// Runtime slice from daawah.js: sendBrowserNotification.
function sendBrowserNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        new Notification(title, {
            body,
            icon: 'assets/icon-192.png',
            badge: 'assets/icon-192.png'
        });
    } catch (error) {
        console.error('Browser notification failed:', error);
    }
}

window.enableBrowserNotifications = enableBrowserNotifications;

// Runtime slice from daawah.js: exportFinanceCsv.
function exportFinanceCsv(kind) {
    const records = kind === 'donations' ? donations : payments;
    const rows = records.map(item => ({
        date: item.date || '',
        name: item.memberName || item.donor || '',
        type: item.type || '',
        amount: item.amount || '',
        method: item.paymentMethod || '',
        reference: item.transactionRef || '',
        status: item.status || '',
        receipt: item.receiptNumber || '',
        approved_by: item.approvedBy || '',
        review_note: item.reviewNote || item.notes || '',
        proof: item.proofUrl || ''
    }));
    if (!rows.length) {
        alert('No finance records to export.');
        return;
    }
    const csv = convertToCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Runtime slice from daawah.js: getPaidMemberRecordsForReport.
function getPaidMemberRecordsForReport() {
    return allMembers.filter(member =>
        String(member.membershipCardPaymentStatus || member.paymentStatus || '').toLowerCase() === 'paid'
        || String(member.membershipCardRecordStatus || '').toLowerCase() === 'active'
        || payments.some(payment =>
            isMembershipDuesPayment(payment)
            && isCompletedStatus(payment.status)
            && [member.studentId, member.username, member.email].some(value =>
                value && [payment.studentId, payment.username, payment.email, payment.ownerEmail].includes(value)
            )
        )
    );
}

// Runtime slice from daawah.js: printSystemReport.
function printSystemReport(type) {
    const sourceMap = {
        students: { title: 'Students Report', rows: allMembers },
        members: { title: 'Paid Members Report', rows: getPaidMemberRecordsForReport() },
        payments: { title: 'Membership Dues Report', rows: payments },
        donations: { title: 'Donations Report', rows: donations },
        officers: { title: 'Officers Report', rows: allMembers.filter(member => String(member.role || 'student').toLowerCase() !== 'student') },
        research: { title: 'AI Research Usage Report', rows: getResearchHistory() }
    };
    const report = sourceMap[type] || sourceMap.students;
    const rows = Array.isArray(report.rows) ? report.rows : [];
    const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row || {})))).filter(key => !/password|token|photo|image|proof/i.test(key)).slice(0, 10);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title>
<style>body{font-family:Arial,sans-serif;margin:28px;color:#17323a}h1{margin-bottom:4px}.muted{color:#667085}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}th,td{border-bottom:1px solid #ddd;padding:7px;text-align:left;vertical-align:top}th{background:#f3fbf7}@media print{button{display:none}}</style>
</head><body>
<button onclick="window.print()">Print</button>
<h1>UMMA University Dawah Team</h1>
<div class="muted">${escapeHtml(report.title)} - ${new Date().toLocaleString()} - ${rows.length} record(s)</div>
<table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${escapeHtml(String(row?.[header] ?? '').slice(0, 180))}</td>`).join('')}</tr>`).join('')}</tbody></table>
</body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print reports.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}

// Runtime slice from daawah.js: renderProofLink.
function renderProofLink(proofUrl) {
    if (!proofUrl || proofUrl === 'Attached proof') return proofUrl ? '<br><small class="text-muted">Proof attached</small>' : '';
    if (/^https?:\/\//i.test(proofUrl)) return `<br><a class="small" href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener">Open proof link</a>`;
    return `<br><a class="small" href="${resolveAppUrl('supabase-required-endpoint?action=getFinanceProof&path=' + encodeURIComponent(proofUrl))}" target="_blank" rel="noopener">View proof</a>`;
}

// Runtime slice from daawah.js: renderPaymentActions.
function renderPaymentActions(payment, index) {
    if (payment.status === 'Completed') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="downloadReceipt(${index})">Download</button>
                <button class="btn btn-outline-success" onclick="verifyFinanceReceipt('payments', ${index})">Verify</button>
                <button class="btn btn-outline-secondary" onclick="resendFinanceReceipt('payments', ${index})">Resend</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected', 'Late', 'Waived'].includes(payment.status)) {
        return `<span class="text-muted">${payment.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <button class="btn btn-sm btn-outline-primary" onclick="reviewPayment(${index})">Review</button>
            <button class="btn btn-sm btn-success" onclick="confirmPayment(${index})">Approve</button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejectPayment(${index})">Reject</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="waivePayment(${index})">Waive</button>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}

// Runtime slice from daawah.js: resendFinanceReceipt.
function resendFinanceReceipt(kind, index) {
    const records = kind === 'donations' ? donations : payments;
    const record = records[index];
    if (!record?.receiptNumber) {
        showNotification('No receipt number is available to resend.', 'warning');
        return;
    }
    const verifyUrl = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}verify-receipt.html?receipt=${encodeURIComponent(record.receiptNumber)}`;
    const recipient = record.email || record.ownerEmail || currentUser?.email || '';
    const subject = encodeURIComponent(`UMMA receipt ${record.receiptNumber}`);
    const body = encodeURIComponent(`Assalamu alaikum,\n\nYour UMMA University Dawah Team receipt is ready.\n\nReceipt: ${record.receiptNumber}\nAmount: KSh ${record.amount || 0}\nVerify: ${verifyUrl}\n\nPlease keep this link for your records.`);
    const whatsappText = encodeURIComponent(`UMMA receipt ${record.receiptNumber}: ${verifyUrl}`);
    const choice = prompt('Type EMAIL to open email, WHATSAPP to open WhatsApp, or COPY to copy the receipt link.', 'EMAIL');
    if (choice === null) return;
    const normalized = choice.trim().toUpperCase();
    if (normalized === 'EMAIL') {
        location.href = `mailto:${encodeURIComponent(recipient)}?subject=${subject}&body=${body}`;
    } else if (normalized === 'WHATSAPP') {
        window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener');
    } else if (normalized === 'COPY') {
        navigator.clipboard?.writeText(verifyUrl).then(() => showNotification('Receipt verification link copied.', 'success'));
    }
}

// Runtime slice from daawah.js: reviewPayment.
function reviewPayment(index) {
    const payment = payments[index];
    if (!payment) return;
    const details = [
        `Name: ${payment.memberName || currentUser?.fullName || 'Student'}`,
        `Type: ${formatPaymentType(payment.type)}`,
        `Amount: KSh ${payment.amount || 0}`,
        `Method: ${payment.paymentMethod || 'Not specified'}`,
        `Reference: ${payment.transactionRef || 'Not recorded'}`,
        `Status: ${payment.status || 'Pending Approval'}`,
        `Proof: ${payment.proofUrl ? 'Attached' : 'Not attached'}`
    ].join('\n');
    const note = prompt(`${details}\n\nAdd review note, or leave blank to close review:`, payment.reviewNote || '');
    if (note === null) return;
    payments[index] = {
        ...payment,
        reviewNote: note.trim(),
        reviewedBy: getFinanceActorName(),
        reviewedAt: new Date().toISOString(),
        auditTrail: appendFinanceAudit(payment, 'reviewed', note.trim() || 'Reviewed by finance/admin')
    };
    localStorage.setItem('payments', JSON.stringify(payments));
    if (payment.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord('payments', payment.supabaseId, {
            reviewNote: payments[index].reviewNote,
            reviewedBy: payments[index].reviewedBy,
            reviewedAt: payments[index].reviewedAt,
            auditTrail: payments[index].auditTrail || []
        }).catch(error => console.error('Supabase payment review update failed:', error));
    }
    renderPaymentHistory();
    showNotification('Payment review note saved.', 'success');
}

// Runtime slice from daawah.js: confirmPayment.
function confirmPayment(index) {
    const note = prompt('Approval note for this payment:', 'Approved by finance/admin');
    if (note === null) return;
    updateLocalPaymentStatus(index, 'Completed', 'completed', note);
}

// Runtime slice from daawah.js: rejectPayment.
function rejectPayment(index) {
    const reason = prompt('Why is this payment rejected? This reason is kept in the audit trail.', 'Rejected by finance/admin');
    if (reason === null) return;
    updateLocalPaymentStatus(index, 'Rejected', 'rejected', reason);
}

// Runtime slice from daawah.js: waivePayment.
function waivePayment(index) {
    const reason = prompt('Why is this payment waived?', 'Waived by finance/admin');
    if (reason === null) return;
    updateLocalPaymentStatus(index, 'Waived', 'waived', reason);
}

// Runtime slice from daawah.js: getFinanceActorName.
function getFinanceActorName() {
    return currentUser?.fullName || currentUser?.name || currentUser?.username || currentRole || 'Treasurer';
}

// Runtime slice from daawah.js: makeFinanceReceipt.
function makeFinanceReceipt(prefix, id) {
    const cleanId = String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const random = (globalThis.crypto?.getRandomValues
        ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(3))).map(value => value.toString(16).padStart(2, '0')).join('')
        : Math.random().toString(36).slice(2, 8)).toUpperCase();
    return `${prefix}-${stamp}-${cleanId}-${random}`;
}

// Runtime slice from daawah.js: makeUniqueFinanceReceipt.
function makeUniqueFinanceReceipt(prefix, id) {
    const usedReceipts = new Set(payments.concat(donations).map(item => String(item.receiptNumber || '').toUpperCase()).filter(Boolean));
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const receipt = makeFinanceReceipt(prefix, `${id || Date.now()}${attempt ? '-' + attempt : ''}`);
        if (!usedReceipts.has(receipt.toUpperCase())) return receipt;
    }
    return makeFinanceReceipt(prefix, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

// Runtime slice from daawah.js: appendFinanceAudit.
function appendFinanceAudit(record, action, note = '') {
    return [
        ...(Array.isArray(record.auditTrail) ? record.auditTrail : []),
        {
            action,
            by: getFinanceActorName(),
            at: new Date().toISOString(),
            note
        }
    ];
}

// Runtime slice from daawah.js: updateLocalPaymentStatus.
function updateLocalPaymentStatus(index, displayStatus, dbStatus, note = '') {
    const payment = payments[index];
    if (!payment) return;
    if (payment.status === 'Completed' && displayStatus !== 'Completed') {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const isCompleted = displayStatus === 'Completed';
    const now = new Date().toISOString();
    payments[index] = {
        ...payment,
        status: displayStatus,
        receiptNumber: isCompleted ? (payment.receiptNumber || makeUniqueFinanceReceipt('RCP', payment.id || payment.dbPaymentId)) : payment.receiptNumber,
        approvedBy: isCompleted ? getFinanceActorName() : payment.approvedBy,
        approvedAt: isCompleted ? now : payment.approvedAt,
        updatedBy: getFinanceActorName(),
        updatedAt: now,
        reviewNote: note || payment.reviewNote || '',
        auditTrail: appendFinanceAudit(payment, displayStatus.toLowerCase(), note || `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`)
    };
    localStorage.setItem('payments', JSON.stringify(payments));
    if (isCompleted && isMembershipDuesPayment(payments[index]) && currentUser?.membershipCardAppliedAt) {
        ensureActiveMembershipCard(payments[index]);
    }
    if (payment.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord('payments', payment.supabaseId, {
            status: payments[index].status,
            receiptNumber: payments[index].receiptNumber || '',
            approvedBy: payments[index].approvedBy || '',
            approvedAt: payments[index].approvedAt || '',
            updatedBy: payments[index].updatedBy || '',
            updatedAt: payments[index].updatedAt || '',
            reviewNote: payments[index].reviewNote || '',
            auditTrail: payments[index].auditTrail || []
        }).catch(error => console.error('Supabase payment status update failed:', error));
    }
    if (isCompleted && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationPayload('Payment', payments[index])).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    renderPaymentHistory();
    renderPaymentStatusSummary();
    loadMembershipStatus();
    updateDashboardStats();

    if (!frontendOnly && payment.dbPaymentId) {
        fetch('supabase-required-endpoint?action=updatePaymentStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authPayload({
                payment_id: payment.dbPaymentId,
                status: dbStatus,
                transaction_id: payments[index].receiptNumber,
                notes: note || `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`
            }))
        }).catch(error => console.error('Payment status update error:', error));
    }
    showNotification(`Payment ${displayStatus.toLowerCase()}.`, 'success');
}

// Runtime slice from daawah.js: isReceiptSignatureImage.
function isReceiptSignatureImage(value) {
    return /^data:image\/(png|jpeg|webp);base64,/i.test(String(value || ''));
}

// Runtime slice from daawah.js: displaySignatureTitle.
function displaySignatureTitle(value, fallback = 'Imam') {
    const title = String(value || '').trim();
    if (!title || /^(main admin|authorized signature)$/i.test(title)) return fallback;
    return title;
}

// Runtime slice from daawah.js: displaySignatureName.
function displaySignatureName(value, fallback = 'Imam') {
    const name = String(value || '').trim();
    if (!name || /^main admin$/i.test(name)) return fallback;
    return name;
}

// Runtime slice from daawah.js: openOfficialReceipt.
function openOfficialReceipt(details) {
    const receiptNumber = details.receiptNumber || details.transactionRef || '';
    if (!receiptNumber) {
        showNotification?.('This receipt is not ready yet. Finance must approve it first.', 'warning');
        return;
    }
    const verifyUrl = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}verify-receipt.html?receipt=${encodeURIComponent(receiptNumber)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(verifyUrl)}`;
    const approvedBy = details.approvedBy || (details.status === 'Completed' ? (currentUser?.fullName || currentUser?.username || 'Treasurer') : 'Pending');
    const settings = getLocalSiteSettings();
    const signatureName = displaySignatureName(details.signatureName || settings.finance_signature_name || approvedBy, 'Imam');
    const signatureTitle = displaySignatureTitle(details.signatureTitle || settings.finance_signature_title, 'Imam');
    const signatureImage = isReceiptSignatureImage(details.signatureImage)
        ? details.signatureImage
        : (isReceiptSignatureImage(settings.finance_signature_image) ? settings.finance_signature_image : '');
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(receiptNumber)} Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f3fbf7; color: #17323a; }
        .receipt { max-width: 760px; margin: 28px auto; background: #fff; border: 1px solid #b9d8d2; padding: 32px; }
        .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #40b050; padding-bottom: 18px; }
        h1 { margin: 0; font-size: 24px; letter-spacing: 0; }
        .brand { color: #003040; font-weight: 700; margin-top: 6px; }
        .badge { display: inline-block; background: #003040; color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
        td:first-child { color: #6b7280; width: 34%; }
        .amount { font-size: 28px; font-weight: 700; color: #0060b0; }
        .verify { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 24px; padding: 16px; border: 1px solid #dbe7e4; background: #f8fffb; }
        .verify p { margin: 6px 0 0; color: #6b7280; }
        .verify img { width: 132px; height: 132px; }
        .receipt-footer { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-top: 30px; }
        .signature { min-width: 240px; text-align: center; }
        .signature-box { height: 76px; border-bottom: 1px solid #17323a; display: flex; align-items: flex-end; justify-content: center; padding: 0 12px 8px; }
        .signature-box img { max-width: 220px; max-height: 64px; object-fit: contain; }
        .signature strong { display: block; margin-top: 10px; color: #17323a; }
        .signature span { display: block; color: #6b7280; font-size: 12px; margin-top: 3px; }
        .actions { max-width: 760px; margin: 18px auto; display: flex; gap: 10px; justify-content: flex-end; }
        button, a { border: 0; background: #111827; color: #fff; padding: 10px 14px; border-radius: 4px; text-decoration: none; cursor: pointer; }
        @media (max-width: 640px) { .top, .verify, .receipt-footer { flex-direction: column; align-items: flex-start; } .signature { width: 100%; } }
        @media print { .actions { display: none; } body { background: #fff; } .receipt { margin: 0; border: 0; } }
    </style>
</head>
<body>
    <div class="actions"><button onclick="window.print()">Print</button><a id="downloadReceipt" download="${escapeHtml(receiptNumber)}.html">Download HTML</a></div>
    <main class="receipt">
        <div class="top">
            <div>
                <h1>Official ${escapeHtml(details.kind)} Receipt</h1>
                <div class="brand">UMMA University Dawah Team</div>
            </div>
            <div><span class="badge">${escapeHtml(details.status || 'Completed')}</span></div>
        </div>
        <table>
            <tr><td>Receipt Number</td><td>${escapeHtml(receiptNumber)}</td></tr>
            <tr><td>Name</td><td>${escapeHtml(details.name || 'Member')}</td></tr>
            <tr><td>Type</td><td>${escapeHtml(details.type || details.kind)}</td></tr>
            <tr><td>Amount</td><td class="amount">KSh ${escapeHtml(details.amount || '0')}</td></tr>
            <tr><td>Payment Method</td><td>${escapeHtml(details.method || 'Not specified')}</td></tr>
            <tr><td>Transaction Reference</td><td>${escapeHtml(details.transactionRef || 'Not recorded')}</td></tr>
            <tr><td>Approved By</td><td>${escapeHtml(approvedBy)}</td></tr>
            <tr><td>Approved At</td><td>${escapeHtml(details.approvedAt || 'Not recorded')}</td></tr>
            <tr><td>Date</td><td>${escapeHtml(details.date || new Date().toLocaleDateString())}</td></tr>
            <tr><td>Verify Online</td><td>${escapeHtml(verifyUrl)}</td></tr>
        </table>
        <div class="verify">
            <div>
                <strong>Receipt verification QR</strong>
                <p>Scan to confirm this receipt in the UMMA University Dawah Team system.</p>
            </div>
            <img src="${qrUrl}" alt="Receipt verification QR code">
        </div>
        <div class="receipt-footer">
            <div>
                <strong>Issued by UMMA University Dawah Team</strong>
                <p style="margin:6px 0 0; color:#6b7280;">This receipt is valid after finance approval and online verification.</p>
            </div>
            <div class="signature">
                <div class="signature-box">${signatureImage ? `<img src="${escapeHtml(signatureImage)}" alt="Authorized signature">` : ''}</div>
                <strong>${escapeHtml(signatureName)}</strong>
                <span>${escapeHtml(signatureTitle)}</span>
            </div>
        </div>
    </main>
    <script>
        const html = document.documentElement.outerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        document.getElementById('downloadReceipt').href = URL.createObjectURL(blob);
    <\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Runtime slice from daawah.js: downloadReceipt.
function downloadReceipt(index) {
    const payment = payments[index];
    if (!payment) return;
    openOfficialReceipt({
        kind: 'Payment',
        receiptNumber: payment.receiptNumber,
        transactionRef: payment.transactionRef,
        name: payment.memberName || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Member',
        type: formatPaymentType(payment.type),
        amount: payment.amount,
        method: payment.paymentMethod || 'Online',
        status: payment.status,
        date: payment.date,
        approvedBy: payment.approvedBy,
        approvedAt: payment.approvedAt
    });
}

// Runtime slice from daawah.js: verifyFinanceReceipt.
function verifyFinanceReceipt(kind, index) {
    const record = kind === 'donations' ? donations[index] : payments[index];
    const receipt = record?.receiptNumber || record?.transactionRef;
    if (!receipt) {
        showNotification('No receipt number is available yet.', 'warning');
        return;
    }
    window.open(`verify-receipt.html?receipt=${encodeURIComponent(receipt)}`, '_blank', 'noopener');
}

// DONATIONS

// Runtime slice from daawah.js: loadDonationsData.
function loadDonationsData() {
    const donationStats = [
        { name: 'Zakat', amount: 'Open', description: 'Obligatory Charity', color: 'primary' },
        { name: 'Sadaqah', amount: 'Open', description: 'Voluntary Charity', color: 'success' },
        { name: 'Community Fund', amount: 'Open', description: 'Community Support', color: 'info' }
    ];

    const container = document.getElementById('donationStats');
    if (container) {
        container.innerHTML = donationStats.map(stat => `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body text-center">
                        <h6>${stat.name}</h6>
                        <p class="stat-value" style="color: var(--primary-color);">${stat.amount}</p>
                        <p class="text-muted small">${stat.description}</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="showDonationModal('${stat.name}')">Donate</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    syncTreasurerDonationRecords();
    renderDonationHistory();
}

// Runtime slice from daawah.js: syncTreasurerDonationRecords.
function syncTreasurerDonationRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`supabase-required-endpoint?action=getDonationRecords&${authQuery()}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const remoteDonations = result.data.map(row => ({
                dbDonationId: Number(row.id),
                type: row.donation_type || 'Donation',
                purpose: row.purpose || "UMMA University Dawah Team donation",
                amount: row.amount,
                date: row.created_at ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString() : 'Recently',
                paymentMethod: row.payment_method || 'Not specified',
                transactionRef: row.transaction_id || '',
                status: toDisplayStatus(row.status),
                anonymous: false,
                donor: row.donor_name || row.donor_email || 'Donor',
                proofUrl: row.proof_url || '',
                proofMethod: row.proof_url ? 'Proof link/file' : 'Reference only',
                receiptNumber: row.receipt_number || row.transaction_id || '',
                approvedBy: row.approved_by || '',
                approvedAt: row.approved_at || ''
            }));
            donations = mergeByDatabaseId(donations, remoteDonations, 'dbDonationId');
            localStorage.setItem('donations', JSON.stringify(donations));
            renderDonationHistory();
        })
        .catch(error => console.error('Donation records sync error:', error));
}

// Runtime slice from daawah.js: loadReportsData.
function loadReportsData() {
    const activeMembers = allMembers.filter(member => String(member.status || '').toLowerCase() === 'active').length;
    const completedDonations = donations
        .filter(donation => String(donation.status || '').toLowerCase() === 'completed')
        .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
    const completedEvents = allEvents.filter(event => ['completed', 'held'].includes(String(event.status || '').toLowerCase())).length;

    const reportValues = {
        reportTotalMembers: allMembers.length,
        reportActiveMembers: activeMembers,
        reportTotalDonations: completedDonations ? formatCurrency(completedDonations) : '0',
        reportEventsHeld: completedEvents
    };

    Object.entries(reportValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    });
    renderWelfareReportRows();
}

// Runtime slice from daawah.js: renderWelfareReportRows.
function renderWelfareReportRows() {
    const body = document.getElementById('welfareReportRows');
    if (!body) return;
    const labels = {
        medical: 'Medical Support',
        financial: 'Financial Assistance',
        accommodation: 'Accommodation Support',
        counseling: 'Counseling / Guidance',
        emergency: 'Emergency Support',
        other: 'Other Support'
    };
    const rows = {};
    welfareRequests.forEach(request => {
        const key = String(request.type || request.request_type || 'other').toLowerCase();
        const status = String(request.status || 'pending').toLowerCase();
        if (!rows[key]) {
            rows[key] = { label: labels[key] || formatReportLabel(key), total: 0, approved: 0, pending: 0, rejected: 0 };
        }
        rows[key].total += 1;
        if (['approved', 'completed', 'resolved'].includes(status)) rows[key].approved += 1;
        else if (['rejected', 'declined'].includes(status)) rows[key].rejected += 1;
        else rows[key].pending += 1;
    });
    const values = Object.values(rows);
    if (!values.length) {
        body.innerHTML = '<tr><td colspan="5" class="text-muted text-center">No welfare requests have been recorded yet.</td></tr>';
        return;
    }
    body.innerHTML = values.map(row => `
        <tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${row.total}</td>
            <td>${row.approved}</td>
            <td>${row.pending}</td>
            <td>${row.rejected}</td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: formatReportLabel.
function formatReportLabel(value) {
    return String(value || 'Other')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}

// Runtime slice from daawah.js: showDonationModal.
function showDonationModal(donationType) {
    document.getElementById('donationModalTitle').textContent = 'Make ' + donationType + ' Donation';
    updatePaymentInstructions('donation');
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}

// Runtime slice from daawah.js: submitDonation.
function submitDonation() {
    const amount = document.getElementById('donationAmount').value;
    const paymentMethod = document.getElementById('donationPaymentMethod').value;
    const isAnonymous = document.getElementById('anonymousDonation').checked;
    const reference = document.getElementById('donationReference')?.value.trim() || '';
    const proofLink = document.getElementById('donationProofLink')?.value.trim() || '';

    if (!amount || !paymentMethod) {
        alert('Please enter the donation amount and payment method');
        return;
    }
    if (Number(amount) <= 0) {
        alert('Enter a valid positive amount.');
        return;
    }

    if (paymentMethod === 'mpesaStk') {
        if (!canUseMpesaStk()) {
            alert('M-Pesa STK Push is not available on this hosting setup yet. Please use Bank Transfer, Normal Transfer, or Cash Payment.');
            return;
        }
        startMpesaPayment({
            source: 'donation',
            type: document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
            amount: amount,
            phone: document.getElementById('donationMpesaPhone').value,
            anonymous: isAnonymous
        });
        return;
    }

    if (paymentMethod !== 'cash' && !reference) {
        alert('Enter the real transaction code or bank reference.');
        return;
    }

    const transactionRef = reference || `CASH-DON-${Date.now()}`;
    if (paymentMethod !== 'cash' && isDuplicateFinanceReference(transactionRef)) {
        recordSuspiciousActivity('duplicate_donation_reference', { transactionRef, type: 'donation' });
        alert('This transaction reference is already recorded. Please check the code before submitting again.');
        return;
    }
    if (proofLink && !/^https?:\/\/.+/i.test(proofLink)) {
        alert('Paste a valid Google Drive proof link starting with https://');
        return;
    }
    if (paymentMethod !== 'cash' && !confirm('Before submitting: confirm the transaction reference is correct and you pasted a Google Drive proof link or will send the screenshot by WhatsApp. Continue?')) {
        return;
    }
    readFinanceProof('donationProof')
        .then(proofData => {
            const donation = {
                id: Date.now(),
                type: document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
                purpose: "UMMA University Dawah Team donation",
                amount: amount,
                date: new Date().toLocaleDateString(),
                paymentMethod: paymentAccounts[paymentMethod].label,
                transactionRef: transactionRef,
                status: 'Pending Approval',
                anonymous: isAnonymous,
                donor: isAnonymous ? 'Anonymous' : (currentUser?.name || currentUser?.fullName || currentUser?.username || 'Donor'),
                receiptNumber: '',
                proofUrl: proofLink || (proofData ? 'Attached proof' : ''),
                proofMethod: proofLink ? 'Google Drive link' : (proofData ? 'Local attachment' : 'WhatsApp/manual')
            };
            if (frontendOnly) {
                saveDonationLocally(donation);
                return null;
            }
            return fetch('supabase-required-endpoint?action=recordDonation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donor_id: currentUser?.dbUserId || 0,
                    donor_name: donation.donor,
                    donor_email: currentUser?.email || 'anonymous@dawaah.local',
                    amount: amount,
                    donation_type: donation.type,
                    purpose: donation.purpose,
                    payment_method: donation.paymentMethod,
                    transaction_id: transactionRef,
                    proof_data: proofData,
                    proof_url: proofLink
                })
            })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Could not save donation to database');
                }
                donation.dbDonationId = result.data.donation_id;
                if (result.data.proof_url) donation.proofUrl = result.data.proof_url;
                saveDonationLocally(donation);
            });
        })
        .catch(error => {
            console.error('Donation database error:', error);
            alert(error.message || 'Donation could not be saved to the database.');
        });
}

// Runtime slice from daawah.js: saveDonationLocally.
function saveDonationLocally(donation) {
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    saveOwnedCloudRecord('donations', donation, 'donations');
    const sendProof = confirm('Donation submitted. The treasurer must confirm it before a receipt is available.\n\nDo you want to send proof screenshot by WhatsApp now?');
    if (sendProof) {
        const message = `Assalamu alaikum Treasurer, donation proof from ${donation.donor || 'Donor'}. Reference: ${donation.transactionRef}. Amount: KSh ${donation.amount}.`;
        window.open(getTreasurerWhatsappUrl(message), '_blank', 'noopener');
    }

    document.getElementById('donationForm').reset();
    updatePaymentInstructions('donation');
    bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
    renderDonationHistory();
}

// Runtime slice from daawah.js: renderDonationHistory.
function renderDonationHistory() {
    const tbody = document.getElementById('donationHistoryList');
    if (!tbody) return;

    notifyFinanceStatusChanges('donations', donations);
    const controls = document.getElementById('donationReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && donations.length < 2);
    renderFinanceSummary('donationFinanceSummary', donations);
    const statusFilter = document.getElementById('donationStatusFilter')?.value || 'all';
    const search = document.getElementById('donationSearchInput')?.value || '';
    const visibleDonations = sortTransactions(donations.map((donation, index) => ({ ...donation, originalIndex: index })))
        .filter(donation => transactionMatchesFilter(donation, search, statusFilter));

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No donations made yet.</td></tr>';
        return;
    }

    if (visibleDonations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No matching donations found.</td></tr>';
        return;
    }

    tbody.innerHTML = visibleDonations.map((donation) => `
        <tr>
            <td>${donation.date || 'Recently'}</td>
            <td>${donation.type || 'Donation'}${donation.donor ? `<br><small class="text-muted">${escapeHtml(donation.donor)}</small>` : ''}</td>
            <td>KSh ${donation.amount}</td>
            <td>${donation.purpose || "UMMA University Dawah Team donation"}</td>
            <td>${donation.paymentMethod || 'Not specified'}${donation.transactionRef ? `<br><small class="text-muted">${escapeHtml(donation.transactionRef)}</small>` : ''}${renderProofLink(donation.proofUrl)}</td>
            <td><span class="badge ${statusBadgeClass(donation.status)}">${donation.status || 'Pending Approval'}</span></td>
            <td>${renderDonationActions(donation, donation.originalIndex)}</td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: renderDonationActions.
function renderDonationActions(donation, index) {
    if (donation.status === 'Completed') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="downloadDonationReceipt(${index})">Download</button>
                <button class="btn btn-outline-success" onclick="verifyFinanceReceipt('donations', ${index})">Verify</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected'].includes(donation.status)) {
        return `<span class="text-muted">${donation.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <button class="btn btn-sm btn-success" onclick="confirmDonation(${index})">Confirm</button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejectDonation(${index})">Reject</button>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}

// Runtime slice from daawah.js: confirmDonation.
function confirmDonation(index) {
    updateLocalDonationStatus(index, 'Completed', 'completed');
}

// Runtime slice from daawah.js: rejectDonation.
function rejectDonation(index) {
    updateLocalDonationStatus(index, 'Rejected', 'rejected');
}

// Runtime slice from daawah.js: updateLocalDonationStatus.
function updateLocalDonationStatus(index, displayStatus, dbStatus) {
    const donation = donations[index];
    if (!donation) return;
    if (donation.status === 'Completed' && displayStatus !== 'Completed') {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const isCompleted = displayStatus === 'Completed';
    const now = new Date().toISOString();
    donations[index] = {
        ...donation,
        status: displayStatus,
        receiptNumber: isCompleted ? (donation.receiptNumber || makeUniqueFinanceReceipt('DRT', donation.id || donation.dbDonationId)) : donation.receiptNumber,
        approvedBy: isCompleted ? getFinanceActorName() : donation.approvedBy,
        approvedAt: isCompleted ? now : donation.approvedAt,
        updatedBy: getFinanceActorName(),
        updatedAt: now,
        auditTrail: appendFinanceAudit(donation, displayStatus.toLowerCase(), `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`)
    };
    localStorage.setItem('donations', JSON.stringify(donations));
    if (donation.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord('donations', donation.supabaseId, {
            status: donations[index].status,
            receiptNumber: donations[index].receiptNumber || '',
            approvedBy: donations[index].approvedBy || '',
            approvedAt: donations[index].approvedAt || '',
            updatedBy: donations[index].updatedBy || '',
            updatedAt: donations[index].updatedAt || '',
            auditTrail: donations[index].auditTrail || []
        }).catch(error => console.error('Supabase donation status update failed:', error));
    }
    if (isCompleted && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationPayload('Donation', donations[index])).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    renderDonationHistory();

    if (!frontendOnly && donation.dbDonationId) {
        fetch('supabase-required-endpoint?action=updateDonationStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authPayload({
                donation_id: donation.dbDonationId,
                status: dbStatus,
                transaction_id: donations[index].receiptNumber
            }))
        }).catch(error => console.error('Donation status update error:', error));
    }
    showNotification(`Donation ${displayStatus.toLowerCase()}.`, 'success');
}

// Runtime slice from daawah.js: downloadDonationReceipt.
function downloadDonationReceipt(index) {
    const donation = donations[index];
    if (!donation) return;
    openOfficialReceipt({
        kind: 'Donation',
        receiptNumber: donation.receiptNumber,
        transactionRef: donation.transactionRef,
        name: donation.donor || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Donor',
        type: donation.type || 'Donation',
        amount: donation.amount,
        method: donation.paymentMethod || 'Not specified',
        status: donation.status,
        date: donation.date || new Date().toLocaleDateString(),
        approvedBy: donation.approvedBy,
        approvedAt: donation.approvedAt
    });
}

// ADMIN FUNCTIONS

// Runtime slice from daawah.js: loadMemberDatabase.
function loadMemberDatabase() {
    if (!frontendOnly) {
        fetch(`supabase-required-endpoint?action=getAllStudents&${authQuery()}`)
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success || !Array.isArray(result.data)) return;
                const databaseMembers = result.data.map(student => ({
                    dbStudentId: student.id,
                    dbUserId: student.user_id,
                    username: student.username || student.student_id,
                    fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                    studentId: student.student_id,
                    email: student.email,
                    phone: student.phone,
                    role: student.role || 'student',
                    school: student.school,
                    course: student.course,
                    yearOfStudy: student.year_of_study,
                    semester: student.semester,
                    status: student.membership_status || (student.user_status === 'active' ? 'Active' : 'Pending'),
                    passport_photo: student.passport_photo
                }));
                const merged = [...allMembers];
                databaseMembers.forEach(member => {
                    const index = merged.findIndex(item =>
                        item.dbStudentId === member.dbStudentId ||
                        item.studentId === member.studentId ||
                        item.username === member.username ||
                        item.email === member.email
                    );
                    if (index >= 0) {
                        merged[index] = { ...merged[index], ...member };
                    } else {
                        merged.push(member);
                    }
                });
                allMembers = merged;
                localStorage.setItem('allMembers', JSON.stringify(allMembers));
                renderMemberDatabase();
            })
            .catch(error => console.error('Member database load error:', error));
    }
    renderMemberDatabase();
}

// Runtime slice from daawah.js: renderMemberDatabase.
function renderMemberDatabase() {
    const tbody = document.getElementById('membersList');
    if (!tbody) return;

    if (allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No registered students yet</td></tr>';
        return;
    }

    tbody.innerHTML = allMembers.map(member => `
        <tr>
            <td><input class="form-check-input student-select-checkbox" type="checkbox" value="${escapeHtml(member.studentId || member.username || '')}"></td>
            <td>${renderMemberPhoto(member)}</td>
            <td>${member.fullName || member.name || member.username || 'N/A'}</td>
            <td>${member.studentId || member.username || 'N/A'}</td>
            <td>${member.email || 'N/A'}</td>
            <td>${member.course || 'N/A'}</td>
            <td><span class="badge ${getMemberStatusBadgeClass(member.status)}">${formatMemberStatus(member.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewMemberDetails('${member.studentId || member.username}')">View</button>
                <button class="btn btn-sm btn-warning" onclick="editMember('${member.studentId || member.username}')">Edit</button>
                <button class="btn btn-sm btn-outline-success" onclick="setMemberStatus('${member.studentId || member.username}', 'Active')">Approve</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="setMemberStatus('${member.studentId || member.username}', 'Inactive')">Deactivate</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMember('${member.studentId || member.username}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: formatMemberStatus.
function formatMemberStatus(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'Active';
    if (value === 'inactive') return 'Inactive';
    return 'Pending';
}

// Runtime slice from daawah.js: getMemberStatusBadgeClass.
function getMemberStatusBadgeClass(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'bg-success';
    if (value === 'inactive') return 'bg-secondary';
    return 'bg-warning text-dark';
}

// Runtime slice from daawah.js: searchMembers.
function searchMembers() {
    const searchTerm = document.getElementById('memberSearchBox').value.toLowerCase();
    const tbody = document.getElementById('membersList');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Runtime slice from daawah.js: viewMemberDetails.
function viewMemberDetails(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    const photo = getMemberPhoto(member);
    const body = document.getElementById('memberDetailsBody');
    if (!body) return;

    body.innerHTML = `
        <div class="row g-4 align-items-start">
            <div class="col-md-4 text-center">
                <div class="mb-3">
                    ${photo ? `<img class="profile-photo__image" src="${photo}" alt="${escapeHtml(member.fullName || member.username || 'Member photo')}">` : '<i class="fas fa-user-circle fa-5x text-muted"></i>'}
                </div>
                <h5>${escapeHtml(member.fullName || member.name || member.username || 'Member')}</h5>
                <p class="text-muted mb-0">${escapeHtml(member.studentId || member.username || 'No student ID')}</p>
            </div>
            <div class="col-md-8">
                <div class="row">
                    ${renderMemberDetailItem('Email', member.email)}
                    ${renderMemberDetailItem('Phone', member.phone)}
                    ${renderMemberDetailItem('Role', member.role || 'student')}
                    ${renderMemberDetailItem('Status', member.status || 'Active')}
                    ${renderMemberDetailItem('School', member.school)}
                    ${renderMemberDetailItem('Course', member.course)}
                    ${renderMemberDetailItem('Year of Study', member.yearOfStudy)}
                    ${renderMemberDetailItem('Semester', member.semester)}
                    ${renderMemberDetailItem('Gender', member.gender)}
                    ${renderMemberDetailItem('Nationality', member.nationality)}
                    ${renderMemberDetailItem('Emergency Contact', member.emergencyContact)}
                    ${renderMemberDetailItem('Local Guardian', member.localGuardian)}
                    ${renderMemberDetailItem('Home Address', member.homeAddress, 'col-md-12')}
                </div>
            </div>
        </div>
    `;
    new bootstrap.Modal(document.getElementById('memberDetailsModal')).show();
}

// Runtime slice from daawah.js: renderMemberDetailItem.
function renderMemberDetailItem(label, value, columnClass = 'col-md-6') {
    return `
        <div class="${columnClass} mb-3">
            <strong>${escapeHtml(label)}:</strong>
            <div>${escapeHtml(value || '-')}</div>
        </div>
    `;
}

// Runtime slice from daawah.js: editMember.
function editMember(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    currentUser = member;
    loadProfileData();
    switchView('profile');
    showNotification('Member loaded in the profile view.', 'info');
}

// Runtime slice from daawah.js: toggleMemberStatus.
function toggleMemberStatus(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    const nextStatus = String(member?.status || 'Pending').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setMemberStatus(studentId, nextStatus);
}

// Runtime slice from daawah.js: setMemberStatus.
function setMemberStatus(studentId, nextStatus, options = {}) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (String(nextStatus || '').toLowerCase() === 'active' && isUniqueRegistrationRole(member.role)) {
        showNotification('Special roles must be approved by the main admin from the admin panel Role Requests.', 'warning');
        return;
    }

    allMembers = allMembers.map(item =>
        item.studentId === studentId || item.username === studentId ? { ...item, status: nextStatus } : item
    );
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    logLocalRoleActivity('updateStudentStatus', { student_id: studentId, status: nextStatus });
    if (currentUser && (currentUser.studentId === studentId || currentUser.username === studentId)) {
        currentUser.status = nextStatus;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    if (!options.silent) loadMemberDatabase();
    syncMemberStatusToDatabase(member, nextStatus);
    if (String(nextStatus || '').toLowerCase() === 'active' && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveMemberVerification?.({ ...member, status: nextStatus }).catch(error => {
            console.error('Member verification sync failed:', error);
        });
    }
    addStudentLocalNotification(member, 'Account status updated', `Your account status is now ${nextStatus}.`, String(nextStatus).toLowerCase() === 'active' ? 'success' : 'warning');
    if (!options.silent) showNotification(`Member ${nextStatus.toLowerCase()}.`, 'success');
}

// Runtime slice from daawah.js: confirmDangerAction.
function confirmDangerAction(message, requiredText = 'CONFIRM') {
    if (!confirm(message)) return false;
    const typed = prompt(`Type ${requiredText} to continue.`);
    return typed === requiredText;
}

// Runtime slice from daawah.js: deleteMember.
function deleteMember(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (!confirmDangerAction(`Delete ${member.fullName || member.username || 'this member'}? This removes the local member record.`, 'DELETE')) {
        return;
    }

    allMembers = allMembers.filter(item => item.studentId !== studentId && item.username !== studentId);
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    if (currentUser && (currentUser.studentId === studentId || currentUser.username === studentId)) {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
    loadMemberDatabase();
    syncMemberDeleteToDatabase(member);
    showNotification('Member deleted.', 'success');
}

// Runtime slice from daawah.js: addStudentLocalNotification.
function addStudentLocalNotification(member, title, message, type = 'info') {
    const notifications = readStoredObject('studentLocalNotifications', []);
    notifications.unshift({
        id: Date.now(),
        studentId: member?.studentId || member?.username || '',
        email: member?.email || '',
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('studentLocalNotifications', JSON.stringify(notifications.slice(0, 200)));
}

// Runtime slice from daawah.js: syncMemberStatusToDatabase.
function syncMemberStatusToDatabase(member, status) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('supabase-required-endpoint?action=updateStudentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({
            student_db_id: member.dbStudentId,
            status: status.toLowerCase()
        }))
    }).catch(error => console.error('Member status sync error:', error));
}

// Runtime slice from daawah.js: syncMemberDeleteToDatabase.
function syncMemberDeleteToDatabase(member) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('supabase-required-endpoint?action=deleteStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({ student_db_id: member.dbStudentId }))
    }).catch(error => console.error('Member delete sync error:', error));
}

// Runtime slice from daawah.js: loadAdminEvents.
function loadAdminEvents() {
    loadEventsFromApi().finally(() => renderAdminEventsTable());
}

// Runtime slice from daawah.js: renderAdminEventsTable.
function renderAdminEventsTable() {
    const tbody = document.getElementById('adminEventsList');
    if (!tbody) return;

    if (allEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No events have been added yet</td></tr>';
        return;
    }

    tbody.innerHTML = allEvents.map(event => {
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || 'Not set';
        const location = event.location || 'Not set';
        const status = event.status || 'Upcoming';
        return `
            <tr>
                <td>${title}</td>
                <td>${date}</td>
                <td>${location}</td>
                <td>${registeredEvents.filter(reg => reg.eventId === String(event.id || event.eventId || title)).length}</td>
                <td><span class="badge bg-info">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewEventDetails('${title}')">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editEvent('${title}')">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Runtime slice from daawah.js: loadAdminWelfare.
function loadAdminWelfare() {
    const tbody = document.getElementById('adminWelfareList');
    if (!tbody) return;

    if (welfareRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No welfare requests have been submitted yet.</td></tr>';
        return;
    }

    tbody.innerHTML = welfareRequests.map(request => `
        <tr>
            <td>
                <strong>${request.submittedByName || request.submittedBy || request.name || currentUser?.name || currentUser?.username || 'Member'}</strong>
                <div class="small text-muted"><i class="fas fa-id-card"></i> ${request.submittedByStudentId || 'No student ID'}</div>
                <div class="small text-muted"><i class="fas fa-envelope"></i> ${request.submittedByEmail || 'No email'}</div>
                <div class="small text-muted"><i class="fas fa-phone"></i> ${request.submittedByPhone || 'No phone'}</div>
            </td>
            <td>${request.type || request.category || 'Support request'}</td>
            <td>${request.amount || 'Not specified'}</td>
            <td>${request.date || request.submittedDate || 'Recently'}</td>
            <td><span class="badge bg-${getWelfareStatusColor(request.status)}"><i class="fas ${getWelfareStatusIcon(request.status)} me-1"></i>${formatWelfareStatus(request.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveWelfare()"><i class="fas fa-circle-check"></i> Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectWelfare()"><i class="fas fa-circle-xmark"></i> Reject</button>
            </td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: loadLeadership.
function loadLeadership() {
    const container = document.getElementById('leadershipRolesList');
    if (!container) return;

    if (leadershipRoles.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No leadership roles have been added yet.</div>';
        return;
    }

    container.innerHTML = leadershipRoles.map(role => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card leadership-card">
                <div class="card-body text-center">
                    <div class="leadership-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <h6>${role.position}</h6>
                    <p class="text-muted">Name: ${role.name}</p>
                    <p class="text-muted">Term: ${role.startDate} - ${role.endDate}</p>
                    <button class="btn btn-sm btn-warning" onclick="editLeadership('${role.position}')">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: showLeadershipModal.
function showLeadershipModal() {
    const modal = new bootstrap.Modal(document.getElementById('leadershipModal'));
    modal.show();
}

// Runtime slice from daawah.js: saveLeadership.
function saveLeadership() {
    const position = document.getElementById('leadershipPosition').value;
    const name = document.getElementById('leadershipName').value;
    const startDate = document.getElementById('leadershipStart').value;
    const endDate = document.getElementById('leadershipEnd').value;

    if (!position || !name || !startDate || !endDate) {
        alert('Please fill in all fields');
        return;
    }

    leadershipRoles.push({
        position: position,
        name: name,
        startDate: startDate,
        endDate: endDate,
        createdDate: new Date().toLocaleDateString()
    });

    localStorage.setItem('leadershipRoles', JSON.stringify(leadershipRoles));
    alert('Leadership role saved successfully!');
    bootstrap.Modal.getInstance(document.getElementById('leadershipModal')).hide();
    loadLeadership();
}

// Runtime slice from daawah.js: editLeadership.
function editLeadership(position) {
    const modal = new bootstrap.Modal(document.getElementById('leadershipModal'));
    modal.show();
}

// CHARTS

// Runtime slice from daawah.js: initializeCharts.
function initializeCharts() {
    // Membership Chart
    const membershipCtx = document.getElementById('membershipChart');
    if (membershipCtx) {
        if (window.membershipReportChart) window.membershipReportChart.destroy();
        const active = allMembers.filter(member => String(member.status || '').toLowerCase() === 'active').length;
        const pending = allMembers.filter(member => String(member.status || '').toLowerCase() === 'pending').length;
        const inactive = Math.max(0, allMembers.length - active - pending);
        window.membershipReportChart = new Chart(membershipCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Pending'],
                datasets: [{
                    data: [active, inactive, pending],
                    backgroundColor: ['#40b050', '#0060b0', '#78d986']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Donation Chart
    const donationCtx = document.getElementById('donationChart');
    if (donationCtx) {
        if (window.donationReportChart) window.donationReportChart.destroy();
        const donationTotals = donations.reduce((totals, donation) => {
            const key = donation.type || donation.donation_type || 'General Donation';
            totals[key] = (totals[key] || 0) + Number(donation.amount || 0);
            return totals;
        }, {});
        const labels = Object.keys(donationTotals);
        const values = labels.map(label => donationTotals[label]);
        window.donationReportChart = new Chart(donationCtx, {
            type: 'pie',
            data: {
                labels: labels.length ? labels : ['No donations yet'],
                datasets: [{
                    data: values.length ? values : [1],
                    backgroundColor: ['#003040', '#0060b0', '#40b050']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

const WORKSPACE_SETTINGS_KEY = 'dawaahWorkspaceSettings';
const DEFAULT_WORKSPACE_SETTINGS = {
    aiChatEnabled: true,
    researchHistory: true,
    researchMode: 'groq_chat',
    browserNotifications: false,
    compactDashboard: false,
    reducedMotion: false
};

// Runtime slice from daawah.js: readWorkspaceSettings.
function readWorkspaceSettings() {
    try {
        return {
            ...DEFAULT_WORKSPACE_SETTINGS,
            ...(JSON.parse(localStorage.getItem(WORKSPACE_SETTINGS_KEY) || '{}') || {})
        };
    } catch (error) {
        return { ...DEFAULT_WORKSPACE_SETTINGS };
    }
}

// Runtime slice from daawah.js: writeWorkspaceSettings.
function writeWorkspaceSettings(settings) {
    localStorage.setItem(WORKSPACE_SETTINGS_KEY, JSON.stringify({
        ...DEFAULT_WORKSPACE_SETTINGS,
        ...(settings || {})
    }));
    window.dispatchEvent(new CustomEvent('dawaah:workspace-settings-changed'));
}

// Runtime slice from daawah.js: applyWorkspaceSettings.
function applyWorkspaceSettings(settings = readWorkspaceSettings()) {
    document.body.classList.toggle('settings-compact-dashboard', Boolean(settings.compactDashboard));
    document.body.classList.toggle('settings-reduced-motion', Boolean(settings.reducedMotion));
    const widget = document.getElementById('aiChatWidget');
    if (widget) widget.classList.toggle('ai-chat-widget--preference-hidden', !settings.aiChatEnabled);
}

// Runtime slice from daawah.js: loadWorkspaceSettings.
function loadWorkspaceSettings() {
    const settings = readWorkspaceSettings();
    const controls = {
        settingAiChatEnabled: 'aiChatEnabled',
        settingResearchHistory: 'researchHistory',
        settingBrowserNotifications: 'browserNotifications',
        settingCompactDashboard: 'compactDashboard',
        settingReducedMotion: 'reducedMotion'
    };
    Object.entries(controls).forEach(([id, key]) => {
        const input = document.getElementById(id);
        if (input) input.checked = Boolean(settings[key]);
    });
    const mode = document.getElementById('settingResearchMode');
    if (mode) mode.value = settings.researchMode || DEFAULT_WORKSPACE_SETTINGS.researchMode;
    applyWorkspaceSettings(settings);
}

// Runtime slice from daawah.js: collectWorkspaceSettingsFromForm.
function collectWorkspaceSettingsFromForm() {
    return {
        aiChatEnabled: Boolean(document.getElementById('settingAiChatEnabled')?.checked),
        researchHistory: Boolean(document.getElementById('settingResearchHistory')?.checked),
        browserNotifications: Boolean(document.getElementById('settingBrowserNotifications')?.checked),
        compactDashboard: Boolean(document.getElementById('settingCompactDashboard')?.checked),
        reducedMotion: Boolean(document.getElementById('settingReducedMotion')?.checked),
        researchMode: document.getElementById('settingResearchMode')?.value || DEFAULT_WORKSPACE_SETTINGS.researchMode
    };
}

// Runtime slice from daawah.js: saveWorkspaceSettings.
function saveWorkspaceSettings() {
    const settings = collectWorkspaceSettingsFromForm();
    writeWorkspaceSettings(settings);
    applyWorkspaceSettings(settings);
    if (settings.browserNotifications) enableBrowserNotifications();
    showNotification('Settings saved successfully.', 'success');
}

// Runtime slice from daawah.js: resetWorkspaceSettings.
function resetWorkspaceSettings() {
    writeWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS);
    loadWorkspaceSettings();
    showNotification('Settings reset to defaults.', 'info');
}

window.addEventListener('DOMContentLoaded', () => applyWorkspaceSettings());
window.addEventListener('storage', event => {
    if (event.key === WORKSPACE_SETTINGS_KEY) applyWorkspaceSettings();
});

window.loadWorkspaceSettings = loadWorkspaceSettings;
window.saveWorkspaceSettings = saveWorkspaceSettings;
window.resetWorkspaceSettings = resetWorkspaceSettings;
window.readWorkspaceSettings = readWorkspaceSettings;

// UTILITY FUNCTIONS

// Runtime slice from daawah.js: logout.
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        stopRoleDashboardLiveRefresh();
        window.SupabaseBackend?.logout?.();
        if (!frontendOnly) {
            fetch('supabase-required-endpoint?action=logoutUser', {
                method: 'POST',
                credentials: 'same-origin'
            }).catch(() => {});
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');

        currentUser = null;
        currentRole = null;

        document.getElementById('dashboardPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');

        document.getElementById('loginForm').reset();
        document.getElementById('registrationForm').reset();
    }
}

// Validation

// Runtime slice from daawah.js: validateEmail.
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Runtime slice from daawah.js: validatePhoneNumber.
function validatePhoneNumber(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// LocalStorage Helpers

// Runtime slice from daawah.js: saveToLocalStorage.
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Runtime slice from daawah.js: getFromLocalStorage.
function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return safeJsonParse(data, null, key);
}

// Runtime slice from daawah.js: clearLocalStorage.
function clearLocalStorage(key) {
    localStorage.removeItem(key);
}

// Notifications

// Runtime slice from daawah.js: showNotification.
function showNotification(message, type = 'info') {
    const notificationIcons = {
        info: 'fa-bell',
        warning: 'fa-triangle-exclamation',
        success: 'fa-circle-check',
        danger: 'fa-triangle-exclamation',
        report: 'fa-chart-line',
        users: 'fa-users',
        admins: 'fa-user-shield'
    };
    const bootstrapType = ['info', 'warning', 'success', 'danger'].includes(type) ? type : 'info';
    const icon = notificationIcons[type] || notificationIcons.info;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${bootstrapType} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas ${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Role-Based Access Control

// Runtime slice from daawah.js: hasPermission.
function hasPermission(permission) {
    const memberPermissions = [
        'view_profile',
        'view_membership',
        'register_events',
        'view_prayer_times',
        'view_announcements',
        'view_resources',
        'welfare_request',
        'view_payments',
        'view_donations',
        'register_volunteer'
    ];

    const adminPermissions = [
        ...memberPermissions,
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

    const rolePermissions = {
        'student': memberPermissions,
        'executive': adminPermissions,
        'chairlady': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'vice_chairlady_1': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'vice_chairlady_2': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'secretary': [
            ...memberPermissions,
            'manage_members',
            'view_reports',
            'generate_reports',
            'create_announcements'
        ],
        'vice_secretary': [
            ...memberPermissions,
            'manage_members',
            'view_reports',
            'generate_reports',
            'create_announcements'
        ],
        'admin': adminPermissions,
        'treasurer': [
            ...memberPermissions,
            'manage_payments',
            'view_reports',
            'generate_reports'
        ],
        'vice_treasurer': [
            ...memberPermissions,
            'manage_payments',
            'view_reports',
            'generate_reports'
        ],
        'media': [
            ...memberPermissions,
            'manage_gallery',
            'manage_contact'
        ],
        'organizer': [
            ...memberPermissions,
            'manage_events',
            'manage_activities',
            'register_volunteer'
        ],
        'amir_director': [
            'view_profile',
            'view_prayer_times',
            'view_announcements',
            'view_resources',
            'manage_prayer_times',
            'manage_lectures',
            'manage_hadiths'
        ]
    };

    const overrides = readStoredObject('rolePermissionOverrides', []);
    const override = Array.isArray(overrides) ? overrides.find(item => item.role === currentRole) : null;
    if (override && Array.isArray(override.permissions)) {
        return override.permissions.includes(permission);
    }
    return rolePermissions[currentRole]?.includes(permission) || false;
}

// Export & Download

// Runtime slice from daawah.js: downloadReport.
function downloadReport(reportName) {
    const data = getReportData(reportName);
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}.csv`;
    a.click();
}

// Runtime slice from daawah.js: convertToCSV.
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${headers}\n${rows}`;
}

// Runtime slice from daawah.js: getReportData.
function getReportData(reportName) {
    switch(reportName) {
        case 'members':
            return allMembers;
        case 'donations':
            return donations;
        case 'payments':
            return payments;
        case 'welfare':
            return welfareRequests;
        case 'events':
            return allEvents;
        default:
            return [];
    }
}

// Search & Filter

// Runtime slice from daawah.js: searchItems.
function searchItems(items, query, searchFields) {
    return items.filter(item =>
        searchFields.some(field =>
            String(item[field]).toLowerCase().includes(query.toLowerCase())
        )
    );
}

// Runtime slice from daawah.js: filterByDate.
function filterByDate(items, startDate, endDate) {
    return items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

// Form Helpers

// Runtime slice from daawah.js: resetForm.
function resetForm(formId) {
    document.getElementById(formId).reset();
}

// Runtime slice from daawah.js: getFormData.
function getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    return data;
}

// Modal Helpers

// Runtime slice from daawah.js: openModal.
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

// Runtime slice from daawah.js: closeModal.
function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal?.hide();
}

// Error Handling

// Runtime slice from daawah.js: handleError.
function handleError(error) {
    console.error('Error:', error);
}

window.addEventListener('error', (event) => {
    handleError(event.error);
});

// Responsive Utilities

// Runtime slice from daawah.js: isMobileView.
function isMobileView() {
    return window.innerWidth < 768;
}

// Runtime slice from daawah.js: isTabletView.
function isTabletView() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
}

// Runtime slice from daawah.js: isDesktopView.
function isDesktopView() {
    return window.innerWidth >= 1024;
}

// Accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            bootstrap.Modal.getInstance(modal)?.hide();
        });
    }
});

// Performance Optimization

// Runtime slice from daawah.js: debounce.
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Runtime slice from daawah.js: throttle.
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// DASHBOARD DATA LOADING

// Runtime slice from daawah.js: loadDashboardData.
function loadDashboardData() {
    if (!currentUser) return;

    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dashboardDateEl = document.getElementById('dashboardDate');
    if (dashboardDateEl) dashboardDateEl.textContent = dateStr;
    const roleMessage = document.querySelector('#dashboardView .welcome-subtext');
    if (roleMessage) {
        roleMessage.textContent = getRoleDashboardMessage();
    }

    // Profile Summary
    setTextById('dashName', currentUser.name || currentUser.fullName || currentUser.username);
    setTextById('dashStudentId', currentUser.studentId || currentUser.id || 'Not set');
    setTextById('dashCourse', currentUser.course || 'Not set');
    setTextById('dashYear', currentUser.year || currentUser.yearOfStudy || 'Not set');

    // Membership Status
    setTextById('membershipStatusValue', getMembershipDisplayState().status);

    // Upcoming Events Count
    const upcomingCount = getAvailableEvents().length;
    setTextById('upcomingEventsCount', upcomingCount);

    // Dues Status
    const duesPaid = getCompletedMembershipDuesPayment() ? 'Paid' : 'No payment';
    setTextById('duesStatusValue', duesPaid);

    // Welfare Status
    const welfareCount = welfareRequests.filter(w => w.status === 'Pending' || w.status === 'Pending Review').length;
    setTextById('welfareStatusValue', welfareCount || '0');
    loadDashboardPrayerTimes();
    renderRoleWorkspace();
    renderProfileCompletion();
    renderDashboardAlerts();
    loadStudentNotifications();
    renderDashboardActivityCalendar();
    configureDashboardReports();
    loadActivitiesFromApi().then(renderDashboardActivityCalendar);

    // Load Announcements
    const announcementsList = document.getElementById('announcementsList');
    if (announcementsList) {
        const announcements = readList('adminAnnouncements').map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently'
        }));

        if (announcements.length === 0) {
            announcementsList.innerHTML = renderEmptyState('fa-bullhorn', 'No announcements yet', 'Secretary announcements will appear here.');
        } else {
            announcementsList.innerHTML = announcements.map(ann => `
                <div class="announcement-item">
                    <small class="text-muted"><i class="fas fa-clock"></i> ${ann.time}</small>
                    <p class="mb-1"><strong>${ann.title}</strong></p>
                    <p class="text-muted small">${ann.text}</p>
                </div>
            `).join('<hr>');
        }
    }

    // Load Meetings
    const meetingsList = document.getElementById('meetingsList');
    if (meetingsList) {
        meetingsList.innerHTML = renderEmptyState('fa-clipboard-list', 'No meetings yet', 'Meeting records can be added later.');
    }
}

// Runtime slice from daawah.js: configureDashboardReports.
function configureDashboardReports() {
    const buttons = document.querySelectorAll('.dashboard-report-btn');
    buttons.forEach(button => {
        const permission = button.dataset.permission;
        button.classList.toggle('d-none', Boolean(permission) && !hasPermission(permission));
    });
    const container = document.getElementById('dashboardReportButtons');
    if (container && !container.querySelector('.dashboard-report-btn:not(.d-none)')) {
        container.innerHTML = '<p class="text-muted mb-0">No printable reports are assigned to this role.</p>';
    }
}

// Runtime slice from daawah.js: renderRoleWorkspace.
function renderRoleWorkspace() {
    const role = currentRole || currentUser?.role || 'student';
    const roleBadge = document.getElementById('dashboardRoleBadge');
    const summary = document.getElementById('dashboardRoleSummary');
    const actions = document.getElementById('roleQuickActions');
    const responsibilities = document.getElementById('roleResponsibilities');
    if (!actions) return;

    const actionMap = {
        organizer: [['Activities', 'activities', 'fa-calendar-days', 'Plan daily, weekly, monthly'], ['Events', 'events', 'fa-calendar', 'Coordinate programmes'], ['Volunteer', 'volunteer', 'fa-hands-helping', 'Manage service teams']],
        treasurer: [['Dues', 'dues', 'fa-money-bill', 'Track member dues'], ['Donations', 'donations', 'fa-hand-holding-dollar', 'Confirm contributions'], ['Reports', 'reports', 'fa-chart-line', 'Review finance trends']],
        vice_treasurer: [['Dues', 'dues', 'fa-money-bill', 'Track member dues'], ['Donations', 'donations', 'fa-hand-holding-dollar', 'Confirm contributions'], ['Reports', 'reports', 'fa-chart-line', 'Review finance trends']],
        media: [['Gallery & Videos', 'adminGallery', 'fa-photo-film', 'Publish media'], ['Contact & Social', 'adminContact', 'fa-share-nodes', 'Update public links']],
        secretary: [['Students', 'memberDatabase', 'fa-user-graduate', 'Student records'], ['Announcements', 'announcements', 'fa-bullhorn', 'Post updates'], ['Reports', 'reports', 'fa-chart-pie', 'Meeting summaries']],
        vice_secretary: [['Students', 'memberDatabase', 'fa-user-graduate', 'Student records'], ['Announcements', 'announcements', 'fa-bullhorn', 'Post updates'], ['Reports', 'reports', 'fa-chart-pie', 'Meeting summaries']],
        amir_director: [['Prayer Times', 'prayer', 'fa-mosque', 'Prayer schedule'], ['Hadiths', 'officerHadiths', 'fa-book-open', 'Daily reminders'], ['Resources', 'resources', 'fa-book-open-reader', 'Learning materials']],
        chairlady: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        vice_chairlady_1: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        vice_chairlady_2: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        executive: [['Students', 'memberDatabase', 'fa-user-graduate', 'Manage students'], ['Events', 'adminEvents', 'fa-calendar-check', 'Approve programmes'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
        admin: [['Students', 'memberDatabase', 'fa-user-graduate', 'Manage students'], ['Leadership', 'leadership', 'fa-user-tie', 'Public officers'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
        student: [['Profile', 'profile', 'fa-id-card', 'Your record'], ['Events', 'events', 'fa-calendar', 'Join programmes'], ['Volunteer', 'volunteer', 'fa-hands-helping', 'Serve the Jamaat'], ['Dues', 'dues', 'fa-money-bill', 'Payment status']]
    };
    const items = actionMap[role] || actionMap.student;
    if (roleBadge) roleBadge.textContent = formatRoleName(role);
    if (summary) summary.textContent = getRoleDashboardMessage();
    actions.innerHTML = items.map(([label, view, icon, helper]) => `
        <button type="button" class="btn btn-outline-primary btn-sm role-action-card" onclick="switchView('${view}')">
            <i class="fas ${icon}"></i>
            <span>
                <strong>${escapeHtml(label)}</strong>
                <small>${escapeHtml(helper || '')}</small>
            </span>
        </button>
    `).join('');
    if (responsibilities) {
        responsibilities.innerHTML = renderRoleResponsibilities(role);
    }
}

// Runtime slice from daawah.js: renderRoleResponsibilities.
function renderRoleResponsibilities(role) {
    const guide = {
        organizer: [
            ['fa-calendar-plus', 'Activities', 'Add daily, weekly, and monthly programmes students should attend.'],
            ['fa-people-group', 'Volunteer Work', 'Create service opportunities and follow up registered volunteers.']
        ],
        treasurer: [
            ['fa-money-check-dollar', 'Payments', 'Confirm dues only after checking proof or transaction reference.'],
            ['fa-hand-holding-dollar', 'Donations', 'Review donation records and keep finance reports accurate.']
        ],
        vice_treasurer: [
            ['fa-money-check-dollar', 'Payments', 'Assist the Treasurer with dues confirmation and receipt tracking.'],
            ['fa-file-invoice', 'Reports', 'Review payment and donation summaries before meetings.']
        ],
        media: [
            ['fa-photo-film', 'Gallery', 'Upload real photos, videos, and public media from events.'],
            ['fa-share-nodes', 'Contact Links', 'Keep WhatsApp, YouTube, and social links updated for public visitors.']
        ],
        secretary: [
            ['fa-user-graduate', 'Student Records', 'Keep student records organized and ready for reports.'],
            ['fa-bullhorn', 'Announcements', 'Post official updates that students will see in their dashboard.']
        ],
        vice_secretary: [
            ['fa-user-graduate', 'Student Records', 'Support the Secretary with student records and attendance notes.'],
            ['fa-bullhorn', 'Announcements', 'Prepare and publish approved announcements for students.']
        ],
        chairlady: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Review support requests and update their status clearly.'],
            ['fa-clipboard-check', 'Follow Up', 'Track pending welfare matters until they are approved, rejected, or completed.']
        ],
        vice_chairlady_1: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Assist with student support requests and case follow-up.'],
            ['fa-clipboard-check', 'Follow Up', 'Keep welfare actions clear for leadership review.']
        ],
        vice_chairlady_2: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Assist with student support requests and case follow-up.'],
            ['fa-clipboard-check', 'Follow Up', 'Keep welfare actions clear for leadership review.']
        ],
        amir_director: [
            ['fa-mosque', 'Prayer Times', 'Maintain prayer schedules, Jumuah reminders, and lecture information.'],
            ['fa-book-quran', 'Hadith & Resources', 'Add authentic reminders and learning resources for students.']
        ],
        executive: [
            ['fa-users-gear', 'Operations', 'Coordinate members, events, reports, and officer activity.'],
            ['fa-chart-pie', 'Oversight', 'Review system reports before public decisions are made.']
        ],
        admin: [
            ['fa-user-shield', 'System Control', 'Approve roles, manage records, and keep public content accurate.'],
            ['fa-chart-line', 'Reports', 'Use real reports for leadership decisions.']
        ],
        student: [
            ['fa-id-card', 'Profile', 'Keep your student record complete and current.'],
            ['fa-calendar-check', 'Participation', 'Register for events, welfare, volunteer work, payments, and donations.']
        ]
    };
    const items = guide[role] || guide.student;
    return items.map(([icon, title, text]) => `
        <div class="role-responsibility-item">
            <i class="fas ${icon}"></i>
            <span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></span>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: getSelectedStudentIds.
function getSelectedStudentIds() {
    return Array.from(document.querySelectorAll('.student-select-checkbox:checked')).map(input => input.value).filter(Boolean);
}

// Runtime slice from daawah.js: toggleAllStudentSelection.
function toggleAllStudentSelection() {
    const boxes = Array.from(document.querySelectorAll('.student-select-checkbox'));
    const shouldCheck = boxes.some(box => !box.checked);
    boxes.forEach(box => { box.checked = shouldCheck; });
}

// Runtime slice from daawah.js: exportSelectedStudents.
function exportSelectedStudents(ids) {
    const selected = allMembers.filter(member => ids.includes(member.studentId || member.username));
    if (!selected.length) {
        showNotification('No selected students to export.', 'warning');
        return;
    }
    const csv = convertToCSV(selected.map(member => ({
        fullName: member.fullName || member.name || '',
        studentId: member.studentId || member.username || '',
        email: member.email || '',
        phone: member.phone || '',
        course: member.course || '',
        status: member.status || '',
        membershipStatus: member.membershipStatus || '',
        paymentStatus: member.membershipCardPaymentStatus || member.paymentStatus || 'No payment'
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Runtime slice from daawah.js: applyStudentBulkAction.
function applyStudentBulkAction() {
    const action = document.getElementById('studentBulkAction')?.value || '';
    const ids = getSelectedStudentIds();
    if (!action) {
        showNotification('Choose a bulk action first.', 'warning');
        return;
    }
    if (!ids.length) {
        showNotification('Select at least one student first.', 'warning');
        return;
    }
    if (action === 'export') {
        exportSelectedStudents(ids);
        return;
    }
    if (!confirmDangerAction(`Apply ${action} to ${ids.length} selected student(s)?`, 'CONFIRM')) return;
    ids.forEach(id => setMemberStatus(id, action, { silent: true }));
    loadMemberDatabase();
    showNotification(`Bulk action applied to ${ids.length} student(s).`, 'success');
}

// Runtime slice from daawah.js: parseCsvLine.
function parseCsvLine(line) {
    const values = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === '"' && line[index + 1] === '"') {
            current += '"';
            index += 1;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === ',' && !quoted) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

// Runtime slice from daawah.js: importStudentsCsv.
function importStudentsCsv(input) {
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
        const text = String(event.target?.result || '');
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
            showNotification('CSV must include a header row and at least one student.', 'warning');
            return;
        }
        const headers = parseCsvLine(lines[0]).map(header => header.trim());
        const imported = lines.slice(1).map(line => {
            const values = parseCsvLine(line);
            const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
            const studentId = normalizeStudentId(row.studentId || row.student_id || row.username);
            return {
                username: studentId,
                studentId,
                fullName: row.fullName || row.name || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`.trim(),
                email: String(row.email || '').trim().toLowerCase(),
                phone: row.phone || '',
                course: row.course || '',
                school: row.school || '',
                yearOfStudy: row.yearOfStudy || row.year_of_study || '',
                semester: row.semester || '',
                role: row.role || 'student',
                status: row.status || 'Active',
                membershipStatus: row.membershipStatus || 'Membership Pending',
                membershipPaymentStatus: row.membershipPaymentStatus || 'No payment',
                registrationSource: 'admin-csv-import',
                importedAt: new Date().toISOString()
            };
        }).filter(member => member.studentId && member.fullName);
        if (!imported.length) {
            showNotification('No valid student rows found. Include studentId and fullName/name columns.', 'warning');
            return;
        }
        if (!confirmDangerAction(`Import ${imported.length} student record(s)? Existing matching records will be updated.`, 'CONFIRM')) return;
        imported.forEach(member => {
            const index = allMembers.findIndex(item =>
                normalizeStudentId(item.studentId || item.username) === member.studentId
                || (member.email && String(item.email || '').toLowerCase() === member.email)
            );
            if (index >= 0) {
                allMembers[index] = { ...allMembers[index], ...member };
            } else {
                allMembers.push(member);
            }
            saveSharedMemberStore(member);
        });
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
        loadMemberDatabase();
        showNotification(`Imported ${imported.length} student record(s).`, 'success');
        input.value = '';
    };
    reader.readAsText(file);
}

// Runtime slice from daawah.js: formatRoleName.
function formatRoleName(role) {
    const labels = {
        executive: 'Sub Admin / Executive',
        chairlady: 'Chairlady',
        vice_chairlady_1: 'Vice Chairlady 1',
        vice_chairlady_2: 'Vice Chairlady 2',
        secretary: 'Secretary',
        vice_secretary: 'Vice Secretary',
        organizer: 'Organizer',
        media: 'Media',
        treasurer: 'Treasurer',
        vice_treasurer: 'Vice Treasurer',
        amir_director: 'Amir Dawah / Director of Dawah',
        admin: 'Main Admin',
        student: 'Student'
    };
    return labels[role] || 'Member';
}

// Runtime slice from daawah.js: renderProfileCompletion.
function renderProfileCompletion() {
    const fields = ['fullName', 'studentId', 'email', 'phone', 'school', 'course', 'yearOfStudy', 'semester', 'emergencyContact', 'localGuardian'];
    const completed = fields.filter(field => currentUser?.[field]).length;
    const percent = Math.round((completed / fields.length) * 100);
    const value = document.getElementById('profileCompletionValue');
    const text = document.getElementById('profileCompletionText');
    const ring = document.querySelector('.profile-meter__ring');
    if (value) value.textContent = `${percent}%`;
    if (text) text.textContent = percent >= 90 ? 'Your member record looks complete.' : 'Add missing details for a complete record.';
    if (ring) ring.style.background = `conic-gradient(var(--primary-color) ${percent * 3.6}deg, rgba(15, 81, 50, 0.12) 0deg)`;
}

// Runtime slice from daawah.js: renderDashboardAlerts.
function renderDashboardAlerts() {
    const alerts = [];
    const role = currentRole || currentUser?.role || 'student';
    const pendingPayments = payments.filter(item => item.status !== 'Completed').length;
    const pendingWelfare = welfareRequests.filter(item => ['Pending', 'Pending Review', 'pending'].includes(item.status)).length;
    const volunteerSignups = databaseVolunteerRecords.filter(item => item.status === 'registered').length;
    if ((currentUser?.status || 'Active').toLowerCase() === 'pending') alerts.push(['fa-user-clock', 'Your role request is waiting for main admin approval.']);
    if (hasPermission('manage_payments') && pendingPayments) alerts.push(['fa-money-check', `${pendingPayments} payment/donation item(s) need confirmation.`]);
    if (hasPermission('manage_welfare') && pendingWelfare) alerts.push(['fa-hand-holding-heart', `${pendingWelfare} welfare request(s) need review.`]);
    if (hasPermission('manage_events') && volunteerSignups) alerts.push(['fa-hands-helping', `${volunteerSignups} volunteer signup(s) need follow-up.`]);
    const cardExpiry = currentUser?.membershipCardExpiresAt ? new Date(currentUser.membershipCardExpiresAt) : null;
    if (cardExpiry && !Number.isNaN(cardExpiry.getTime())) {
        const daysLeft = Math.ceil((cardExpiry.getTime() - Date.now()) / 86400000);
        if (daysLeft <= 0) {
            alerts.push(['fa-id-card', 'Your membership card has expired. Please renew your dues/card.']);
        } else if ([60, 30, 7].some(days => daysLeft <= days)) {
            alerts.push(['fa-id-card', `Your membership card expires in ${daysLeft} day(s).`]);
        }
    }
    if (hasPermission('manage_members')) {
        const expiring = allMembers.filter(member => {
            const expiry = member.membershipCardExpiresAt ? new Date(member.membershipCardExpiresAt) : null;
            if (!expiry || Number.isNaN(expiry.getTime())) return false;
            const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
            return daysLeft <= 60;
        }).length;
        if (expiring) alerts.push(['fa-id-card', `${expiring} membership card(s) expire within 60 days or already expired.`]);
    }
    if (role === 'organizer') alerts.push(['fa-calendar-days', `${getActivities().length} activities are available to review.`]);
    if (!alerts.length) alerts.push(['fa-circle-check', 'No urgent items right now.']);

    const count = document.getElementById('dashboardAlertCount');
    const list = document.getElementById('dashboardAlertsList');
    if (count) count.textContent = String(Math.max(0, alerts.length - (alerts[0][0] === 'fa-circle-check' ? 1 : 0)));
    if (list) {
        list.innerHTML = `<div class="dashboard-alert-list">${alerts.map(([icon, message]) => `
            <div class="dashboard-alert-item"><i class="fas ${icon}"></i><span>${escapeHtml(message)}</span></div>
        `).join('')}</div>`;
    }
}

// Runtime slice from daawah.js: loadStudentNotifications.
function loadStudentNotifications() {
    const localNotifications = readStoredObject('studentLocalNotifications', [])
        .filter(item =>
            !currentUser
            || item.studentId === currentUser.studentId
            || item.studentId === currentUser.username
            || item.email === currentUser.email
        );
    if (frontendOnly || !currentUser) {
        renderStudentNotifications(localNotifications);
        return;
    }
    fetch('supabase-required-endpoint?action=getNotifications', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            renderStudentNotifications([...localNotifications, ...result.data]);
        })
        .catch(() => renderStudentNotifications(localNotifications));
}

// Runtime slice from daawah.js: renderStudentNotifications.
function renderStudentNotifications(notifications) {
    const list = document.getElementById('dashboardAlertsList');
    const count = document.getElementById('dashboardAlertCount');
    if (!list) return;
    const unread = notifications.filter(item => Number(item.is_read || item.read ? 1 : 0) === 0);
    if (count) count.textContent = String(unread.length);
    if (!notifications.length) return;
    list.innerHTML = `<div class="dashboard-alert-list">${notifications.slice(0, 5).map(item => `
        <button type="button" class="dashboard-alert-item text-start w-100 border-0 bg-transparent" onclick="markStudentNotificationRead(${Number(item.id)})">
            <i class="fas ${Number(item.is_read || item.read ? 1 : 0) === 0 ? 'fa-bell' : 'fa-circle-check'}"></i>
            <span><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.message)}</small></span>
        </button>
    `).join('')}</div>`;
}

// Runtime slice from daawah.js: markStudentNotificationRead.
function markStudentNotificationRead(notificationId) {
    fetch('supabase-required-endpoint?action=markNotificationRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ notification_id: notificationId })
    }).then(() => loadStudentNotifications()).catch(() => {});
}

// Runtime slice from daawah.js: registerInstallableApp.
function registerInstallableApp() {
    ensureAppManifestLink();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                registration.update().catch(() => {});
                if (!navigator.serviceWorker.controller && !sessionStorage.getItem('dawaahSwFirstControlReload')) {
                    sessionStorage.setItem('dawaahSwFirstControlReload', '1');
                    setTimeout(() => window.location.reload(), 1200);
                }
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(() => {});
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            const reloadKey = `serviceWorkerReloaded:${APP_VERSION}`;
            if (sessionStorage.getItem(reloadKey)) return;
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
        });
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type !== 'APP_UPDATED') return;
            const reloadKey = `serviceWorkerMessageReloaded:${APP_VERSION}`;
            if (sessionStorage.getItem(reloadKey)) return;
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
        });
    }
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        window.__dawaahDeferredInstallPrompt = event;
        showInstallAppButton();
        updateInstallAppBanner();
        updateInstallButtonLabels('Install App');
        if (pendingInstallClick) {
            pendingInstallClick = false;
            setTimeout(installDawaahApp, 100);
        }
    });
    window.addEventListener('appinstalled', () => {
        localStorage.setItem('dawaahAppInstalled', '1');
        hideInstallAppBanner();
    });
    wireInstallAppBanner();
}

// Runtime slice from daawah.js: ensureAppManifestLink.
function ensureAppManifestLink() {
    if (typeof window.__dawaahEnsureManifest === 'function') {
        window.__dawaahEnsureManifest();
    }
}

// Runtime slice from daawah.js: checkForAppUpdate.
function checkForAppUpdate(forceReload = false) {
    if (location.protocol === 'file:') return Promise.resolve(false);
    return fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' })
        .then(response => parseJsonResponse(response))
        .then(versionInfo => {
            const latestVersion = String(versionInfo.version || APP_VERSION);
            const storedVersion = localStorage.getItem('ummaAppVersion');
            localStorage.setItem('ummaAppVersion', latestVersion);

            if (!storedVersion || storedVersion === latestVersion) {
                return false;
            }

            showAppUpdateNotice(versionInfo);
            return refreshInstalledAppShell(latestVersion, forceReload);
        })
        .catch(() => false);
}

// Runtime slice from daawah.js: showAppUpdateNotice.
function showAppUpdateNotice(versionInfo = {}) {
    const existing = document.getElementById('appUpdateNotice');
    if (existing) existing.remove();
    const notice = document.createElement('div');
    notice.id = 'appUpdateNotice';
    notice.className = 'alert alert-info shadow-sm';
    notice.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1080;max-width:360px;';
    notice.innerHTML = `
        <div class="d-flex gap-2 align-items-start">
            <i class="fas fa-arrows-rotate mt-1"></i>
            <div>
                <strong>App update available</strong>
                <div class="small">${escapeHtml(versionInfo.message || 'Loading the latest version now.')}</div>
            </div>
        </div>
    `;
    document.body.appendChild(notice);
}

// Runtime slice from daawah.js: refreshInstalledAppShell.
function refreshInstalledAppShell(latestVersion, forceReload = false) {
    const reloadKey = `appVersionReloaded:${latestVersion}`;
    if (sessionStorage.getItem(reloadKey)) return Promise.resolve(false);
    sessionStorage.setItem(reloadKey, '1');

    if (typeof showNotification === 'function') {
        showNotification('App updated. Loading latest version...', 'info');
    }

    const clearCaches = 'caches' in window
        ? caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dawaah-shell-')).map(key => caches.delete(key))))
        : Promise.resolve();

    const updateWorker = 'serviceWorker' in navigator
        ? navigator.serviceWorker.getRegistrations()
            .then(registrations => Promise.all(registrations.map(registration => registration.update().catch(() => {}))))
        : Promise.resolve();

    return Promise.all([clearCaches, updateWorker]).then(() => {
        setTimeout(() => window.location.reload(), forceReload ? 300 : 900);
        return true;
    });
}

// Runtime slice from daawah.js: showInstallAppButton.
function showInstallAppButton() {
    const dashboardPage = document.getElementById('dashboardPage');
    if (!currentUser || !dashboardPage?.classList.contains('active')) return;
    if (localStorage.getItem('dawaahAppInstalled') === '1' || isStandaloneApp()) {
        hideInstallAppBanner();
        return;
    }
    if (document.getElementById('installAppButton')) return;
    const host = document.getElementById('dashboardInstallActions');
    if (!host) return;
    const button = document.createElement('button');
    button.id = 'installAppButton';
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-primary install-app-button';
    button.innerHTML = '<i class="fas fa-mobile-screen-button"></i> Install App';
    button.onclick = installDawaahApp;
    host.appendChild(button);
}

// Runtime slice from daawah.js: isIosDevice.
function isIosDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

// Runtime slice from daawah.js: isStandaloneApp.
function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Runtime slice from daawah.js: hideInstallAppBanner.
function hideInstallAppBanner() {
    document.querySelectorAll('.app-install-trigger, #installAppButton').forEach(button => {
        button.classList.add('d-none');
    });
}

// Runtime slice from daawah.js: updateInstallAppBanner.
function updateInstallAppBanner() {
    const dismissed = localStorage.getItem('dawaahInstallBannerDismissed') === '1';
    const installed = localStorage.getItem('dawaahAppInstalled') === '1' || isStandaloneApp();
    document.querySelectorAll('.app-install-trigger, #installAppButton').forEach(button => {
        button.classList.toggle('d-none', dismissed || installed);
    });
}

// Runtime slice from daawah.js: wireInstallAppBanner.
function wireInstallAppBanner() {
    document.getElementById('installAppTopButton')?.addEventListener('click', installDawaahApp);
    updateInstallAppBanner();
    updateInstallButtonLabels('Install App');
}

// Runtime slice from daawah.js: updateInstallButtonLabels.
function updateInstallButtonLabels(label) {
    document.querySelectorAll('#installAppTopButton, #installAppButton').forEach(button => {
        button.innerHTML = `<i class=\"fas fa-${label === 'Install App' ? 'download' : 'mobile-screen-button'}\" aria-hidden=\"true\"></i> ${label}`;
    });
}

// Runtime slice from daawah.js: installDawaahApp.
function installDawaahApp() {
    if (!deferredInstallPrompt) {
        pendingInstallClick = true;
        window.__dawaahPendingInstallClick = true;
        updateInstallButtonLabels('Preparing...');
        if (typeof showNotification === 'function') {
            showNotification('Preparing app install. If nothing opens, refresh once and tap Install again.', 'info');
        }
        setTimeout(() => {
            if (!deferredInstallPrompt) {
                pendingInstallClick = false;
                window.__dawaahPendingInstallClick = false;
                updateInstallButtonLabels('Install App');
            }
        }, 3500);
        return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
        deferredInstallPrompt = null;
        window.__dawaahDeferredInstallPrompt = null;
        document.getElementById('installAppButton')?.remove();
        pendingInstallClick = false;
        window.__dawaahPendingInstallClick = false;
        updateInstallButtonLabels('Install App');
    });
}

// Runtime slice from daawah.js: renderDashboardActivityCalendar.
function renderDashboardActivityCalendar() {
    const container = document.getElementById('dashboardActivityCalendar');
    if (!container) return;
    const activities = getActivities();
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return date;
    });
    container.innerHTML = days.map(day => {
        const key = day.toISOString().slice(0, 10);
        const dayActivities = activities.filter(activity => activity.date === key).slice(0, 3);
        return `
            <div class="activity-calendar__day">
                <div class="activity-calendar__date">${day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
                ${dayActivities.length ? dayActivities.map(activity => `<span class="activity-calendar__event">${escapeHtml(activity.title)}</span>`).join('') : '<span class="text-muted small">No activity</span>'}
            </div>
        `;
    }).join('');
}

// Runtime slice from daawah.js: getRoleDashboardMessage.
function getRoleDashboardMessage() {
    const role = currentRole || currentUser?.role || 'student';
    const messages = {
        chairlady: 'Chairlady workspace for welfare requests, member support, and oversight reports.',
        vice_chairlady_1: 'Vice Chairlady 1 workspace with the same welfare and oversight tools as Chairlady.',
        vice_chairlady_2: 'Vice Chairlady 2 workspace with the same welfare and oversight tools as Chairlady.',
        secretary: 'Secretary workspace for member records, announcements, and general reports.',
        vice_secretary: 'Vice Secretary workspace with the same member, announcement, and report tools as Secretary.',
        executive: 'Executive workspace for member management, programmes, welfare, reports, and communication.',
        admin: 'Admin workspace for full system management, reports, content, and member records.',
        treasurer: 'Treasurer workspace for dues, donations, payment confirmation, and financial reports.',
        vice_treasurer: 'Vice Treasurer workspace with the same dues, donations, payment confirmation, and report tools as Treasurer.',
        media: 'Media workspace for gallery, videos, contact messages, and publicity.',
        organizer: 'Organizer workspace for events, activities, volunteers, and programme coordination.',
        amir_director: 'Amir Dawah / Director of Dawah workspace for prayer times, hadiths, Islamic resources, lectures, and reminders.',
        student: 'Member workspace for profile, events, welfare, dues, donations, and resources.'
    };
    return messages[role] || messages.student;
}

// Runtime slice from daawah.js: loadDashboardPrayerTimes.
function loadDashboardPrayerTimes() {
    const container = document.getElementById('prayerTimesList');
    if (!container) return;
    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()
        ? window.SupabaseBackend.loadStore('adminPrayerTimes').then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_supabase-required-endpoint?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));
    prayerRequest.then(result => {
        const data = result.data || {};
        const prayers = [
            ['Fajr', data.fajr],
            ['Dhuhr', data.dhuhr],
            ['Asr', data.asr],
            ['Maghrib', data.maghrib],
            ['Isha', data.isha]
        ];
        container.innerHTML = prayers.map(([name, time]) => `
            <div class="prayer-time">
                <span class="prayer-name">${name}</span>
                <span class="prayer-time-value">${time || 'Not set'}</span>
            </div>
        `).join('');
    }).catch(() => {
        container.innerHTML = '<p class="text-muted mb-0">Prayer times have not been added yet.</p>';
    });
}

// TOGGLE/COLLAPSE FUNCTIONS FOR HIDING/SHOWING FEATURES

// Runtime slice from daawah.js: toggleSection.
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Runtime slice from daawah.js: showSection.
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

// Runtime slice from daawah.js: hideSection.
function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

// Runtime slice from daawah.js: toggleDetails.
function toggleDetails(detailsId) {
    const details = document.getElementById(detailsId);
    if (details) {
        details.classList.toggle('hidden');
        const icon = event.target.closest('.toggle-btn')?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
}

// VOLUNTEER FUNCTIONS

// Runtime slice from daawah.js: showVolunteerModal.
function showVolunteerModal() {
    populateVolunteerOpportunities();
    const modal = new bootstrap.Modal(document.getElementById('volunteerModal'));
    modal.show();
}

// Runtime slice from daawah.js: submitVolunteerSignup.
function submitVolunteerSignup() {
    const opportunity = document.getElementById('volunteerOpportunity').value;
    const skills = document.getElementById('volunteerSkills').value;
    const availability = document.getElementById('volunteerAvailability').value;
    const commitment = document.getElementById('volunteerCommit').checked;

    if (!opportunity || !availability || !commitment) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    const selectedOpportunity = getVolunteerOpportunities().find(item => String(item.id || item.title) === String(opportunity) || item.title === opportunity);
    if (!frontendOnly && selectedOpportunity?.dbOpportunityId) {
        getCurrentStudentId()
            .then(studentId => fetch('supabase-required-endpoint?action=registerVolunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(authPayload({
                    opportunity_id: selectedOpportunity.dbOpportunityId,
                    student_id: studentId,
                    skills,
                    availability
                }))
            }))
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) throw new Error(result.message || 'Could not register for volunteering');
                logLocalRoleActivity('registerVolunteer', { opportunity: selectedOpportunity.title, availability });
                bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
                document.getElementById('volunteerForm').reset();
                showNotification('Volunteer signup saved to the database.', 'success');
                return loadVolunteerData();
            })
            .catch(error => showNotification(error.message || 'Could not save volunteer signup', 'danger'));
        return;
    }

    // Add to volunteer records
    const volunteerRecord = {
        id: Date.now(),
        opportunity: opportunity,
        skills: skills,
        availability: availability,
        dateSignedUp: new Date().toLocaleDateString(),
        status: 'Active'
    };

    let volunteerRecords = readList('volunteerRecords');
    volunteerRecords.push(volunteerRecord);
    localStorage.setItem('volunteerRecords', JSON.stringify(volunteerRecords));
    saveOwnedCloudRecord('volunteerRegistrations', volunteerRecord, 'volunteerRecords');
    logLocalRoleActivity('registerVolunteer', { opportunity, availability });

    bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
    showNotification('Successfully signed up for volunteering!', 'success');

    // Clear form
    document.getElementById('volunteerForm').reset();
    loadVolunteerData();
}

// Runtime slice from daawah.js: registerVolunteer.
function registerVolunteer(opportunity) {
    showVolunteerModal();
    document.getElementById('volunteerOpportunity').value = decodeURIComponent(opportunity);
}

// Update loadViewData to include volunteer view
const originalLoadViewData = window.loadViewData;
window.loadViewData = function(viewName) {
    if (viewName === 'dashboard') {
        loadDashboardData();
    } else if (viewName === 'volunteer') {
        loadVolunteerData();
    } else if (originalLoadViewData) {
        originalLoadViewData(viewName);
    }
};

// Runtime slice from daawah.js: loadVolunteerData.
function loadVolunteerData() {
    const managerPanel = document.getElementById('volunteerManagerPanel');
    managerPanel?.classList.toggle('d-none', !hasPermission('manage_events'));
    return Promise.allSettled([loadVolunteerOpportunitiesFromApi(), loadVolunteerRecordsFromApi()])
        .finally(() => {
            const volunteerRecords = getVolunteerRecords();
            renderVolunteerOpportunities();
            renderVolunteerRecords(volunteerRecords);
            populateVolunteerOpportunities();
        });
}

// Runtime slice from daawah.js: loadVolunteerOpportunitiesFromApi.
function loadVolunteerOpportunitiesFromApi() {
    if (frontendOnly) {
        databaseVolunteerOpportunities = [];
        return Promise.resolve([]);
    }
    return fetch('supabase-required-endpoint?action=getVolunteerOps', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load volunteer opportunities');
            databaseVolunteerOpportunities = (result.data || []).map(normalizeDatabaseVolunteerOpportunity);
            return databaseVolunteerOpportunities;
        })
        .catch(error => {
            console.warn('Database volunteer opportunities unavailable:', error);
            databaseVolunteerOpportunities = [];
            return [];
        });
}

// Runtime slice from daawah.js: loadVolunteerRecordsFromApi.
function loadVolunteerRecordsFromApi() {
    if (frontendOnly || !currentUser) {
        databaseVolunteerRecords = [];
        return Promise.resolve([]);
    }
    const actor = authQuery();
    const loadRecords = studentId => fetch(`supabase-required-endpoint?action=getVolunteerRegistrations&${actor}&student_id=${encodeURIComponent(studentId || 0)}`, { credentials: 'same-origin' });
    const request = hasPermission('manage_events')
        ? loadRecords(0)
        : getCurrentStudentId().then(loadRecords);
    return request
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load volunteer records');
            databaseVolunteerRecords = (result.data || []).map(normalizeDatabaseVolunteerRecord);
            return databaseVolunteerRecords;
        })
        .catch(error => {
            console.warn('Database volunteer records unavailable:', error);
            databaseVolunteerRecords = [];
            return [];
        });
}

// Runtime slice from daawah.js: normalizeDatabaseVolunteerOpportunity.
function normalizeDatabaseVolunteerOpportunity(opportunity) {
    const schedule = [opportunity.start_date, opportunity.end_date].filter(Boolean).join(' to ') || opportunity.duration || 'Schedule will be announced';
    return {
        id: `db-volunteer-${opportunity.id}`,
        dbOpportunityId: Number(opportunity.id),
        source: 'database',
        title: opportunity.title,
        description: opportunity.description,
        requiredHours: opportunity.required_hours,
        schedule,
        signupCount: Number(opportunity.signup_count || 0)
    };
}

// Runtime slice from daawah.js: normalizeDatabaseVolunteerRecord.
function normalizeDatabaseVolunteerRecord(record) {
    return {
        id: `db-volunteer-record-${record.id}`,
        dbRegistrationId: Number(record.id),
        opportunity: record.opportunity_title,
        availability: record.availability || '-',
        skills: record.skills || '-',
        dateSignedUp: record.registered_at ? new Date(record.registered_at).toLocaleDateString() : '-',
        status: record.status || 'registered',
        hoursCompleted: record.hours_completed || 0,
        studentName: [record.first_name, record.last_name].filter(Boolean).join(' '),
        studentNumber: record.student_number || '',
        email: record.email || ''
    };
}

// Runtime slice from daawah.js: getVolunteerRecords.
function getVolunteerRecords() {
    const localRecords = readList('volunteerRecords');
    return [...databaseVolunteerRecords, ...localRecords];
}

// Runtime slice from daawah.js: getVolunteerOpportunities.
function getVolunteerOpportunities() {
    const savedOpportunities = readList('volunteerOpportunities').map(item => ({ ...item, source: item.source || 'local' }));
    const activityOpportunities = getActivities()
        .filter(activity => /volunteer|service|support|outreach/i.test(`${activity.title} ${activity.description}`))
        .map(activity => ({
            id: `activity-${activity.id || activity.title}`,
            title: activity.title,
            description: activity.description,
            requiredHours: 2,
            schedule: activity.schedule || 'Schedule will be announced'
        }));

    return [...databaseVolunteerOpportunities, ...savedOpportunities, ...activityOpportunities, ...defaultVolunteerOpportunities].filter((opportunity, index, list) => {
        const key = opportunity.id || opportunity.title;
        return index === list.findIndex(item => (item.id || item.title) === key);
    });
}

// Runtime slice from daawah.js: renderVolunteerOpportunities.
function renderVolunteerOpportunities() {
    const container = document.getElementById('volunteerOpportunitiesList');
    if (!container) return;

    const opportunities = getVolunteerOpportunities();
    if (!opportunities.length) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No volunteer opportunities have been added yet.</div>';
        return;
    }

    container.innerHTML = opportunities.map(opportunity => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card volunteer-card h-100">
                <div class="card-header">
                    <h6 class="mb-0">${escapeHtml(opportunity.title)}</h6>
                    <small>${escapeHtml(opportunity.schedule || 'Schedule will be announced')}</small>
                </div>
                <div class="card-body d-flex flex-column">
                    <p class="text-muted">${escapeHtml(opportunity.description || 'Details will be shared soon.')}</p>
                    <div class="volunteer-details mt-auto">
                        <small><strong>Hours:</strong> ${escapeHtml(String(opportunity.requiredHours || opportunity.required_hours || 'Flexible'))}</small>
                        ${opportunity.signupCount ? `<br><small><strong>Signups:</strong> ${escapeHtml(String(opportunity.signupCount))}</small>` : ''}
                    </div>
                    <button class="btn btn-sm btn-primary mt-2" onclick="registerVolunteer('${encodeURIComponent(opportunity.id || opportunity.title)}')">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Runtime slice from daawah.js: populateVolunteerOpportunities.
function populateVolunteerOpportunities() {
    const select = document.getElementById('volunteerOpportunity');
    if (!select) return;

    const opportunities = getVolunteerOpportunities();
    select.innerHTML = '<option value="">Select opportunity</option>' + opportunities.map(opportunity =>
        `<option value="${escapeHtml(opportunity.id || opportunity.title)}">${escapeHtml(opportunity.title)}</option>`
    ).join('');
}

// Runtime slice from daawah.js: renderVolunteerRecords.
function renderVolunteerRecords(volunteerRecords) {
    const tbody = document.getElementById('volunteerRecordsList');
    if (!tbody) return;

    if (!volunteerRecords.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No volunteer signups yet.</td></tr>';
        return;
    }

    tbody.innerHTML = volunteerRecords.map(record => `
        <tr>
            <td>
                ${escapeHtml(record.opportunity || '-')}
                ${hasPermission('manage_events') && record.studentName ? `<br><small class="text-muted">${escapeHtml(record.studentName)} ${record.studentNumber ? '(' + escapeHtml(record.studentNumber) + ')' : ''}</small>` : ''}
            </td>
            <td>${escapeHtml(record.availability || '-')}</td>
            <td>${escapeHtml(record.skills || '-')}</td>
            <td>${escapeHtml(record.dateSignedUp || '-')}</td>
            <td>
                <span class="badge bg-success">${escapeHtml(record.status || 'Active')}</span>
                ${hasPermission('manage_events') && record.dbRegistrationId ? renderVolunteerStatusActions(record) : ''}
            </td>
        </tr>
    `).join('');
}

// Runtime slice from daawah.js: renderVolunteerStatusActions.
function renderVolunteerStatusActions(record) {
    return `
        <div class="btn-group btn-group-sm mt-2" role="group" aria-label="Volunteer status">
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'registered')">Registered</button>
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'in-progress')">Progress</button>
            <button class="btn btn-outline-success" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'completed')">Done</button>
        </div>
    `;
}

// Runtime slice from daawah.js: updateVolunteerStatus.
function updateVolunteerStatus(registrationId, status) {
    const hours = status === 'completed' ? prompt('Hours completed?', '1') : '';
    fetch('supabase-required-endpoint?action=updateVolunteerRegistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({
            registration_id: registrationId,
            status,
            hours_completed: hours === '' ? undefined : Number(hours)
        }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update volunteer status');
        showNotification('Volunteer status updated.', 'success');
        return loadVolunteerData();
    })
    .catch(error => showNotification(error.message || 'Could not update volunteer status', 'danger'));
}

// Runtime slice from daawah.js: saveVolunteerOpportunity.
function saveVolunteerOpportunity(event) {
    event.preventDefault();
    if (!hasPermission('manage_events')) {
        showNotification('Only event managers and organizers can add volunteer opportunities.', 'warning');
        return;
    }

    const opportunity = {
        id: `custom-volunteer-${Date.now()}`,
        title: document.getElementById('volunteerOpportunityTitle').value.trim(),
        description: document.getElementById('volunteerOpportunityDescription').value.trim(),
        requiredHours: Number(document.getElementById('volunteerOpportunityHours').value) || 1,
        schedule: document.getElementById('volunteerOpportunitySchedule').value.trim()
    };

    if (!opportunity.title || !opportunity.description || !opportunity.schedule) {
        showNotification('Please fill in all volunteer opportunity fields.', 'warning');
        return;
    }

    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=createVolunteerOp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(authPayload({
                title: opportunity.title,
                description: opportunity.description,
                required_hours: opportunity.requiredHours,
                duration: opportunity.schedule,
                schedule: opportunity.schedule,
                created_by: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0
            }))
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not add volunteer opportunity');
            logLocalRoleActivity('createVolunteerOp', { title: opportunity.title, requiredHours: opportunity.requiredHours, schedule: opportunity.schedule });
            document.getElementById('volunteerOpportunityForm').reset();
            showNotification('Volunteer opportunity saved to the database.', 'success');
            return loadVolunteerData();
        })
        .catch(error => showNotification(error.message || 'Could not add volunteer opportunity', 'danger'));
        return;
    }

    const opportunities = readList('volunteerOpportunities');
    opportunities.unshift(opportunity);
    localStorage.setItem('volunteerOpportunities', JSON.stringify(opportunities));
    logLocalRoleActivity('createVolunteerOp', { title: opportunity.title, requiredHours: opportunity.requiredHours, schedule: opportunity.schedule });
    document.getElementById('volunteerOpportunityForm').reset();
    loadVolunteerData();
    showNotification('Volunteer opportunity added.', 'success');
}

// Runtime slice from daawah.js: suggestOfficerHadithArabic.
function suggestOfficerHadithArabic() {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Dawah Team can manage hadiths.', 'warning');
        return;
    }
    const english = document.getElementById('officerHadithEnglish')?.value.trim() || '';
    const reference = document.getElementById('officerHadithReference')?.value.trim() || '';
    const arabicField = document.getElementById('officerHadithArabic');
    const button = document.getElementById('officerSuggestArabicBtn');
    const status = document.getElementById('officerArabicSuggestionStatus');
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
        body: JSON.stringify(authPayload({ english, reference }))
    };
    fetch(endpoint, requestOptions)
    .then(response => parseJsonResponse(response))
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
// ============================================
// OFFICER HADITH MANAGEMENT
// ============================================

// Runtime slice from daawah.js: saveOfficerHadith.
function saveOfficerHadith(event) {
    event.preventDefault();
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Dawah Team can manage hadiths.', 'warning');
        return;
    }

    const payload = {
        arabic: document.getElementById('officerHadithArabic')?.value.trim() || '',
        english: document.getElementById('officerHadithEnglish')?.value.trim() || '',
        reference: document.getElementById('officerHadithReference')?.value.trim() || '',
        source: document.getElementById('officerHadithSource')?.value.trim() || '',
        category: document.getElementById('officerHadithCategory')?.value.trim() || '',
        verification_status: document.getElementById('officerHadithVerificationStatus')?.value || 'needs_verification'
    };

    if (!payload.arabic || !payload.english) {
        showNotification('Arabic and English texts are required.', 'warning');
        return;
    }

    if (frontendOnly) {
        const hadiths = readList('adminHadiths');
        hadiths.unshift({ id: Date.now(), ...payload, created_at: new Date().toISOString() });
        localStorage.setItem('adminHadiths', JSON.stringify(hadiths));
        document.getElementById('officerHadithForm')?.reset();
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith added successfully.', 'success');
        return;
    }

    fetch('supabase-required-endpoint?action=addHadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload(payload))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not add hadith');
        document.getElementById('officerHadithForm')?.reset();
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith added successfully.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not add hadith', 'danger'));
}

// Runtime slice from daawah.js: loadOfficerHadiths.
function loadOfficerHadiths() {
    const container = document.getElementById('officerHadithsList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading hadiths...</p>';

    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('supabase-required-endpoint?action=getHadiths', { credentials: 'same-origin' }).then(response => parseJsonResponse(response));

    request
    .then(result => {
        const hadiths = result.data || [];
        if (!hadiths.length) {
            container.innerHTML = '<p class="text-muted mb-0">No hadiths added yet.</p>';
            return;
        }

        container.innerHTML = hadiths.map(hadith => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <p style="font-size: 16px; margin: 10px 0; direction: rtl; font-weight: bold;">
                        <i class="fas fa-quote-left"></i> ${escapeHtml(hadith.arabic || '')}
                    </p>
                    <div class="mb-2">${renderOfficerHadithVerificationBadge(hadith.verification_status)}</div>
                    <p class="mb-2"><strong>English:</strong> ${escapeHtml(hadith.english || '')}</p>
                    ${hadith.reference ? `<p class="mb-1"><strong>Reference:</strong> ${escapeHtml(hadith.reference)}</p>` : ''}
                    ${hadith.source ? `<p class="mb-1"><strong>Source:</strong> ${escapeHtml(hadith.source)}</p>` : ''}
                    ${hadith.category ? `<p class="mb-1"><strong>Category:</strong> <span class="badge bg-info">${escapeHtml(hadith.category)}</span></p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-success" onclick="verifyOfficerHadith(${Number(hadith.id)}, 'verified')">
                        <i class="fas fa-check"></i> Verify
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="verifyOfficerHadith(${Number(hadith.id)}, 'needs_verification')">
                        <i class="fas fa-hourglass-half"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOfficerHadith(${Number(hadith.id)})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Could not load hadiths')}</p>`;
    });
}

// Runtime slice from daawah.js: renderOfficerHadithVerificationBadge.
function renderOfficerHadithVerificationBadge(status) {
    const value = String(status || 'needs_verification');
    const labels = {
        verified: ['Verified', 'success'],
        draft: ['Draft', 'secondary'],
        needs_verification: ['Needs Verification', 'warning']
    };
    const entry = labels[value] || labels.needs_verification;
    return `<span class="badge bg-${entry[1]}">${entry[0]}</span>`;
}

// Runtime slice from daawah.js: verifyOfficerHadith.
function verifyOfficerHadith(hadithId, status) {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Dawah Team can verify hadiths.', 'warning');
        return;
    }
    fetch('supabase-required-endpoint?action=verifyHadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({ hadith_id: Number(hadithId), verification_status: status }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update verification');
        showNotification('Hadith verification updated.', 'success');
        loadOfficerHadiths();
        initializeHadiths();
    })
    .catch(error => showNotification(error.message || 'Could not update verification', 'danger'));
}

// Runtime slice from daawah.js: deleteOfficerHadith.
function deleteOfficerHadith(hadithId) {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Dawah Team can delete hadiths.', 'warning');
        return;
    }
    if (!confirm('Delete this hadith?')) return;

    if (frontendOnly) {
        const hadiths = readList('adminHadiths').filter(hadith => Number(hadith.id) !== Number(hadithId));
        localStorage.setItem('adminHadiths', JSON.stringify(hadiths));
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith deleted.', 'success');
        return;
    }

    fetch('supabase-required-endpoint?action=deleteHadith', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({ hadith_id: Number(hadithId) }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete hadith');
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith deleted.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not delete hadith', 'danger'));
}

// ============================================
// HADITH REMINDER SYSTEM
// ============================================

let currentHadithIndex = 0;
let allHadiths = [];
let hadithsLoaded = false;

// Initialize Hadiths on Dashboard Load

// Runtime slice from daawah.js: initializeHadiths.
function initializeHadiths() {
    Promise.all([loadAllHadiths(), loadDailyHadith()]).catch(() => {
        console.warn('Hadith initialization encountered an issue.');
    });
}

// Load all hadiths

// Runtime slice from daawah.js: loadAllHadiths.
function loadAllHadiths() {
    const hadithRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('Supabase-hadith-store?action=getAll').then(response => parseJsonResponse(response));

    return hadithRequest
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                allHadiths = data.data;
                hadithsLoaded = true;
                return allHadiths;
            }
            throw new Error('Invalid hadith list returned');
        })
        .catch(() => {
            allHadiths = [];
            hadithsLoaded = true;
            return allHadiths;
        });
}

// Load today''s hadith

// Runtime slice from daawah.js: loadDailyHadith.
function loadDailyHadith() {
    const dailyRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getDailyHadith'))
        : fetch('Supabase-hadith-store?action=getDaily').then(response => parseJsonResponse(response));

    return dailyRequest
        .then(data => {
            if (data.success && data.data) {
                currentHadithIndex = data.position - 1;
                if (allHadiths.length === 0) {
                    allHadiths = [data.data];
                }
                displayHadith(data.data, data.position, data.total);
                hadithsLoaded = true;
                return data.data;
            }
            throw new Error('Invalid daily hadith returned');
        })
        .catch(() => {
            if (allHadiths.length > 0) {
                const today = new Date().getDate();
                currentHadithIndex = today % allHadiths.length;
                displayHadith(allHadiths[currentHadithIndex], currentHadithIndex + 1, allHadiths.length);
                hadithsLoaded = true;
            } else {
                displayHadith(null, 0, 0);
                hadithsLoaded = true;
            }
            return null;
        });
}

// Display hadith in the UI

// Runtime slice from daawah.js: displayHadith.
function displayHadith(hadith, position, total) {
    const textElement = document.getElementById('hadithText');
    const referenceElement = document.getElementById('hadithReference');
    const translationElement = document.getElementById('hadithTranslation');
    const counterElement = document.getElementById('hadithCounter');
    const totalElement = document.getElementById('hadithTotal');

    if (!hadith) {
        if (textElement) textElement.textContent = 'No hadith has been added yet.';
        if (referenceElement) referenceElement.textContent = '';
        if (translationElement) translationElement.textContent = '';
        if (counterElement) counterElement.textContent = '0';
        if (totalElement) totalElement.textContent = '0';
        currentHadithIndex = 0;
        return;
    }

    if (textElement) {
        textElement.textContent = hadith.arabic || 'Hadith not found';
        textElement.style.animation = 'none';
        setTimeout(() => {
            textElement.style.animation = 'welcomeFadeInScale 0.6s ease-out';
        }, 10);
    }

    if (referenceElement) {
        referenceElement.textContent = hadith.reference || '';
    }

    if (translationElement) {
        translationElement.textContent = hadith.english ? `Translation: ${hadith.english}` : 'Translation not available';
    }

    if (counterElement) {
        counterElement.textContent = position;
    }

    if (totalElement) {
        totalElement.textContent = total;
    }

    currentHadithIndex = position - 1;
}

// Navigate to next hadith

// Runtime slice from daawah.js: nextHadith.
function nextHadith() {
    if (!hadithsLoaded && allHadiths.length === 0) {
        showNotification('Hadith data is still loading, please wait.', 'warning');
        return;
    }
    if (allHadiths.length === 0) return;

    currentHadithIndex = (currentHadithIndex + 1) % allHadiths.length;
    displayHadith(allHadiths[currentHadithIndex], currentHadithIndex + 1, allHadiths.length);
}

// Navigate to previous hadith

// Runtime slice from daawah.js: previousHadith.
function previousHadith() {
    if (!hadithsLoaded && allHadiths.length === 0) {
        showNotification('Hadith data is still loading, please wait.', 'warning');
        return;
    }
    if (allHadiths.length === 0) return;

    currentHadithIndex = (currentHadithIndex - 1 + allHadiths.length) % allHadiths.length;
    displayHadith(allHadiths[currentHadithIndex], currentHadithIndex + 1, allHadiths.length);
}

// Keep the user view empty until admins add hadiths.

// Runtime slice from daawah.js: loadLocalHadiths.
function loadLocalHadiths() {
    allHadiths = [];
    currentHadithIndex = 0;
    displayHadith(null, 0, 0);
    hadithsLoaded = true;
}

// Call initialize hadiths when dashboard shows
const originalShowDashboard = window.showDashboard;
window.showDashboard = function() {
    originalShowDashboard();
    setTimeout(() => initializeHadiths(), 600);
};

// CONTACT MANAGEMENT

// Runtime slice from daawah.js: loadAdminContact.
function loadAdminContact() {
    const applySettings = settings => {
        const merged = { ...getLocalSiteSettings(), ...(settings || {}) };
        document.getElementById('contactLocation').value = merged.contact_location || '';
        document.getElementById('contactPhone').value = merged.contact_phone || '';
        document.getElementById('contactEmail').value = merged.contact_email || '';
        document.getElementById('contactHours').value = merged.contact_hours || '';
        document.getElementById('contactWhatsapp').value = merged.social_whatsapp || '';
        document.getElementById('contactFacebook').value = merged.social_facebook || '';
        document.getElementById('contactX').value = merged.social_x || '';
        document.getElementById('contactInstagram').value = merged.social_instagram || '';
        document.getElementById('contactYoutube').value = merged.social_youtube || '';
        document.getElementById('contactTiktok').value = merged.social_tiktok || '';
        document.getElementById('contactLinkedin').value = merged.social_linkedin || '';
        document.getElementById('displayLocation').textContent = merged.contact_location || '-';
        document.getElementById('displayPhone').textContent = merged.contact_phone || '-';
        document.getElementById('displayEmail').textContent = merged.contact_email || '-';
        document.getElementById('displayHours').textContent = merged.contact_hours || '-';
    };

    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getSiteSettings'))
        : fetch('supabase-required-endpoint?action=getSiteSettings').then(response => parseJsonResponse(response));

    request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load contact settings');
            writeLocalSiteSettings(result.data || {});
            applySettings(result.data || {});
        })
        .catch(() => applySettings(getLocalSiteSettings()));
    loadContactVoiceMessages();
}

// Runtime slice from daawah.js: updateContactInfo.
function updateContactInfo(type) {
    let value = '';
    let fieldName = '';
    const fields = {
        location: ['contactLocation', 'Location'],
        phone: ['contactPhone', 'Phone Number'],
        email: ['contactEmail', 'Email Address'],
        hours: ['contactHours', 'Office Hours']
    };

    if (!fields[type]) return;
    value = document.getElementById(fields[type][0]).value.trim();
    fieldName = fields[type][1];

    if (!value) {
        showNotification('Please enter a value for ' + fieldName, 'warning');
        return;
    }

    saveContactAndSocialInfo(fieldName + ' updated successfully!');
}

// Runtime slice from daawah.js: getContactSettingsPayload.
function getContactSettingsPayload() {
    return {
        contact_location: document.getElementById('contactLocation')?.value.trim() || '',
        contact_phone: document.getElementById('contactPhone')?.value.trim() || '',
        contact_email: document.getElementById('contactEmail')?.value.trim() || '',
        contact_hours: document.getElementById('contactHours')?.value.trim() || '',
        social_whatsapp: document.getElementById('contactWhatsapp')?.value.trim() || '',
        social_facebook: document.getElementById('contactFacebook')?.value.trim() || '',
        social_x: document.getElementById('contactX')?.value.trim() || '',
        social_instagram: document.getElementById('contactInstagram')?.value.trim() || '',
        social_youtube: document.getElementById('contactYoutube')?.value.trim() || '',
        social_tiktok: document.getElementById('contactTiktok')?.value.trim() || '',
        social_linkedin: document.getElementById('contactLinkedin')?.value.trim() || ''
    };
}

// Runtime slice from daawah.js: saveContactAndSocialInfo.
function saveContactAndSocialInfo(successMessage = 'Contact and social links updated successfully!') {
    if (!hasPermission('manage_contact')) {
        showNotification('Only media/contact officers can update contact and social links.', 'warning');
        return;
    }
    const payload = getContactSettingsPayload();
    if (frontendOnly) {
        writeLocalSiteSettings(payload);
        loadAdminContact();
        loadPublicSiteSettings();
        showNotification(successMessage, 'success');
        return;
    }

    fetch('supabase-required-endpoint?action=updateSiteSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload(payload))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save contact settings');
        writeLocalSiteSettings(result.data?.settings || payload);
        loadAdminContact();
        loadPublicSiteSettings();
        showNotification(successMessage, 'success');
    })
    .catch(error => showNotification(error.message || 'Could not update contact settings', 'danger'));
}

// Runtime slice from daawah.js: getSupportedContactVoiceMime.
function getSupportedContactVoiceMime() {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
        return '';
    }
    return [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4'
    ].find(type => MediaRecorder.isTypeSupported(type)) || '';
}

// Runtime slice from daawah.js: setVoiceRecordingStatus.
function setVoiceRecordingStatus(message, type = 'muted') {
    const status = document.getElementById('voiceRecordingStatus');
    if (!status) return;
    status.textContent = message;
    status.className = `small mt-2 text-${type}`;
}

// Runtime slice from daawah.js: startContactVoiceRecording.
async function startContactVoiceRecording() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setVoiceRecordingStatus('Recording is not supported in this browser. Upload an audio file instead.', 'danger');
        return;
    }

    try {
        clearContactVoiceRecording(false);
        contactVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedContactVoiceMime();
        contactVoiceRecorder = new MediaRecorder(contactVoiceStream, mimeType ? { mimeType } : undefined);
        contactVoiceChunks = [];

        contactVoiceRecorder.addEventListener('dataavailable', event => {
            if (event.data && event.data.size > 0) {
                contactVoiceChunks.push(event.data);
            }
        });

        contactVoiceRecorder.addEventListener('stop', () => {
            const type = contactVoiceRecorder.mimeType || mimeType || 'audio/webm';
            contactVoiceBlob = new Blob(contactVoiceChunks, { type });
            stopContactVoiceStream();
            showContactVoicePreview(contactVoiceBlob);
            setVoiceRecordingStatus('Voice message ready. You can play it before sending.', 'success');
        });

        contactVoiceRecorder.start();
        document.getElementById('startVoiceRecording').disabled = true;
        document.getElementById('stopVoiceRecording').disabled = false;
        document.getElementById('clearVoiceRecording').disabled = true;
        document.getElementById('contactVoiceFile').value = '';
        setVoiceRecordingStatus('Recording... allow the microphone prompt if your browser asks.', 'danger');
    } catch (error) {
        stopContactVoiceStream();
        const secureHint = location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1'
            ? ' Open the site through localhost or HTTPS, or upload an audio file.'
            : '';
        setVoiceRecordingStatus(`Microphone could not start.${secureHint}`, 'danger');
    }
}

// Runtime slice from daawah.js: stopContactVoiceRecording.
function stopContactVoiceRecording() {
    if (contactVoiceRecorder && contactVoiceRecorder.state === 'recording') {
        contactVoiceRecorder.stop();
    }
    document.getElementById('startVoiceRecording').disabled = false;
    document.getElementById('stopVoiceRecording').disabled = true;
    document.getElementById('clearVoiceRecording').disabled = false;
}

// Runtime slice from daawah.js: stopContactVoiceStream.
function stopContactVoiceStream() {
    if (!contactVoiceStream) return;
    contactVoiceStream.getTracks().forEach(track => track.stop());
    contactVoiceStream = null;
}

// Runtime slice from daawah.js: clearContactVoiceRecording.
function clearContactVoiceRecording(resetStatus = true) {
    if (contactVoiceRecorder && contactVoiceRecorder.state === 'recording') {
        contactVoiceRecorder.stop();
    }
    stopContactVoiceStream();
    contactVoiceRecorder = null;
    contactVoiceChunks = [];
    contactVoiceBlob = null;
    const preview = document.getElementById('voiceRecordingPreview');
    if (preview) {
        if (preview.src) URL.revokeObjectURL(preview.src);
        preview.removeAttribute('src');
        preview.classList.add('d-none');
    }
    const fileInput = document.getElementById('contactVoiceFile');
    if (fileInput) fileInput.value = '';
    document.getElementById('startVoiceRecording').disabled = false;
    document.getElementById('stopVoiceRecording').disabled = true;
    document.getElementById('clearVoiceRecording').disabled = true;
    if (resetStatus) {
        setVoiceRecordingStatus('Record a voice message or upload an audio file below.');
    }
}

// Runtime slice from daawah.js: showContactVoicePreview.
function showContactVoicePreview(blobOrFile) {
    const preview = document.getElementById('voiceRecordingPreview');
    if (!preview || !blobOrFile) return;
    if (preview.src) URL.revokeObjectURL(preview.src);
    preview.src = URL.createObjectURL(blobOrFile);
    preview.classList.remove('d-none');
}

// Runtime slice from daawah.js: handleContactVoiceFileChange.
function handleContactVoiceFileChange(event) {
    const file = event.target.files?.[0];
    contactVoiceBlob = null;
    if (!file) {
        clearContactVoiceRecording();
        return;
    }
    if (!validateUploadFile(file, 'voice')) {
        event.target.value = '';
        clearContactVoiceRecording();
        return;
    }
    showContactVoicePreview(file);
    document.getElementById('clearVoiceRecording').disabled = false;
    setVoiceRecordingStatus('Audio file ready. You can play it before sending.', 'success');
}

// Runtime slice from daawah.js: getContactVoiceFileForSubmit.
function getContactVoiceFileForSubmit() {
    const uploadedFile = document.getElementById('contactVoiceFile')?.files?.[0];
    if (uploadedFile) return uploadedFile;
    if (!contactVoiceBlob) return null;
    const extension = contactVoiceBlob.type.includes('ogg') ? 'ogg' : contactVoiceBlob.type.includes('mp4') ? 'm4a' : 'webm';
    return new File([contactVoiceBlob], `contact-voice.${extension}`, { type: contactVoiceBlob.type || 'audio/webm' });
}

// Runtime slice from daawah.js: resetContactFormAfterSubmit.
function resetContactFormAfterSubmit() {
    document.getElementById('contactForm')?.reset();
    clearContactVoiceRecording();
}

// Runtime slice from daawah.js: submitContactVoiceMessage.
function submitContactVoiceMessage(event) {
    event.preventDefault();
    if (frontendOnly) {
        showNotification('Voice messages need the Supabase backend. Please open this through XAMPP/localhost.', 'warning');
        return;
    }

    const voiceFile = getContactVoiceFileForSubmit();
    if (!voiceFile) {
        showNotification('Please record a voice message or upload an audio file.', 'warning');
        return;
    }
    if (!validateUploadFile(voiceFile, 'voice')) {
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('contactName').value.trim());
    formData.append('email', document.getElementById('contactEmailAddress').value.trim());
    formData.append('subject', document.getElementById('contactSubject').value.trim());
    formData.append('message', document.getElementById('contactMessage').value.trim());
    formData.append('voice_message', voiceFile);

    const button = document.getElementById('contactSubmitButton');
    const originalText = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    fetch('supabase-required-endpoint?action=submitContactVoiceMessage', {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not send voice message');
        }
        showNotification('Voice message sent successfully.', 'success');
        resetContactFormAfterSubmit();
    })
    .catch(error => showNotification(error.message || 'Could not send voice message', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}

// Runtime slice from daawah.js: loadContactVoiceMessages.
function loadContactVoiceMessages() {
    const container = document.getElementById('contactVoiceMessagesList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading voice messages...</p>';

    fetch('supabase-required-endpoint?action=getContactVoiceMessages')
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load voice messages');
        }
        renderContactVoiceMessages(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Could not load voice messages')}</p>`;
    });
}

// Runtime slice from daawah.js: renderContactVoiceMessages.
function renderContactVoiceMessages(messages) {
    const container = document.getElementById('contactVoiceMessagesList');
    if (!container) return;
    if (!messages.length) {
        container.innerHTML = '<p class="text-muted mb-0">No voice messages yet.</p>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="voice-inbox-item">
            <div class="voice-inbox-item__header">
                <div>
                    <h6>${escapeHtml(message.subject)}</h6>
                    <p class="text-muted mb-1">${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p>
                    <p class="text-muted mb-0">${message.created_at ? new Date(message.created_at).toLocaleString() : ''}</p>
                </div>
                <span class="badge bg-${message.status === 'read' ? 'success' : 'warning'}">${message.status === 'read' ? 'Listened' : 'New'}</span>
            </div>
            ${message.message ? `<p class="mt-2 mb-2">${escapeHtml(message.message)}</p>` : ''}
            <audio class="w-100 contact-voice-audio" controls data-message-id="${Number(message.id)}" src="${resolveAppUrl(message.audio_path)}"></audio>
        </div>
    `).join('');

    container.querySelectorAll('.contact-voice-audio').forEach(audio => {
        audio.addEventListener('play', () => markContactVoiceMessageRead(audio.dataset.messageId));
    });
}

// Runtime slice from daawah.js: markContactVoiceMessageRead.
function markContactVoiceMessageRead(messageId) {
    if (!messageId) return;
    fetch('supabase-required-endpoint?action=markContactVoiceMessageRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: Number(messageId) })
    }).catch(() => {});
}

// GALLERY MANAGEMENT

// Runtime slice from daawah.js: loadAdminGallery.
function loadAdminGallery() {
    const galleryList = document.getElementById('galleryItemsList');
    if (!galleryList) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_supabase-required-endpoint?action=getGallery').then(response => parseJsonResponse(response));

    galleryRequest
    .then(result => {
        let galleryItems = result.data || [];

        if (galleryItems.length === 0) {
        galleryList.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No gallery or video items yet</td></tr>';
            return;
        }

        galleryList.innerHTML = galleryItems.map((item, index) => {
            const imageUrl = item.image_url || item.imageData || item.imageUrl || '';
            const mediaType = item.media_type || getGalleryMediaType(imageUrl);
            const removeId = item.id || index;
            return `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.description || ''}</td>
                    <td>${imageUrl ? (mediaType === 'video' ? `<video src="${resolveAppUrl(imageUrl)}" style="max-height:80px; max-width:120px; object-fit:cover; border-radius:6px;" muted></video>` : `<img src="${resolveAppUrl(imageUrl)}" alt="${item.title}" style="max-height:80px; max-width:120px; object-fit:cover; border-radius:6px;">`) : '<span class="text-muted">No media</span>'}</td>
                    <td><i class="${mediaType === 'video' ? 'fas fa-video' : (item.icon || 'fas fa-images')}"></i></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removeGalleryItem(${removeId})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    })
    .catch(error => {
        console.error('Error loading gallery:', error);
        galleryList.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading gallery items</td></tr>';
    });
}

// Runtime slice from daawah.js: showAddGalleryModal.
function showAddGalleryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addGalleryModal'));
    modal.show();
}

// Runtime slice from daawah.js: previewGalleryImage.
function previewGalleryImage() {
    const imageInput = document.getElementById('galleryImage');
    const preview = document.getElementById('galleryImagePreview');
    const videoPreview = document.getElementById('galleryVideoPreview');

    if (imageInput && imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        if (!validateUploadFile(file, getGalleryUploadLimitKey(file))) {
            imageInput.value = '';
            preview.src = '';
            preview.classList.add('d-none');
            if (videoPreview) {
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                videoPreview.classList.add('d-none');
            }
            return;
        }
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

// Runtime slice from daawah.js: saveGalleryItem.
function saveGalleryItem() {
    const title = document.getElementById('galleryTitle').value.trim();
    const description = document.getElementById('galleryDescription').value.trim();
    const icon = document.getElementById('galleryIcon').value.trim() || 'fas fa-images';
    const imageInput = document.getElementById('galleryImage');

    if (!title || !description || !imageInput || !imageInput.files || imageInput.files.length === 0) {
        showNotification('Please fill in all media fields and choose an image or video.', 'warning');
        return;
    }

    const file = imageInput.files[0];
    if (!validateUploadFile(file, getGalleryUploadLimitKey(file))) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        const mediaType = getGalleryMediaType(imageData, file);

        if (!frontendOnly) {
            fetch('supabase-required-endpoint?action=addGalleryItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    image_url: imageData,
                    media_type: mediaType,
                    uploaded_by: currentUser?.id || 0
                })
            })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Error saving gallery item');
                }

                clearGalleryForm(imageInput);
                bootstrap.Modal.getInstance(document.getElementById('addGalleryModal')).hide();
                loadAdminGallery();
                loadGalleryContent();
                showNotification('Media item added successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification(error.message || 'Error saving media item', 'danger');
            });
            return;
        }

        let galleryItems = readList('galleryItems');

        galleryItems.push({
            title: title,
            description: description,
            icon: icon,
            imageData: imageData,
            imageUrl: imageData,
            media_type: mediaType
        });

        localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
        logLocalRoleActivity('addGalleryItem', { title, media_type: mediaType });

        clearGalleryForm(imageInput);

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('addGalleryModal')).hide();

        // Refresh gallery display
        loadAdminGallery();
        loadGalleryContent(); // Refresh landing page gallery

        showNotification('Media item added successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

// Runtime slice from daawah.js: clearGalleryForm.
function clearGalleryForm(imageInput) {
    document.getElementById('galleryTitle').value = '';
    document.getElementById('galleryDescription').value = '';
    document.getElementById('galleryIcon').value = '';
    imageInput.value = '';
    const preview = document.getElementById('galleryImagePreview');
    const videoPreview = document.getElementById('galleryVideoPreview');
    preview.src = '';
    preview.classList.add('d-none');
    if (videoPreview) {
        videoPreview.pause();
        videoPreview.removeAttribute('src');
        videoPreview.load();
        videoPreview.classList.add('d-none');
    }
}

// Runtime slice from daawah.js: removeGalleryItem.
function removeGalleryItem(index) {
    if (!confirm('Are you sure you want to remove this gallery item?')) return;

    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=deleteGalleryItem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gallery_id: index })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Error removing gallery item');
            }
            loadAdminGallery();
            loadGalleryContent();
            showNotification('Gallery item removed!', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification(error.message || 'Error removing gallery item', 'danger');
        });
        return;
    }

    let galleryItems = readList('galleryItems');
    galleryItems.splice(index, 1);
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    logLocalRoleActivity('deleteGalleryItem', { gallery_id: index });

    loadAdminGallery();
    loadGalleryContent(); // Refresh landing page gallery
    showNotification('Gallery item removed!', 'success');
}
