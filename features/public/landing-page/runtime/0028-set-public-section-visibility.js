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

function getCommunityListingKind(opportunity) {
    const kind = String(opportunity?.kind || opportunity?.type || opportunity?.category || 'volunteer')
        .trim().toLowerCase().replace(/[ -]+/g, '_');
    return ['charity', 'charity_appeal', 'donation', 'fundraiser'].includes(kind) ? 'charity' : 'volunteer';
}

function isCommunityListingOpen(opportunity) {
    const status = String(opportunity?.status || 'open').trim().toLowerCase();
    if (!['open', 'active', 'published'].includes(status)) return false;
    const lastDay = opportunity?.endDate || opportunity?.endsAt || opportunity?.expiresAt || '';
    if (!lastDay) return true;
    const end = new Date(`${String(lastDay).slice(0, 10)}T23:59:59`);
    return Number.isNaN(end.getTime()) || end.getTime() >= Date.now();
}

function formatCommunityListingDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderCommunityHelpSection() {
    const container = document.getElementById('communityVolunteerOpportunities');
    const charityContainer = document.getElementById('communityCharityOpportunities');
    const selector = document.getElementById('communityHelpInterest');
    if (!container || !charityContainer || !selector || typeof getVolunteerOpportunities !== 'function') return;

    if (!container.dataset.opportunitiesLoaded) {
        container.dataset.opportunitiesLoaded = 'loading';
        const loaders = [];
        if (!frontendOnly && typeof loadVolunteerOpportunitiesFromApi === 'function') {
            loaders.push(loadVolunteerOpportunitiesFromApi());
        }
        if (window.SupabaseBackend?.enabled && window.SupabaseBackend.loadStore) {
            loaders.push(window.SupabaseBackend.loadStore('volunteerOpportunities').then(items => {
                if (Array.isArray(items)) localStorage.setItem('volunteerOpportunities', JSON.stringify(items));
            }));
        }
        Promise.allSettled(loaders).then(() => {
            container.dataset.opportunitiesLoaded = 'loaded';
            renderCommunityHelpSection();
        });
    }

    const allListings = getVolunteerOpportunities().filter(isCommunityListingOpen);
    const volunteerListings = allListings.filter(item => getCommunityListingKind(item) === 'volunteer');
    const charityListings = allListings.filter(item => getCommunityListingKind(item) === 'charity');
    const otherOptions = Array.from(selector.options).filter(option => option.value && !option.dataset.opportunity);
    selector.innerHTML = '<option value="">Choose an opportunity or type of help</option>';
    volunteerListings.forEach(opportunity => {
        const title = String(opportunity.title || '').trim();
        if (!title) return;
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        option.dataset.opportunity = 'true';
        selector.appendChild(option);
    });
    otherOptions.forEach(option => selector.appendChild(option));

    if (!volunteerListings.length) {
        container.innerHTML = '<div class="col-12"><p class="mb-0 text-muted">No volunteer openings are posted right now. You can still use the form below to offer your time or skills.</p></div>';
    } else {
        container.innerHTML = volunteerListings.map((opportunity, index) => {
            const title = escapeHtml(opportunity.title || 'Volunteer opportunity');
            const description = escapeHtml(opportunity.description || 'Help the team serve the campus and wider community.');
            const schedule = escapeHtml(opportunity.schedule || 'Schedule to be confirmed');
            const hours = Number(opportunity.requiredHours || opportunity.required_hours || 0);
            const postedBy = escapeHtml(opportunity.postedBy || 'Dawah Team');
            const postedDate = formatCommunityListingDate(opportunity.postedAt);
            const closes = formatCommunityListingDate(opportunity.endDate || opportunity.endsAt);
            return `<div class="col-md-6"><article class="card h-100 border"><div class="card-body d-flex flex-column"><div class="d-flex justify-content-between gap-2"><span class="badge text-bg-success">Open</span>${closes ? `<span class="small text-muted">Closes ${escapeHtml(closes)}</span>` : ''}</div><h4 class="h6 mt-2">${title}</h4><p class="small text-muted">${description}</p><p class="small mb-2">${schedule}${hours > 0 ? ` &middot; About ${hours} hours` : ''}</p><p class="small text-muted mt-auto mb-2">Posted by ${postedBy}${postedDate ? ` &middot; ${escapeHtml(postedDate)}` : ''}</p><button type="button" class="btn btn-outline-primary btn-sm" onclick="selectCommunityHelpOpportunity(${index})">Apply for this</button></div></article></div>`;
        }).join('');
    }

    if (!charityListings.length) {
        charityContainer.innerHTML = '<div class="col-12"><p class="mb-0 text-muted">No organizer charity appeals are open right now. General community donations are available above.</p></div>';
    } else {
        charityContainer.innerHTML = charityListings.map((appeal, index) => {
            const title = escapeHtml(appeal.title || 'Charity appeal');
            const description = escapeHtml(appeal.description || 'Support this community appeal.');
            const schedule = escapeHtml(appeal.schedule || 'Open appeal');
            const goal = Number(appeal.goalAmount || appeal.targetAmount || 0);
            const goalLabel = goal > 0 ? `<p class="small fw-semibold">Goal: KSh ${goal.toLocaleString()}</p>` : '';
            const postedBy = escapeHtml(appeal.postedBy || 'Dawah Team');
            const postedDate = formatCommunityListingDate(appeal.postedAt);
            const closes = formatCommunityListingDate(appeal.endDate || appeal.endsAt);
            return `<div class="col-md-6 col-lg-4"><article class="card h-100 border-success"><div class="card-body d-flex flex-column"><div class="d-flex justify-content-between gap-2"><span class="badge text-bg-success">Open</span>${closes ? `<span class="small text-muted">Closes ${escapeHtml(closes)}</span>` : ''}</div><span class="badge text-bg-success align-self-start mt-2 mb-2">Charity appeal</span><h4 class="h6">${title}</h4><p class="small text-muted">${description}</p><p class="small">${schedule}</p>${goalLabel}<p class="small text-muted mt-auto mb-2">Posted by ${postedBy}${postedDate ? ` &middot; ${escapeHtml(postedDate)}` : ''}</p><button type="button" class="btn btn-success" onclick="startCommunityCharityDonation(${index})">Donate to this appeal</button></div></article></div>`;
        }).join('');
    }
}

