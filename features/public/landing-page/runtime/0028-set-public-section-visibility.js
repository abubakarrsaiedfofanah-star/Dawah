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
    if (activeSectionId === 'get-involved') renderCommunityHelpSection();
}

function renderCommunityHelpSection() {
    const container = document.getElementById('communityVolunteerOpportunities');
    const selector = document.getElementById('communityHelpInterest');
    if (!container || !selector || typeof getVolunteerOpportunities !== 'function') return;

    if (!container.dataset.opportunitiesLoaded && window.SupabaseBackend?.enabled && window.SupabaseBackend.loadStore) {
        container.dataset.opportunitiesLoaded = 'loading';
        window.SupabaseBackend.loadStore('volunteerOpportunities').then(opportunities => {
            if (Array.isArray(opportunities)) localStorage.setItem('volunteerOpportunities', JSON.stringify(opportunities));
            container.dataset.opportunitiesLoaded = 'loaded';
            renderCommunityHelpSection();
        }).catch(() => {
            container.dataset.opportunitiesLoaded = 'loaded';
        });
    }

    const opportunities = getVolunteerOpportunities();
    const otherOptions = Array.from(selector.options).filter(option => option.value && !option.dataset.opportunity);
    selector.innerHTML = '<option value="">Choose an opportunity or type of help</option>';
    opportunities.forEach(opportunity => {
        const title = String(opportunity.title || '').trim();
        if (!title) return;
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        option.dataset.opportunity = 'true';
        selector.appendChild(option);
    });
    otherOptions.forEach(option => selector.appendChild(option));

    if (!opportunities.length) {
        container.innerHTML = '<div class="col-12"><p class="mb-0 text-muted">There are no listed opportunities right now. You can still use the form below to offer help.</p></div>';
        return;
    }

    container.innerHTML = opportunities.map((opportunity, index) => {
        const title = escapeHtml(opportunity.title || 'Volunteer opportunity');
        const description = escapeHtml(opportunity.description || 'Help the team serve the campus and wider community.');
        const schedule = escapeHtml(opportunity.schedule || 'Schedule to be confirmed');
        const hours = Number(opportunity.requiredHours || 0);
        return `<div class="col-md-6"><article class="card h-100 border"><div class="card-body d-flex flex-column"><h4 class="h6">${title}</h4><p class="small text-muted">${description}</p><p class="small mb-3"><i class="far fa-calendar me-1"></i>${schedule}${hours > 0 ? ` · About ${hours} hours` : ''}</p><button type="button" class="btn btn-outline-primary btn-sm mt-auto" onclick="selectCommunityHelpOpportunity(${index})">Apply for this</button></div></article></div>`;
    }).join('');
}

function selectCommunityHelpOpportunity(index) {
    const opportunity = (typeof getVolunteerOpportunities === 'function' ? getVolunteerOpportunities() : [])[Number(index)];
    const selector = document.getElementById('communityHelpInterest');
    if (!opportunity || !selector) return;
    selector.value = opportunity.title || '';
    document.getElementById('communityHelpForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    selector.focus({ preventScroll: true });
}

function submitCommunityHelpApplication(event) {
    event.preventDefault();
    const form = document.getElementById('communityHelpForm');
    if (!form?.reportValidity()) return false;
    const name = document.getElementById('communityHelpName').value.trim();
    const contact = document.getElementById('communityHelpContact').value.trim();
    const interest = document.getElementById('communityHelpInterest').value.trim();
    const details = document.getElementById('communityHelpAvailability').value.trim();
    if (!name || !contact || !interest || !details) return false;

    const message = [
        'Assalamu alaikum UMMA University Dawah Team,',
        'I would like to offer community help.',
        `Name: ${name}`,
        `Phone or email: ${contact}`,
        `Help requested: ${interest}`,
        `Availability/details: ${details}`
    ].join('\n');
    const contactLink = document.getElementById('publicContactWhatsapp')?.href || '';
    let destination;
    try {
        const url = new URL(contactLink, window.location.href);
        if (!/whatsapp|wa\.me/i.test(url.hostname)) throw new Error('WhatsApp contact is not configured');
        url.searchParams.set('text', message);
        destination = url.href;
    } catch (error) {
        const email = document.getElementById('publicContactEmail')?.getAttribute('href') || '';
        if (!email.startsWith('mailto:')) {
            window.alert('The team contact method is not configured yet. Please use the Contact Us page.');
            return false;
        }
        const url = new URL(email);
        url.searchParams.set('subject', 'Community help offer');
        url.searchParams.set('body', message);
        destination = url.href;
    }
    const opened = window.open(destination, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = destination;
    return false;
}
