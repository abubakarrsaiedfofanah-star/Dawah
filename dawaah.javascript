// Dawa'ah - Complete JavaScript Implementation

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
const uploadLimits = {
    profilePhoto: { bytes: 2 * 1024 * 1024, label: '2MB', types: ['image/'] },
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
        html: "<strong>Bank Transfer:</strong><br>Bank Name: Dawa'ah Official Bank<br>Account Name: Dawa'ah Association<br>Account Number: 1234567890<br>After transfer, keep your transaction reference for confirmation."
    },
    numberTransfer: {
        label: 'Normal Transfer Number',
        html: "<strong>Normal Transfer:</strong><br>Send the money to: 0700000000<br>Receiver Name: Dawa'ah Treasurer<br>Use your full name as the transfer narration."
    },
    cash: {
        label: 'Cash Payment',
        html: "<strong>Cash Payment:</strong><br>Pay physically to the Dawa'ah Treasurer and collect/keep your receipt."
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
const defaultVolunteerOpportunities = [
    {
        id: 'campus-cleanup',
        title: 'Campus Clean-up Team',
        description: 'Help coordinate cleanliness drives around prayer spaces and student areas.',
        requiredHours: 3,
        schedule: 'Saturday morning'
    },
    {
        id: 'welfare-support',
        title: 'Welfare Support Team',
        description: 'Assist with welfare follow-ups, member check-ins, and support coordination.',
        requiredHours: 2,
        schedule: 'Flexible weekly slots'
    },
    {
        id: 'event-support',
        title: 'Event Support Team',
        description: 'Support registration desks, seating, ushering, and programme flow during Dawaah events.',
        requiredHours: 4,
        schedule: 'During events'
    }
];

const XAMPP_BASE_URL = 'http://localhost/dawaah/';
const useXamppApi = location.protocol === 'file:' || Boolean(location.port && !['80', '443'].includes(location.port));
const frontendOnly = location.hostname.endsWith('github.io');
const realAppFetch = window.fetch.bind(window);
const ACCOUNT_CLEAR_VERSION = '20260510-clear-accounts-v1';
let contactVoiceRecorder = null;
let contactVoiceStream = null;
let contactVoiceChunks = [];
let contactVoiceBlob = null;

function clearStoredAccountsOnce() {
    if (localStorage.getItem('DawaahAccountClearVersion') === ACCOUNT_CLEAR_VERSION) return;
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
    localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
}

clearStoredAccountsOnce();

window.fetch = function(resource, options = {}) {
    if (useXamppApi && typeof resource === 'string' && /^(api|admin_api|dawaah|mpesa_api)\.php/.test(resource)) {
        return realAppFetch(XAMPP_BASE_URL + resource, options);
    }
    return realAppFetch(resource, options);
};

function parseJsonResponse(response) {
    if (response && typeof response.text === 'function') {
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (error) {
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

function readList(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function getLocalSiteSettings() {
    return {
        contact_location: 'UMMA University, Main Campus',
        contact_phone: '+23231422167',
        contact_email: 'info@dawaah.org',
        contact_hours: 'Monday - Friday: 10 AM - 6 PM',
        social_whatsapp: 'https://api.whatsapp.com/send?phone=23231422167&text=Assalamu%20alaikum%2C%20I%20would%20like%20to%20contact%20Dawa%27ah.',
        social_facebook: '',
        social_x: '',
        social_instagram: '',
        social_youtube: '',
        social_tiktok: '',
        social_linkedin: '',
        ...(JSON.parse(localStorage.getItem('siteSettings') || '{}'))
    };
}

function writeLocalSiteSettings(settings) {
    localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...(settings || {}) }));
}

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
            return { success: true, data: JSON.parse(localStorage.getItem('adminPrayerTimes')) || null };
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
function showLanding() {
    document.getElementById('landingPage').classList.add('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showLoginPage() {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function activateAuthTab(tabName) {
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

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// LEADERSHIP AND GALLERY FUNCTIONS
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

function getGalleryMediaType(url, file = null) {
    const fileType = (file?.type || '').toLowerCase();
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('image/')) return 'image';
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') || /^data:video\//i.test(url || '') ? 'video' : 'image';
}

function encodeGalleryItem(item) {
    const mediaUrl = item.image_url || item.imageData || item.imageUrl || '';
    return encodeURIComponent(JSON.stringify({
        title: item.title || '',
        description: item.description || '',
        media_url: mediaUrl,
        media_type: item.media_type || getGalleryMediaType(mediaUrl)
    }));
}

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
function loadLandingPageContent() {
    loadPublicSiteSettings();
    loadLeadershipContent();
    loadGalleryContent();
    loadPublicActivitiesPreview();
}

function setTextById(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
}

function whatsappLabel(url, fallbackPhone = '') {
    const phone = String(fallbackPhone || '').trim();
    if (phone) return phone;
    const match = String(url || '').match(/(?:phone=|wa\.me\/)(\d+)/i);
    return match ? `+${match[1]}` : 'WhatsApp';
}

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

function applyPublicSiteSettings(settings = {}) {
    const merged = { ...getLocalSiteSettings(), ...settings };
    setTextById('publicContactLocation', merged.contact_location);
    setTextById('publicContactPhone', merged.contact_phone);
    setTextById('publicContactEmail', merged.contact_email);
    setTextById('publicContactHours', merged.contact_hours);

    const whatsapp = document.getElementById('publicContactWhatsapp');
    if (whatsapp) {
        whatsapp.href = merged.social_whatsapp || '#contact';
        whatsapp.textContent = whatsappLabel(merged.social_whatsapp, merged.contact_phone);
        whatsapp.closest('.contact-item')?.classList.toggle('d-none', !merged.social_whatsapp);
    }
    renderPublicSocialLinks(merged);
}

function loadPublicSiteSettings() {
    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getSiteSettings'))
        : fetch('api.php?action=getSiteSettings').then(response => parseJsonResponse(response));

    return request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load site settings');
            writeLocalSiteSettings(result.data || {});
            applyPublicSiteSettings(result.data || {});
        })
        .catch(() => applyPublicSiteSettings(getLocalSiteSettings()));
}

function loadLeadershipContent() {
    const leadershipContainer = document.getElementById('leadershipContainer');
    if (!leadershipContainer) return;

    const leadershipRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getLeaders'))
        : fetch('admin_api.php?action=getLeaders').then(response => parseJsonResponse(response));

    leadershipRequest
    .then(result => {
        let leaders = result.data || [];

        // Fallback to localStorage if no database results
        if (leaders.length === 0) {
            leaders = JSON.parse(localStorage.getItem('publicLeaders')) || [];
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
    .catch(error => {
        console.log('Dynamic content unavailable, using local data:', error);
        // Fallback to localStorage
        const publicLeaders = JSON.parse(localStorage.getItem('publicLeaders')) || [];

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

function loadGalleryContent() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_api.php?action=getGallery').then(response => parseJsonResponse(response));

    galleryRequest
    .then(result => {
        let galleryItems = result.data || [];

        // Fallback to localStorage if no database results
        if (galleryItems.length === 0) {
            galleryItems = JSON.parse(localStorage.getItem('galleryItems')) || [];
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
    .catch(error => {
        console.log('Dynamic content unavailable, using local data:', error);
        // Fallback to localStorage
        const galleryItems = JSON.parse(localStorage.getItem('galleryItems')) || [];

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
function showPublicLeadershipModal() {
    loadPublicLeadershipList();
    const modal = new bootstrap.Modal(document.getElementById('publicLeadershipModal'));
    modal.show();
}

function showAddPublicLeaderModal() {
    // Clear form
    document.getElementById('addPublicLeaderForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('addPublicLeaderModal'));
    modal.show();
}

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

    let publicLeaders = JSON.parse(localStorage.getItem('publicLeaders')) || [];

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

function loadPublicLeadershipList() {
    const container = document.getElementById('publicLeadershipList');
    const publicLeaders = JSON.parse(localStorage.getItem('publicLeaders')) || [];

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

function deletePublicLeader(id) {
    if (!confirm('Are you sure you want to delete this leader?')) return;

    let publicLeaders = JSON.parse(localStorage.getItem('publicLeaders')) || [];
    publicLeaders = publicLeaders.filter(leader => leader.id !== id);
    localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
    loadPublicLeadershipList();
    loadLeadershipContent(); // Refresh landing page
    showNotification('Leader deleted successfully!', 'success');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
    loadHostingCapabilities();
    attachWelfareSyncListeners();
    loadLandingPageContent(); // Load dynamic content for landing page
});

function attachWelfareSyncListeners() {
    window.addEventListener('storage', function(event) {
        if (event.key === 'welfareRequests') {
            welfareRequests = JSON.parse(localStorage.getItem('welfareRequests')) || [];
            updateWelfareRequestsList();
            updateDashboardStats();
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
function initializeApp() {
    // Load stored data before rendering any logged-in dashboard view.
    registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || [];
    welfareRequests = JSON.parse(localStorage.getItem('welfareRequests')) || [];
    donations = JSON.parse(localStorage.getItem('donations')) || [];
    payments = JSON.parse(localStorage.getItem('payments')) || [];
    leadershipRoles = JSON.parse(localStorage.getItem('leadershipRoles')) || [];
    allMembers = JSON.parse(localStorage.getItem('allMembers')) || [];
    allEvents = JSON.parse(localStorage.getItem('allEvents')) || [];
    clearCachedStudentAccountsOnce();

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        currentRole = localStorage.getItem('currentRole');
        showDashboard();
    }
}

function clearCachedStudentAccountsOnce() {
    if (localStorage.getItem('localStudentClearVersion') === localStudentClearVersion) {
        return;
    }

    allMembers = allMembers.filter(member => (member.role || 'student') !== 'student');
    localStorage.setItem('allMembers', JSON.stringify(allMembers));

    const cachedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (cachedUser && (cachedUser.role || 'student') === 'student') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        currentUser = null;
        currentRole = null;
    }

    localStorage.setItem('localStudentClearVersion', localStudentClearVersion);
}

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
    document.getElementById('loginUsername')?.addEventListener('blur', populateLoginRoleFromUsername);
    document.getElementById('school')?.addEventListener('change', () => renderCourseOptions('course', document.getElementById('school').value));
    document.getElementById('editSchool')?.addEventListener('change', () => renderCourseOptions('editCourse', document.getElementById('editSchool').value));
    document.getElementById('yearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('yearOfStudy', 'semester'));
    document.getElementById('editYearOfStudy')?.addEventListener('change', () => updateSemesterAvailability('editYearOfStudy', 'editSemester'));
    document.getElementById('regPassword')?.addEventListener('input', updatePasswordStrengthMeter);
    updateSemesterAvailability('yearOfStudy', 'semester');
    updatePasswordStrengthMeter();
}

function loadHostingCapabilities() {
    if (frontendOnly) {
        hostingCapabilities = { mpesa_stk_available: false };
        refreshPaymentMethodAvailability();
        return Promise.resolve(hostingCapabilities);
    }

    return fetch('api.php?action=hostingCheck')
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

function canUseMpesaStk() {
    return !frontendOnly && hostingCapabilities && hostingCapabilities.mpesa_stk_available === true;
}

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

function getGalleryUploadLimitKey(file) {
    return file?.type?.startsWith('video/') ? 'galleryVideo' : 'galleryImage';
}

function handlePassportPhotoFileChange(event) {
    const file = event.target.files?.[0];
    if (file && !validateUploadFile(file, 'profilePhoto')) {
        event.target.value = '';
    }
}

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

function renderSchoolOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Select School</option>' +
        schoolOptions.map(school => `<option value="${escapeHtml(school)}">${escapeHtml(school)}</option>`).join('');
}

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

function renderNumberOptions(selectId, values, placeholder, label) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>` +
        values.map(value => `<option value="${value}">${label} ${value}</option>`).join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function authPayload(extra = {}) {
    return {
        ...extra,
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    };
}

function authQuery() {
    const params = new URLSearchParams({
        actor_user_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0,
        actor_role: currentRole || currentUser?.role || 'student'
    });
    return params.toString();
}

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

function getPasswordStrength(password = '') {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/i.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    if (password.length >= 12) score += 10;
    return Math.min(score, 100);
}

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
            : 'Use 8+ characters with letters, numbers, and a symbol.';
}

function populateLoginRoleFromUsername() {
    const username = document.getElementById('loginUsername').value.trim();
    const user = getRegisteredUser(username);
    const roleSelect = document.getElementById('userRole');
    if (user && roleSelect) {
        roleSelect.value = user.role;
    }
}

// AUTHENTICATION
function getRegisteredUser(identifier) {
    return allMembers.find(member =>
        member.studentId === identifier ||
        member.email === identifier ||
        member.username === identifier
    );
}

function isUniqueRegistrationRole(role) {
    return !['student', 'admin'].includes(String(role || 'student').toLowerCase());
}

function getExistingRoleHolder(role) {
    if (!isUniqueRegistrationRole(role)) return null;
    return allMembers.find(member =>
        String(member.role || '').toLowerCase() === String(role || '').toLowerCase() &&
        !['rejected', 'suspended'].includes(String(member.status || '').toLowerCase())
    );
}

function handleLogin(e) {
    e.preventDefault();

    const now = Date.now();
    if (loginLockedUntil > now) {
        const secondsLeft = Math.ceil((loginLockedUntil - now) / 1000);
        alert(`Too many failed login attempts. Please wait ${secondsLeft} seconds before trying again.`);
        return;
    }

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please fill in all fields.');
        return;
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

    if (user.password !== password) {
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

function loginWithServerSession(username, password) {
    fetch('api.php?action=loginUser', {
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

        return fetch(`api.php?action=getStudentByIdentifier&identifier=${encodeURIComponent(username)}`, {
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
    })
    .catch(error => {
        recordFailedLoginAttempt(error.message || 'Login failed.');
    });
}

function recordFailedLoginAttempt(message) {
    loginFailedAttempts += 1;

    if (loginFailedAttempts >= 3) {
        loginLockedUntil = Date.now() + 10000;
        loginFailedAttempts = 0;
        alert(`${message}\nToo many failed attempts. Please wait 10 seconds before trying again.`);
        updateLoginLockoutButton();
        return;
    }

    alert(`${message}\nAttempt ${loginFailedAttempts} of 3.`);
}

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

function handleRegistration(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value.trim();
    const role = 'student';

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    if (getPasswordStrength(password) < 50) {
        alert('Please use a stronger password with letters, numbers, and a symbol.');
        return;
    }

    if (getRegisteredUser(studentId) || getRegisteredUser(email)) {
        alert('A user with this Student ID or email is already registered.');
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
        password: password,
        role: role,
        school: document.getElementById('school').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        semester: document.getElementById('semester').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
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

function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function continueRegistration(newUser, fullName, password) {
    if (!frontendOnly) {
        saveRegistrationToDatabase(newUser, fullName, password)
            .then(savedUser => completeLocalRegistration(savedUser))
            .catch(error => {
                console.error('Registration database error:', error);
                alert(error.message || 'Registration failed. Please check your details and try again.');
            });
        return;
    }

    completeLocalRegistration(newUser);
}

function completeLocalRegistration(newUser, options = {}) {
    const needsApproval = (newUser.role || 'student') !== 'student';
    const { passportPhotoFile, ...storableUser } = { ...newUser, status: newUser.status || (needsApproval ? 'Pending' : 'Active') };
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

    if (options.databaseSynced === false) {
        showNotification(options.message, 'warning');
    }

    alert(needsApproval
        ? 'Registration submitted. Admin must approve this role before login.'
        : 'Registration successful! You can login now.');
    document.getElementById('registrationForm').reset();
    document.querySelector('[data-bs-target="#loginTab"]').click();
}

function saveRegistrationToDatabase(newUser, fullName, password) {
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '-';

    return fetch('api.php?action=registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: newUser.studentId,
            email: newUser.email,
            password: password,
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

        return fetch('api.php?action=registerStudent', {
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

function handleForgotPassword(e) {
    e.preventDefault();
    sendResetLink();
}

function showForgotPassword() {
    resetForgotPasswordModal();
    const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    modal.show();
}

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

function showResetCodeStep(email, result) {
    resetPasswordEmail = email;
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Set New Password';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    if (resendButton) resendButton.classList.remove('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    if (help) {
        const devCode = result?.data?.dev_code ? ` Local test code: ${result.data.dev_code}` : '';
        help.textContent = `Code sent to ${email}. It expires in 15 minutes.${devCode}`;
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleBtn = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function sendResetLink() {
    if (resetPasswordEmail) {
        submitPasswordResetWithCode();
        return;
    }

    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) {
        showNotification('Please enter your email address.', 'warning');
        return;
    }

    fetch('api.php?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not record reset request');
        }
        showNotification(result.data?.mail_sent ? 'Verification code sent to your email.' : 'Code created. If email is not delivered, contact admin to check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not send reset code', 'danger'));
}

function resendResetCode() {
    const email = resetPasswordEmail || document.getElementById('forgotEmail')?.value.trim();
    if (!email) {
        showNotification('Enter your registered email first.', 'warning');
        return;
    }

    fetch('api.php?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not resend reset code');
        }
        document.getElementById('forgotCode').value = '';
        showNotification(result.data?.mail_sent ? 'New verification code sent.' : 'New code created. If email is not delivered, check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not resend reset code', 'danger'));
}

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

    fetch('api.php?action=resetPasswordWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: resetPasswordEmail,
            code,
            password
        })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
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
function showDashboard() {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userNameDisplay').textContent = currentUser.name || currentUser.username;

    configureRoleMenus();
    switchView('dashboard');
    setTimeout(() => {
        loadDashboardData();
        initializeCharts();
    }, 500);
}

// VIEW SWITCHING
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
    if (activeEvent && activeEvent.target) {
        activeEvent.target.classList.add('active');
    }

    loadViewData(viewName);
}

function getViewPermission(viewName) {
    const viewPermissions = {
        profile: 'view_profile',
        membershipStatus: 'view_membership',
        prayer: 'view_prayer_times',
        events: 'register_events',
        activities: 'view_announcements',
        announcements: 'view_announcements',
        resources: 'view_resources',
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
function loadActivitiesData() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(() => {
        const managerPanel = document.getElementById('activityManagerPanel');
        managerPanel?.classList.toggle('d-none', !hasPermission('manage_activities'));
        renderActivityGroup('daily', 'dailyActivitiesList');
        renderActivityGroup('weekly', 'weeklyActivitiesList');
        renderActivityGroup('monthly', 'monthlyActivitiesList');
    });
}

function loadPublicActivitiesPreview() {
    Promise.allSettled([loadEventsFromApi(), loadActivitiesFromApi()]).finally(renderPublicActivitiesPreview);
}

function loadActivitiesFromApi() {
    if (frontendOnly) {
        databaseActivities = [];
        return Promise.resolve([]);
    }

    return fetch('api.php?action=getActivities', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not load activities');
            }
            databaseActivities = (result.data || []).map(normalizeDatabaseActivity);
            return databaseActivities;
        })
        .catch(error => {
            console.warn('Database activities unavailable:', error);
            databaseActivities = [];
            return [];
        });
}

function normalizeDatabaseActivity(activity) {
    return {
        id: `db-${activity.id}`,
        dbActivityId: Number(activity.id),
        source: 'database',
        title: activity.title || 'Dawaah Activity',
        period: normalizeActivityPeriod(activity.period),
        date: activity.activity_date || activity.date || '',
        time: activity.activity_time || activity.time || '',
        schedule: activity.schedule_note || activity.schedule || '',
        location: activity.location || 'Location will be announced',
        description: activity.description || 'Activity details will be shared soon.',
        createdBy: activity.created_by_name || ''
    };
}

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

function formatActivityDateTime(activity = {}) {
    const dateText = activity.date ? formatDisplayDate(activity.date) : '';
    const timeText = activity.time ? formatDisplayTime(activity.time) : '';
    const dateTimeText = [dateText, timeText].filter(Boolean).join(' at ');
    return dateTimeText || activity.schedule || 'Schedule will be announced';
}

function formatDisplayDate(value) {
    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

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

function getActivityPeriodIcon(period) {
    if (period === 'daily') return 'fa-sun';
    if (period === 'weekly') return 'fa-calendar-week';
    return 'fa-calendar-days';
}

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
            <h5>${escapeHtml(activity.title || 'Dawaah Activity')}</h5>
            <p>${escapeHtml(activity.description || 'Activity details will be shared soon.')}</p>
            <div class="activity-card__meta">
                <span><i class="fas fa-location-dot"></i> ${escapeHtml(activity.location || 'Location will be announced')}</span>
                ${scheduleNote ? `<span><i class="fas fa-clock"></i> ${escapeHtml(scheduleNote)}</span>` : ''}
                ${canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteActivity('${escapeHtml(activity.id)}')"><i class="fas fa-trash"></i> Remove</button>` : ''}
            </div>
        </div>
    `;
}

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

function saveActivityToDatabase(activity) {
    return fetch('api.php?action=createActivity', {
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

function deleteActivity(activityId) {
    if (!hasPermission('manage_activities')) {
        showNotification('Only the Organizer can remove activities.', 'warning');
        return;
    }
    if (!confirm('Remove this activity?')) return;

    const activity = getActivities().find(item => String(item.id) === String(activityId));
    if (activity?.source === 'database' && activity.dbActivityId) {
        fetch(`api.php?action=deleteActivity&id=${encodeURIComponent(activity.dbActivityId)}`, {
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
function loadProfileData() {
    const storedProfile = JSON.parse(localStorage.getItem('profileData')) || {};
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

function getMemberPhoto(member) {
    return resolveAppAsset(member?.passportPhotoData || member?.photoData || member?.photo_url || member?.passport_photo || '');
}

function resolveAppAsset(path) {
    if (!path) return '';
    if (/^(data:|blob:|https?:)/i.test(path)) return path;
    if (location.protocol === 'file:') {
        return XAMPP_BASE_URL + String(path).replace(/^\/+/, '');
    }
    return path;
}

function renderMemberPhoto(member) {
    const photo = getMemberPhoto(member);
    if (!photo) {
        return '<i class="fas fa-user-circle fa-2x text-muted"></i>';
    }
    return `<img class="member-photo-thumb" src="${photo}" alt="${member.fullName || member.name || member.username || 'Member photo'}">`;
}

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

            return fetch('api.php?action=updateStudentProfile', {
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
function loadMembershipStatus() {
    const membershipInfo = {
        status: 'Active',
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
        joinDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString(),
        tier: 'Full Member'
    };

    const container = document.getElementById('membershipStatusDetails');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <p><strong>Status:</strong> <span class="badge bg-success">${membershipInfo.status}</span></p>
                    <p><strong>Membership Expiry:</strong> ${membershipInfo.expiryDate}</p>
                    <p><strong>Member Since:</strong> ${membershipInfo.joinDate}</p>
                    <p><strong>Tier:</strong> ${membershipInfo.tier}</p>
                    <button class="btn btn-primary mt-3" onclick="renewMembership()">Renew Membership</button>
                </div>
            </div>
        `;
    }
}

function renewMembership() {
    alert('Membership renewal processed. Thank you!');
    document.getElementById('membershipStatusValue').textContent = 'Active';
}

// PRAYER TIMES
function loadPrayerTimes() {
    const container = document.getElementById('prayerTimesDetails');
    loadReligiousActivities();
    if (!container) return;

    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_api.php?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));

    prayerRequest
    .then(result => {
        const data = result.data || {};
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

function getReligiousActivities() {
    return JSON.parse(localStorage.getItem('adminReligiousActivities')) || {
        jummah: [],
        ramadan: [],
        lectures: []
    };
}

function loadReligiousActivities() {
    const data = getReligiousActivities();
    renderJummahReminders(data.jummah || []);
    renderRamadanSchedule(data.ramadan || []);
    renderIslamicLectures(data.lectures || []);
}

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

function getAvailableEvents() {
    return [...allEvents, ...readList('adminEvents')].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}

function mergeEvents(events) {
    allEvents = [...allEvents, ...events].filter((event, index, list) => {
        const key = event.id || event.eventId || event.title || event.name;
        return index === list.findIndex(item => (item.id || item.eventId || item.title || item.name) === key);
    });
}

function loadEventsFromApi() {
    const eventsRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getEvents'))
        : fetch('admin_api.php?action=getEvents&limit=100').then(response => parseJsonResponse(response));

    return eventsRequest
        .then(result => {
            if (result.success && Array.isArray(result.data)) {
                mergeEvents(result.data);
            }
            return allEvents;
        })
        .catch(error => {
            console.log('Event API unavailable, using local data:', error);
            return allEvents;
        });
}

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

function showEventModal() {
    populateEventSelect();
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

function registerEvent(eventId) {
    document.getElementById('eventSelect').value = eventId;
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

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
        .then(studentId => fetch('api.php?action=registerEvent', {
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

function saveEventRegistrationLocally(registration) {
    registeredEvents.push(registration);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));

    showNotification('Event registration successful! ' + registration.eventName, 'success');

    document.getElementById('eventForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
    updateRegisteredEventsList();
}

function cancelEventRegistration(eventId) {
    registeredEvents = registeredEvents.filter(e => e.eventId !== eventId);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    updateRegisteredEventsList();
    showNotification('Event registration cancelled.', 'info');
}

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

function showCreateEventModal() {
    const modal = new bootstrap.Modal(document.getElementById('createEventModal'));
    modal.show();
}

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
        fetch('admin_api.php?action=createEvent', {
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

function viewEventDetails(eventName) {
    const event = allEvents.find(item => item.name === eventName || item.title === eventName);
    const details = event
        ? `${event.name || event.title}\nDate: ${event.date || event.event_date || 'Not set'}\nLocation: ${event.location || 'Not set'}\n${event.description || ''}`
        : 'Event details for: ' + eventName;
    alert(details);
}

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
function loadAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    document.getElementById('announcementManagerPanel')?.classList.toggle('d-none', !hasPermission('create_announcements'));

    const announcementRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAnnouncements'))
        : fetch('admin_api.php?action=getAnnouncements').then(response => parseJsonResponse(response));

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
    .catch(error => {
        console.log('Announcement API unavailable, using local data:', error);
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
        fetch('api.php?action=createAnnouncement', {
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
function loadResources() {
    const container = document.getElementById('resourcesGrid');
    if (!container) return;

    const resourceRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getResources'))
        : fetch('admin_api.php?action=getResources').then(response => parseJsonResponse(response));

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

function getResourceIcon(type) {
    if (type === 'video') return 'video';
    if (type === 'download') return 'download';
    if (type === 'article') return 'newspaper';
    return 'link';
}

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

function resolveAppUrl(url) {
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|data:|blob:)/i.test(url)) return url;
    const cleanUrl = url.replace(/^\/+/, '');
    if (location.protocol === 'file:') {
        return XAMPP_BASE_URL + cleanUrl;
    }
    return cleanUrl;
}

// WELFARE
function loadWelfareData() {
    updateWelfareRequestsList();
    syncWelfareRequestsFromAdmin();
}

function showWelfareModal() {
    const modal = new bootstrap.Modal(document.getElementById('welfareModal'));
    modal.show();
}

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
        .then(studentId => fetch('api.php?action=createWelfareRequest', {
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

function saveWelfareRequestLocally(request) {
    const existingIndex = welfareRequests.findIndex(item => Number(item.id) === Number(request.id));
    if (existingIndex >= 0) {
        welfareRequests[existingIndex] = { ...welfareRequests[existingIndex], ...request };
    } else {
        welfareRequests.push(request);
    }
    localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
    alert('Welfare request submitted successfully!');

    document.getElementById('welfareForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('welfareModal')).hide();
    updateWelfareRequestsList();
    updateDashboardStats();
}

function updateWelfareRequestsList() {
    const tbody = document.getElementById('welfareRequestsTableBody');
    if (!tbody) return;

    welfareRequests = JSON.parse(localStorage.getItem('welfareRequests')) || [];
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

function formatWelfareStatus(status) {
    const normalized = String(status || 'Pending Review').toLowerCase();
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'completed') return 'Completed';
    return 'Pending Review';
}

function getWelfareStatusColor(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'success';
    if (normalized === 'rejected') return 'danger';
    return 'warning text-dark';
}

function getWelfareStatusIcon(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'fa-circle-check';
    if (normalized === 'rejected') return 'fa-circle-xmark';
    return 'fa-clock';
}

function formatWelfareAmount(amount) {
    if (amount === undefined || amount === null || amount === '' || amount === 'Not specified') {
        return 'Not specified';
    }
    return '$' + Number(amount).toLocaleString();
}

function getCurrentWelfareUserKey() {
    return currentUser?.username || currentUser?.studentId || currentUser?.email || currentUser?.fullName || currentUser?.name || '';
}

function syncWelfareRequestsFromAdmin() {
    if (!currentUser || frontendOnly) return Promise.resolve();

    return fetch('admin_api.php?action=getWelfareRequests')
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const userKey = getCurrentWelfareUserKey();
            const userName = currentUser.fullName || currentUser.name || currentUser.username || '';
            const current = JSON.parse(localStorage.getItem('welfareRequests')) || [];
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

function approveWelfare() {
    alert('Welfare request approved!');
}

function rejectWelfare() {
    if (confirm('Are you sure you want to reject this welfare request?')) {
        alert('Welfare request rejected.');
    }
}

// DUES & PAYMENTS
function loadDuesData() {
    const duesInfo = {
        amount: '$50',
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
                    <small class="text-muted">Amount: $${payment.amount} | Paid: ${payment.date} | ${payment.paymentMethod || 'Method not specified'}</small>
                </div>
            `).join('<hr>');
        }
    }

    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <table class="table table-borderless">
                <tr>
                    <td><strong>Total Due:</strong></td>
                    <td>${completedPayments.length ? '$0' : 'Not paid yet'}</td>
                </tr>
                <tr>
                    <td><strong>Total Paid:</strong></td>
                    <td>$${totalPaid.toFixed(2)}</td>
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

function formatPaymentType(type) {
    const labels = {
        membershipDues: 'Membership Dues',
        activityFee: 'Activity Fee',
        specialEvents: 'Special Events Fee',
        other: 'Other Payment'
    };
    return labels[type] || type || 'Payment';
}

function toDisplayStatus(status) {
    const normalized = String(status || '').toLowerCase();
    const labels = {
        pending: 'Pending Approval',
        completed: 'Completed',
        failed: 'Failed',
        rejected: 'Rejected',
        late: 'Late',
        waived: 'Waived'
    };
    return labels[normalized] || status || 'Pending Approval';
}

function statusBadgeClass(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'completed') return 'bg-success';
    if (['failed', 'rejected', 'late'].includes(normalized)) return 'bg-danger';
    if (normalized === 'waived') return 'bg-secondary';
    return 'bg-warning text-dark';
}

function normalizedDisplayStatus(status) {
    return String(status || '').toLowerCase();
}

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
        record.amount,
        record.status
    ].join(' ').toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
}

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

function renderMpesaReadinessPanel() {
    const panel = document.getElementById('mpesaReadinessPanel');
    if (!panel) return;
    const ready = canUseMpesaStk();
    panel.innerHTML = `
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div>
                    <h6 class="mb-1">M-Pesa STK Status</h6>
                    <small class="text-muted">${ready ? 'Live STK Push is available for member payments.' : 'STK Push is not configured here. Manual payment methods remain available.'}</small>
                </div>
                <span class="badge ${ready ? 'bg-success' : 'bg-warning text-dark'}">${ready ? 'Configured' : 'Manual mode'}</span>
            </div>
        </div>
    `;
}

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

function syncTreasurerPaymentRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`api.php?action=getPaymentRecords&${authQuery()}`)
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
                    notes: row.notes || '',
                    approvedBy: row.approved_by || ''
                };
            });
            payments = mergeByDatabaseId(payments, remotePayments, 'dbPaymentId');
            localStorage.setItem('payments', JSON.stringify(payments));
            renderPaymentStatusSummary();
            renderPaymentHistory();
        })
        .catch(error => console.error('Payment records sync error:', error));
}

function showPaymentModal() {
    updatePaymentInstructions('payment');
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function normalizeMpesaPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
    return digits;
}

function updatePaymentInstructions(context) {
    const selectId = context === 'donation' ? 'donationPaymentMethod' : 'paymentMethod';
    const boxId = context === 'donation' ? 'donationPaymentInstructions' : 'paymentInstructions';
    const select = document.getElementById(selectId);
    const box = document.getElementById(boxId);
    if (!select || !box) return;

    const phoneGroupId = context === 'donation' ? 'donationMpesaPhoneGroup' : 'paymentMpesaPhoneGroup';
    const phoneGroup = document.getElementById(phoneGroupId);
    if (phoneGroup) {
        phoneGroup.classList.toggle('d-none', select.value !== 'mpesaStk' || !canUseMpesaStk());
    }

    if (select.value === 'mpesaStk' && !canUseMpesaStk()) {
        box.innerHTML = '<strong>M-Pesa STK Push is not available on this server yet.</strong><br>Use Bank Transfer, Normal Transfer, or Cash Payment and the Treasurer can confirm it from the admin panel.';
        box.classList.remove('d-none');
        return;
    }

    const account = paymentAccounts[select.value];
    if (!account) {
        box.classList.add('d-none');
        box.innerHTML = '';
        return;
    }

    const note = select.value === 'mpesaStk'
        ? 'Receipt is generated only after Safaricom confirms the M-Pesa payment.'
        : 'Click Send after entering the amount. A receipt will be generated immediately.';
    box.innerHTML = `${account.html}<hr class="my-2"><strong>Important:</strong> ${note}`;
    box.classList.remove('d-none');
}

function processPayment() {
    const paymentType = document.getElementById('paymentType').value;
    const amount = document.getElementById('paymentAmount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!paymentType || !amount || !paymentMethod) {
        alert('Please fill in all payment details');
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

    const receiptNumber = 'RCP' + Date.now();
    const payment = {
        type: paymentType,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'Pending Approval',
        paymentMethod: paymentAccounts[paymentMethod].label,
        transactionRef: receiptNumber,
        receiptNumber: receiptNumber
    };
    if (!frontendOnly) {
        getCurrentStudentId()
        .then(studentId => fetch('api.php?action=recordPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                payment_type: paymentType,
                amount: amount,
                due_date: new Date().toISOString().slice(0, 10),
                payment_method: payment.paymentMethod,
                transaction_id: receiptNumber,
                notes: 'Payment submitted by member and awaiting treasurer confirmation.',
                status: 'pending'
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save payment to database');
            }
            payment.dbPaymentId = result.data.payment_id;
            savePaymentLocally(payment);
        })
        .catch(error => {
            console.error('Payment database error:', error);
            alert(error.message || 'Payment could not be saved to the database.');
        });
        return;
    }

    savePaymentLocally(payment);
}

function startMpesaPayment(details) {
    const phone = normalizeMpesaPhone(details.phone);
    if (!phone || phone.length !== 12 || !phone.startsWith('254')) {
        alert('Please enter a valid M-Pesa phone number, for example 254712345678.');
        return;
    }

    if (frontendOnly) {
        alert('M-Pesa STK Push needs the PHP backend, so it is not available on the GitHub Pages demo. Please use Bank Transfer, Normal Transfer, or Cash on the live demo.');
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
        payload.purpose = "Dawa'ah donation";
        payload.donor_id = currentUser?.dbUserId || 0;
        payload.donor_name = details.anonymous ? 'Anonymous' : (currentUser?.name || currentUser?.fullName || currentUser?.username || 'Donor');
        payload.donor_email = currentUser?.email || 'anonymous@dawaah.local';
    }

    const ready = details.source === 'payment'
        ? getCurrentStudentId().then(studentId => ({ ...payload, student_id: studentId }))
        : Promise.resolve(payload);

    ready
        .then(body => fetch('mpesa_api.php?action=initiateStkPush', {
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
                localRecord.purpose = "Dawa'ah donation";
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

function pollMpesaStatus(checkoutRequestId, source, attempts = 0) {
    if (attempts > 20) {
        alert('M-Pesa confirmation is taking longer than expected. Check the admin panel or refresh later.');
        return;
    }

    setTimeout(() => {
        fetch(`mpesa_api.php?action=getTransactionStatus&checkout_request_id=${encodeURIComponent(checkoutRequestId)}`)
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

function markLocalMpesaCompleted(checkoutRequestId, source, receiptNumber) {
    const updateRecord = record => record.checkoutRequestId === checkoutRequestId
        ? { ...record, status: 'Completed', receiptNumber: receiptNumber || ('MPESA-' + Date.now()), transactionRef: receiptNumber || checkoutRequestId }
        : record;

    if (source === 'payment') {
        payments = payments.map(updateRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        renderPaymentStatusSummary();
        renderPaymentHistory();
    } else {
        donations = donations.map(updateRecord);
        localStorage.setItem('donations', JSON.stringify(donations));
        renderDonationHistory();
    }
}

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

function savePaymentLocally(payment) {
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    alert('Payment submitted. The treasurer must confirm it before a receipt is available.');

    document.getElementById('paymentForm').reset();
    updatePaymentInstructions('payment');
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    renderPaymentStatusSummary();
    renderPaymentHistory();
}

function getCurrentStudentId() {
    if (currentUser?.dbStudentId) {
        return Promise.resolve(currentUser.dbStudentId);
    }

    const identifier = currentUser?.studentId || currentUser?.email || currentUser?.username;
    if (!identifier) {
        return Promise.reject(new Error('Student record is missing. Please register/login again.'));
    }

    return fetch(`api.php?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`)
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

function ensureCurrentUserStudentRecord() {
    return fetch('api.php?action=ensureStudentRecord', {
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

function renderPaymentHistory() {
    const tbody = document.getElementById('paymentHistoryList');
    if (!tbody) return;

    const controls = document.getElementById('paymentReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && payments.length < 2);
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
            <td>$${payment.amount}</td>
            <td>${payment.paymentMethod || 'Not specified'}${payment.transactionRef ? `<br><small class="text-muted">${escapeHtml(payment.transactionRef)}</small>` : ''}</td>
            <td><span class="badge ${statusBadgeClass(payment.status)}">${payment.status}</span></td>
            <td>${renderPaymentActions(payment, payment.originalIndex)}</td>
        </tr>
    `).join('');
}

function renderPaymentActions(payment, index) {
    if (payment.status === 'Completed') {
        return `<button class="btn btn-sm btn-outline-primary" onclick="downloadReceipt(${index})">Download</button>`;
    }
    if (['Failed', 'Rejected', 'Late', 'Waived'].includes(payment.status)) {
        return `<span class="text-muted">${payment.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <button class="btn btn-sm btn-success" onclick="confirmPayment(${index})">Confirm</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="waivePayment(${index})">Waive</button>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}

function confirmPayment(index) {
    updateLocalPaymentStatus(index, 'Completed', 'completed');
}

function waivePayment(index) {
    updateLocalPaymentStatus(index, 'Waived', 'waived');
}

function updateLocalPaymentStatus(index, displayStatus, dbStatus) {
    const payment = payments[index];
    if (!payment) return;
    payments[index] = {
        ...payment,
        status: displayStatus,
        receiptNumber: displayStatus === 'Completed' ? (payment.receiptNumber || ('RCP' + Date.now())) : payment.receiptNumber
    };
    localStorage.setItem('payments', JSON.stringify(payments));
    renderPaymentHistory();
    renderPaymentStatusSummary();

    if (!frontendOnly && payment.dbPaymentId) {
        fetch('api.php?action=updatePaymentStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authPayload({
                payment_id: payment.dbPaymentId,
                status: dbStatus,
                transaction_id: payments[index].receiptNumber,
                notes: `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`
            }))
        }).catch(error => console.error('Payment status update error:', error));
    }
    showNotification(`Payment ${displayStatus.toLowerCase()}.`, 'success');
}

function openOfficialReceipt(details) {
    const receiptNumber = details.receiptNumber || details.transactionRef || 'receipt';
    const approvedBy = details.approvedBy || (details.status === 'Completed' ? (currentUser?.fullName || currentUser?.username || 'Treasurer') : 'Pending');
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(receiptNumber)} Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f7f6ef; color: #111827; }
        .receipt { max-width: 760px; margin: 28px auto; background: #fff; border: 1px solid #d6b25e; padding: 32px; }
        .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #d6b25e; padding-bottom: 18px; }
        h1 { margin: 0; font-size: 24px; letter-spacing: 0; }
        .brand { color: #14532d; font-weight: 700; margin-top: 6px; }
        .badge { display: inline-block; background: #14532d; color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
        td:first-child { color: #6b7280; width: 34%; }
        .amount { font-size: 28px; font-weight: 700; color: #14532d; }
        .actions { max-width: 760px; margin: 18px auto; display: flex; gap: 10px; justify-content: flex-end; }
        button, a { border: 0; background: #111827; color: #fff; padding: 10px 14px; border-radius: 4px; text-decoration: none; cursor: pointer; }
        @media print { .actions { display: none; } body { background: #fff; } .receipt { margin: 0; border: 0; } }
    </style>
</head>
<body>
    <div class="actions"><button onclick="window.print()">Print</button><a id="downloadReceipt" download="${escapeHtml(receiptNumber)}.html">Download HTML</a></div>
    <main class="receipt">
        <div class="top">
            <div>
                <h1>Official ${escapeHtml(details.kind)} Receipt</h1>
                <div class="brand">UMMA University Dawa'ah</div>
            </div>
            <div><span class="badge">${escapeHtml(details.status || 'Completed')}</span></div>
        </div>
        <table>
            <tr><td>Receipt Number</td><td>${escapeHtml(receiptNumber)}</td></tr>
            <tr><td>Name</td><td>${escapeHtml(details.name || 'Member')}</td></tr>
            <tr><td>Type</td><td>${escapeHtml(details.type || details.kind)}</td></tr>
            <tr><td>Amount</td><td class="amount">$${escapeHtml(details.amount || '0')}</td></tr>
            <tr><td>Payment Method</td><td>${escapeHtml(details.method || 'Not specified')}</td></tr>
            <tr><td>Transaction Reference</td><td>${escapeHtml(details.transactionRef || 'Not recorded')}</td></tr>
            <tr><td>Approved By</td><td>${escapeHtml(approvedBy)}</td></tr>
            <tr><td>Date</td><td>${escapeHtml(details.date || new Date().toLocaleDateString())}</td></tr>
        </table>
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
        approvedBy: payment.approvedBy
    });
}

// DONATIONS
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

function syncTreasurerDonationRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`api.php?action=getDonationRecords&${authQuery()}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const remoteDonations = result.data.map(row => ({
                dbDonationId: Number(row.id),
                type: row.donation_type || 'Donation',
                purpose: row.purpose || "Dawa'ah donation",
                amount: row.amount,
                date: row.created_at ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString() : 'Recently',
                paymentMethod: row.payment_method || 'Not specified',
                transactionRef: row.transaction_id || '',
                status: toDisplayStatus(row.status),
                anonymous: false,
                donor: row.donor_name || row.donor_email || 'Donor',
                receiptNumber: row.receipt_number || row.transaction_id || '',
                approvedBy: row.approved_by || ''
            }));
            donations = mergeByDatabaseId(donations, remoteDonations, 'dbDonationId');
            localStorage.setItem('donations', JSON.stringify(donations));
            renderDonationHistory();
        })
        .catch(error => console.error('Donation records sync error:', error));
}

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
}

function showDonationModal(donationType) {
    document.getElementById('donationModalTitle').textContent = 'Make ' + donationType + ' Donation';
    updatePaymentInstructions('donation');
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}

function submitDonation() {
    const amount = document.getElementById('donationAmount').value;
    const paymentMethod = document.getElementById('donationPaymentMethod').value;
    const isAnonymous = document.getElementById('anonymousDonation').checked;

    if (!amount || !paymentMethod) {
        alert('Please enter the donation amount and payment method');
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

    const receiptNumber = 'DRT' + Date.now();
    const donation = {
        type: document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
        purpose: "Dawa'ah donation",
        amount: amount,
        date: new Date().toLocaleDateString(),
        paymentMethod: paymentAccounts[paymentMethod].label,
        transactionRef: receiptNumber,
        status: 'Pending Approval',
        anonymous: isAnonymous,
        donor: isAnonymous ? 'Anonymous' : (currentUser.name || currentUser.fullName || currentUser.username),
        receiptNumber: receiptNumber
    };

    if (!frontendOnly) {
        fetch('api.php?action=recordDonation', {
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
                transaction_id: receiptNumber,
                status: 'pending'
            })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save donation to database');
            }
            donation.dbDonationId = result.data.donation_id;
            saveDonationLocally(donation);
        })
        .catch(error => {
            console.error('Donation database error:', error);
            alert(error.message || 'Donation could not be saved to the database.');
        });
        return;
    }

    saveDonationLocally(donation);
}

function saveDonationLocally(donation) {
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    alert('Donation submitted. The treasurer must confirm it before a receipt is available.');

    document.getElementById('donationForm').reset();
    updatePaymentInstructions('donation');
    bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
    renderDonationHistory();
}

function renderDonationHistory() {
    const tbody = document.getElementById('donationHistoryList');
    if (!tbody) return;

    const controls = document.getElementById('donationReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && donations.length < 2);
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
            <td>$${donation.amount}</td>
            <td>${donation.purpose || "Dawa'ah donation"}</td>
            <td>${donation.paymentMethod || 'Not specified'}${donation.transactionRef ? `<br><small class="text-muted">${escapeHtml(donation.transactionRef)}</small>` : ''}</td>
            <td><span class="badge ${statusBadgeClass(donation.status)}">${donation.status || 'Pending Approval'}</span></td>
            <td>${renderDonationActions(donation, donation.originalIndex)}</td>
        </tr>
    `).join('');
}

function renderDonationActions(donation, index) {
    if (donation.status === 'Completed') {
        return `<button class="btn btn-sm btn-outline-primary" onclick="downloadDonationReceipt(${index})">Download</button>`;
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

function confirmDonation(index) {
    updateLocalDonationStatus(index, 'Completed', 'completed');
}

function rejectDonation(index) {
    updateLocalDonationStatus(index, 'Rejected', 'rejected');
}

function updateLocalDonationStatus(index, displayStatus, dbStatus) {
    const donation = donations[index];
    if (!donation) return;
    donations[index] = {
        ...donation,
        status: displayStatus,
        receiptNumber: displayStatus === 'Completed' ? (donation.receiptNumber || ('DRT' + Date.now())) : donation.receiptNumber
    };
    localStorage.setItem('donations', JSON.stringify(donations));
    renderDonationHistory();

    if (!frontendOnly && donation.dbDonationId) {
        fetch('api.php?action=updateDonationStatus', {
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
        approvedBy: donation.approvedBy
    });
}

// ADMIN FUNCTIONS
function loadMemberDatabase() {
    if (!frontendOnly) {
        fetch(`api.php?action=getAllStudents&${authQuery()}`)
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

function renderMemberDatabase() {
    const tbody = document.getElementById('membersList');
    if (!tbody) return;

    if (allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No registered members yet</td></tr>';
        return;
    }

    tbody.innerHTML = allMembers.map(member => `
        <tr>
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

function formatMemberStatus(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'Active';
    if (value === 'inactive') return 'Inactive';
    return 'Pending';
}

function getMemberStatusBadgeClass(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'bg-success';
    if (value === 'inactive') return 'bg-secondary';
    return 'bg-warning text-dark';
}

function searchMembers() {
    const searchTerm = document.getElementById('memberSearchBox').value.toLowerCase();
    const tbody = document.getElementById('membersList');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

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

function renderMemberDetailItem(label, value, columnClass = 'col-md-6') {
    return `
        <div class="${columnClass} mb-3">
            <strong>${escapeHtml(label)}:</strong>
            <div>${escapeHtml(value || '-')}</div>
        </div>
    `;
}

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

function toggleMemberStatus(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    const nextStatus = String(member?.status || 'Pending').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setMemberStatus(studentId, nextStatus);
}

function setMemberStatus(studentId, nextStatus) {
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
    loadMemberDatabase();
    syncMemberStatusToDatabase(member, nextStatus);
    showNotification(`Member ${nextStatus.toLowerCase()}.`, 'success');
}

function deleteMember(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (!confirm(`Delete ${member.fullName || member.username || 'this member'}? This removes the local member record.`)) {
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

function syncMemberStatusToDatabase(member, status) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('api.php?action=updateStudentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({
            student_db_id: member.dbStudentId,
            status: status.toLowerCase()
        }))
    }).catch(error => console.error('Member status sync error:', error));
}

function syncMemberDeleteToDatabase(member) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('api.php?action=deleteStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({ student_db_id: member.dbStudentId }))
    }).catch(error => console.error('Member delete sync error:', error));
}

function loadAdminEvents() {
    loadEventsFromApi().finally(() => renderAdminEventsTable());
}

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

function showLeadershipModal() {
    const modal = new bootstrap.Modal(document.getElementById('leadershipModal'));
    modal.show();
}

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

function editLeadership(position) {
    const modal = new bootstrap.Modal(document.getElementById('leadershipModal'));
    modal.show();
}

// CHARTS
function initializeCharts() {
    // Membership Chart
    const membershipCtx = document.getElementById('membershipChart');
    if (membershipCtx && !membershipCtx.hasAttribute('data-chart-initialized')) {
        new Chart(membershipCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Pending'],
                datasets: [{
                    data: [240, 12, 4],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        membershipCtx.setAttribute('data-chart-initialized', 'true');
    }

    // Donation Chart
    const donationCtx = document.getElementById('donationChart');
    if (donationCtx && !donationCtx.hasAttribute('data-chart-initialized')) {
        new Chart(donationCtx, {
            type: 'pie',
            data: {
                labels: ['Zakat', 'Sadaqah', 'Community Fund'],
                datasets: [{
                    data: [5240, 4500, 5500],
                    backgroundColor: ['#d946a6', '#2d7a5e', '#d4af37']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        donationCtx.setAttribute('data-chart-initialized', 'true');
    }
}

// UTILITY FUNCTIONS
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (!frontendOnly) {
            fetch('api.php?action=logoutUser', {
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
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhoneNumber(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// LocalStorage Helpers
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearLocalStorage(key) {
    localStorage.removeItem(key);
}

// Notifications
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
        'chairman': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'chairlady': [
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
        'admin': adminPermissions,
        'treasurer': [
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
        'imam': [
            'view_profile',
            'view_prayer_times',
            'view_announcements',
            'view_resources',
            'manage_prayer_times',
            'manage_lectures',
            'manage_hadiths'
        ]
    };

    return rolePermissions[currentRole]?.includes(permission) || false;
}

// Export & Download
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

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${headers}\n${rows}`;
}

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
function searchItems(items, query, searchFields) {
    return items.filter(item =>
        searchFields.some(field =>
            String(item[field]).toLowerCase().includes(query.toLowerCase())
        )
    );
}

function filterByDate(items, startDate, endDate) {
    return items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

// Form Helpers
function resetForm(formId) {
    document.getElementById(formId).reset();
}

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
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal?.hide();
}

// Error Handling
function handleError(error) {
    console.error('Error:', error);
}

window.addEventListener('error', (event) => {
    handleError(event.error);
});

// Responsive Utilities
function isMobileView() {
    return window.innerWidth < 768;
}

function isTabletView() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
}

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
    document.getElementById('dashName').textContent = currentUser.name || currentUser.username;
    document.getElementById('dashStudentId').textContent = currentUser.studentId || currentUser.id || 'Not set';
    document.getElementById('dashCourse').textContent = currentUser.course || 'Not set';
    document.getElementById('dashYear').textContent = currentUser.year || 'Not set';

    // Membership Status
    document.getElementById('membershipStatusValue').textContent = formatMemberStatus(currentUser.status || 'Active');

    // Upcoming Events Count
    const upcomingCount = getAvailableEvents().length;
    document.getElementById('upcomingEventsCount').textContent = upcomingCount;

    // Dues Status
    const duesPaid = payments.filter(p => p.status === 'Completed').length > 0 ? 'Paid' : 'Pending';
    document.getElementById('duesStatusValue').textContent = duesPaid;

    // Welfare Status
    const welfareCount = welfareRequests.filter(w => w.status === 'Pending' || w.status === 'Pending Review').length;
    document.getElementById('welfareStatusValue').textContent = welfareCount || '0';
    loadDashboardPrayerTimes();
    renderRoleWorkspace();
    renderProfileCompletion();
    renderDashboardAlerts();
    renderDashboardActivityCalendar();
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

function renderRoleWorkspace() {
    const role = currentRole || currentUser?.role || 'student';
    const roleBadge = document.getElementById('dashboardRoleBadge');
    const summary = document.getElementById('dashboardRoleSummary');
    const actions = document.getElementById('roleQuickActions');
    if (!actions) return;

    const actionMap = {
        organizer: [['Activities', 'activities', 'fa-calendar-days', 'Plan daily, weekly, monthly'], ['Events', 'events', 'fa-calendar', 'Coordinate programmes'], ['Volunteer', 'volunteer', 'fa-hands-helping', 'Manage service teams']],
        treasurer: [['Dues', 'dues', 'fa-money-bill', 'Track member dues'], ['Donations', 'donations', 'fa-hand-holding-dollar', 'Confirm contributions'], ['Reports', 'reports', 'fa-chart-line', 'Review finance trends']],
        media: [['Gallery & Videos', 'adminGallery', 'fa-photo-film', 'Publish media'], ['Contact & Social', 'adminContact', 'fa-share-nodes', 'Update public links']],
        secretary: [['Members', 'memberDatabase', 'fa-users', 'Member records'], ['Announcements', 'announcements', 'fa-bullhorn', 'Post updates'], ['Reports', 'reports', 'fa-chart-pie', 'Meeting summaries']],
        imam: [['Prayer Times', 'prayer', 'fa-mosque', 'Religious schedule'], ['Hadiths', 'officerHadiths', 'fa-book-open', 'Daily reminders'], ['Resources', 'resources', 'fa-book-open-reader', 'Learning materials']],
        chairman: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        chairlady: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        executive: [['Members', 'memberDatabase', 'fa-users-cog', 'Manage members'], ['Events', 'adminEvents', 'fa-calendar-check', 'Approve programmes'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
        admin: [['Members', 'memberDatabase', 'fa-users-cog', 'Manage members'], ['Leadership', 'leadership', 'fa-user-tie', 'Public officers'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
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
}

function formatRoleName(role) {
    const labels = {
        executive: 'Sub Admin / Executive',
        chairman: 'Chairman',
        chairlady: 'Chairlady',
        secretary: 'Secretary',
        organizer: 'Organizer',
        media: 'Media',
        treasurer: 'Treasurer',
        imam: 'Imam',
        admin: 'Main Admin',
        student: 'Student Member'
    };
    return labels[role] || 'Member';
}

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

function getRoleDashboardMessage() {
    const role = currentRole || currentUser?.role || 'student';
    const messages = {
        chairman: 'Chairman workspace for welfare requests, member support, and oversight reports.',
        chairlady: 'Chairlady workspace for welfare requests, member support, and oversight reports.',
        secretary: 'Secretary workspace for member records, announcements, and general reports.',
        executive: 'Executive workspace for member management, programmes, welfare, reports, and communication.',
        admin: 'Admin workspace for full system management, reports, content, and member records.',
        treasurer: 'Treasurer workspace for dues, donations, payment confirmation, and financial reports.',
        media: 'Media workspace for gallery, videos, contact messages, and publicity.',
        organizer: 'Organizer workspace for events, activities, volunteers, and programme coordination.',
        imam: 'Imam/Leader workspace for prayer times, hadiths, Islamic resources, lectures, and religious reminders.',
        student: 'Member workspace for profile, events, welfare, dues, donations, and resources.'
    };
    return messages[role] || messages.student;
}

function loadDashboardPrayerTimes() {
    const container = document.getElementById('prayerTimesList');
    if (!container) return;
    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_api.php?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));
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
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

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
function showVolunteerModal() {
    populateVolunteerOpportunities();
    const modal = new bootstrap.Modal(document.getElementById('volunteerModal'));
    modal.show();
}

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
            .then(studentId => fetch('api.php?action=registerVolunteer', {
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
        opportunity: opportunity,
        skills: skills,
        availability: availability,
        dateSignedUp: new Date().toLocaleDateString(),
        status: 'Active'
    };

    let volunteerRecords = JSON.parse(localStorage.getItem('volunteerRecords')) || [];
    volunteerRecords.push(volunteerRecord);
    localStorage.setItem('volunteerRecords', JSON.stringify(volunteerRecords));
    logLocalRoleActivity('registerVolunteer', { opportunity, availability });

    bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
    showNotification('Successfully signed up for volunteering!', 'success');

    // Clear form
    document.getElementById('volunteerForm').reset();
    loadVolunteerData();
}

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

function loadVolunteerOpportunitiesFromApi() {
    if (frontendOnly) {
        databaseVolunteerOpportunities = [];
        return Promise.resolve([]);
    }
    return fetch('api.php?action=getVolunteerOps', { credentials: 'same-origin' })
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

function loadVolunteerRecordsFromApi() {
    if (frontendOnly || !currentUser) {
        databaseVolunteerRecords = [];
        return Promise.resolve([]);
    }
    const actor = authQuery();
    const loadRecords = studentId => fetch(`api.php?action=getVolunteerRegistrations&${actor}&student_id=${encodeURIComponent(studentId || 0)}`, { credentials: 'same-origin' });
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

function getVolunteerRecords() {
    const localRecords = JSON.parse(localStorage.getItem('volunteerRecords')) || [];
    return [...databaseVolunteerRecords, ...localRecords];
}

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

function populateVolunteerOpportunities() {
    const select = document.getElementById('volunteerOpportunity');
    if (!select) return;

    const opportunities = getVolunteerOpportunities();
    select.innerHTML = '<option value="">Select opportunity</option>' + opportunities.map(opportunity =>
        `<option value="${escapeHtml(opportunity.id || opportunity.title)}">${escapeHtml(opportunity.title)}</option>`
    ).join('');
}

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

function renderVolunteerStatusActions(record) {
    return `
        <div class="btn-group btn-group-sm mt-2" role="group" aria-label="Volunteer status">
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'registered')">Registered</button>
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'in-progress')">Progress</button>
            <button class="btn btn-outline-success" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'completed')">Done</button>
        </div>
    `;
}

function updateVolunteerStatus(registrationId, status) {
    const hours = status === 'completed' ? prompt('Hours completed?', '1') : '';
    fetch('api.php?action=updateVolunteerRegistration', {
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
        fetch('api.php?action=createVolunteerOp', {
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
// ============================================
// OFFICER HADITH MANAGEMENT
// ============================================

function saveOfficerHadith(event) {
    event.preventDefault();
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Imam can manage hadiths.', 'warning');
        return;
    }

    const payload = {
        arabic: document.getElementById('officerHadithArabic')?.value.trim() || '',
        english: document.getElementById('officerHadithEnglish')?.value.trim() || '',
        reference: document.getElementById('officerHadithReference')?.value.trim() || '',
        source: document.getElementById('officerHadithSource')?.value.trim() || '',
        category: document.getElementById('officerHadithCategory')?.value.trim() || ''
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

    fetch('api.php?action=addHadith', {
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

function loadOfficerHadiths() {
    const container = document.getElementById('officerHadithsList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading hadiths...</p>';

    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('api.php?action=getHadiths', { credentials: 'same-origin' }).then(response => parseJsonResponse(response));

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
                    <p class="mb-2"><strong>English:</strong> ${escapeHtml(hadith.english || '')}</p>
                    ${hadith.reference ? `<p class="mb-1"><strong>Reference:</strong> ${escapeHtml(hadith.reference)}</p>` : ''}
                    ${hadith.source ? `<p class="mb-1"><strong>Source:</strong> ${escapeHtml(hadith.source)}</p>` : ''}
                    ${hadith.category ? `<p class="mb-1"><strong>Category:</strong> <span class="badge bg-info">${escapeHtml(hadith.category)}</span></p>` : ''}
                </div>
                <div class="item-actions">
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

function deleteOfficerHadith(hadithId) {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Imam can delete hadiths.', 'warning');
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

    fetch('api.php?action=deleteHadith', {
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
function initializeHadiths() {
    Promise.all([loadAllHadiths(), loadDailyHadith()]).catch(() => {
        console.warn('Hadith initialization encountered an issue.');
    });
}

// Load all hadiths
function loadAllHadiths() {
    const hadithRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('dawaah.php?action=getAll').then(response => parseJsonResponse(response));

    return hadithRequest
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                allHadiths = data.data;
                hadithsLoaded = true;
                console.log('Hadiths loaded:', allHadiths.length);
                return allHadiths;
            }
            throw new Error('Invalid hadith list returned');
        })
        .catch(error => {
            console.log('Hadith API unavailable or no hadiths added:', error);
            allHadiths = [];
            hadithsLoaded = true;
            return allHadiths;
        });
}

// Load today''s hadith
function loadDailyHadith() {
    const dailyRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getDailyHadith'))
        : fetch('dawaah.php?action=getDaily').then(response => parseJsonResponse(response));

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
        .catch(error => {
            console.log('Daily hadith API unavailable or no hadith added:', error);
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
        : fetch('api.php?action=getSiteSettings').then(response => parseJsonResponse(response));

    request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load contact settings');
            writeLocalSiteSettings(result.data || {});
            applySettings(result.data || {});
        })
        .catch(() => applySettings(getLocalSiteSettings()));
    loadContactVoiceMessages();
}

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

    fetch('api.php?action=updateSiteSettings', {
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

function setVoiceRecordingStatus(message, type = 'muted') {
    const status = document.getElementById('voiceRecordingStatus');
    if (!status) return;
    status.textContent = message;
    status.className = `small mt-2 text-${type}`;
}

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

function stopContactVoiceRecording() {
    if (contactVoiceRecorder && contactVoiceRecorder.state === 'recording') {
        contactVoiceRecorder.stop();
    }
    document.getElementById('startVoiceRecording').disabled = false;
    document.getElementById('stopVoiceRecording').disabled = true;
    document.getElementById('clearVoiceRecording').disabled = false;
}

function stopContactVoiceStream() {
    if (!contactVoiceStream) return;
    contactVoiceStream.getTracks().forEach(track => track.stop());
    contactVoiceStream = null;
}

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

function showContactVoicePreview(blobOrFile) {
    const preview = document.getElementById('voiceRecordingPreview');
    if (!preview || !blobOrFile) return;
    if (preview.src) URL.revokeObjectURL(preview.src);
    preview.src = URL.createObjectURL(blobOrFile);
    preview.classList.remove('d-none');
}

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

function getContactVoiceFileForSubmit() {
    const uploadedFile = document.getElementById('contactVoiceFile')?.files?.[0];
    if (uploadedFile) return uploadedFile;
    if (!contactVoiceBlob) return null;
    const extension = contactVoiceBlob.type.includes('ogg') ? 'ogg' : contactVoiceBlob.type.includes('mp4') ? 'm4a' : 'webm';
    return new File([contactVoiceBlob], `contact-voice.${extension}`, { type: contactVoiceBlob.type || 'audio/webm' });
}

function resetContactFormAfterSubmit() {
    document.getElementById('contactForm')?.reset();
    clearContactVoiceRecording();
}

function submitContactVoiceMessage(event) {
    event.preventDefault();
    if (frontendOnly) {
        showNotification('Voice messages need the PHP backend. Please open this through XAMPP/localhost.', 'warning');
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

    fetch('api.php?action=submitContactVoiceMessage', {
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

function loadContactVoiceMessages() {
    const container = document.getElementById('contactVoiceMessagesList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading voice messages...</p>';

    fetch('api.php?action=getContactVoiceMessages')
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

function markContactVoiceMessageRead(messageId) {
    if (!messageId) return;
    fetch('api.php?action=markContactVoiceMessageRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: Number(messageId) })
    }).catch(() => {});
}

// GALLERY MANAGEMENT
function loadAdminGallery() {
    const galleryList = document.getElementById('galleryItemsList');
    if (!galleryList) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_api.php?action=getGallery').then(response => parseJsonResponse(response));

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

function showAddGalleryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addGalleryModal'));
    modal.show();
}

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
            fetch('api.php?action=addGalleryItem', {
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

        let galleryItems = JSON.parse(localStorage.getItem('galleryItems')) || [];

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

function removeGalleryItem(index) {
    if (!confirm('Are you sure you want to remove this gallery item?')) return;

    if (!frontendOnly) {
        fetch('api.php?action=deleteGalleryItem', {
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

    let galleryItems = JSON.parse(localStorage.getItem('galleryItems')) || [];
    galleryItems.splice(index, 1);
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    logLocalRoleActivity('deleteGalleryItem', { gallery_id: index });

    loadAdminGallery();
    loadGalleryContent(); // Refresh landing page gallery
    showNotification('Gallery item removed!', 'success');
}