function startCommunityCharityDonation(index) {
    const appeals = getVolunteerOpportunities().filter(item => getCommunityListingKind(item) === 'charity' && isCommunityListingOpen(item));
    const appeal = appeals[Number(index)];
    if (!appeal || typeof showDonationModal !== 'function') return;
    showDonationModal('Charity Appeal', appeal);
}
function selectCommunityHelpOpportunity(index) {
    const opportunity = (typeof getVolunteerOpportunities === 'function' ? getVolunteerOpportunities() : [])
        .filter(item => getCommunityListingKind(item) === 'volunteer' && isCommunityListingOpen(item))[Number(index)];
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
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const validPhone = /^\+?[0-9][0-9\s().-]{6,20}$/.test(contact);
    if (!validEmail && !validPhone) {
        const field = document.getElementById('communityHelpContact');
        field?.setCustomValidity('Enter a valid email address or phone number.');
        field?.reportValidity();
        field?.addEventListener('input', () => field.setCustomValidity(''), { once: true });
        return false;
    }

    const message = [
        'Assalamu alaikum UMMA University Dawah Team,',
        'I would like to apply for community volunteer support.',
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
    const opened = window.open(destination, '_blank');
    if (opened) opened.opener = null;
    const feedback = document.getElementById('communityHelpFeedback');
    if (feedback) feedback.textContent = opened
        ? 'WhatsApp opened with your application. Review the message and press Send; the team will contact you using the details you provided.'
        : 'Opening your message in this tab. Review it and press Send so the team can contact you.';
    if (!opened) window.location.href = destination;
    return false;
}
