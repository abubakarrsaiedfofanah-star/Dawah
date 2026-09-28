// Runtime slice from daawah.js: renderVolunteerOpportunities.
function renderVolunteerOpportunities() {
    const container = document.getElementById('volunteerOpportunitiesList');
    if (!container) return;

    const canManage = hasPermission('manage_events');
    const opportunities = getVolunteerOpportunities()
        .filter(item => canManage || getCommunityListingKind(item) === 'volunteer')
        .filter(item => canManage || isCommunityListingOpen(item));
    if (!opportunities.length) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No volunteer opportunities have been added yet.</div>';
        return;
    }

    container.innerHTML = opportunities.map((opportunity, index) => {
        const isManagerListing = canManage && String(opportunity.id || '').startsWith('community-listing-');
        const isOpen = isCommunityListingOpen(opportunity);
        const kind = getCommunityListingKind(opportunity);
        const safeId = escapeHtml(opportunity.id || '');
        const postedBy = opportunity.postedBy ? `<br><small>Posted by ${escapeHtml(opportunity.postedBy)}${opportunity.postedAt ? ` · ${escapeHtml(formatCommunityListingDate(opportunity.postedAt))}` : ''}</small>` : '';
        const expiry = formatCommunityListingDate(opportunity.endDate || opportunity.endsAt);
        const controls = isManagerListing ? `<div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-sm btn-outline-primary" onclick="editCommunityListing('${safeId}')">Edit</button><button class="btn btn-sm btn-outline-secondary" onclick="setCommunityListingStatus('${safeId}', '${isOpen ? 'closed' : 'open'}')">${isOpen ? 'Close listing' : 'Reopen listing'}</button><button class="btn btn-sm btn-outline-danger" onclick="removeCommunityListing('${safeId}')">Remove</button></div>` : '';
        return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card volunteer-card h-100">
                <div class="card-header">
                    <h6 class="mb-0">${escapeHtml(opportunity.title)}</h6>
                    <small>${escapeHtml(opportunity.schedule || 'Schedule will be announced')}${postedBy}</small>
                </div>
                <div class="card-body d-flex flex-column">
                    <p class="text-muted">${escapeHtml(opportunity.description || 'Details will be shared soon.')}</p>
                    <div class="volunteer-details mt-auto">
                        ${isManagerListing ? `<span class="badge ${isOpen ? 'bg-success' : 'bg-secondary'}">${isOpen ? 'Open' : 'Closed'}</span>${expiry ? `<small class="d-block mt-2">Closes ${escapeHtml(expiry)}</small>` : ''}` : ''}
                        <span class="badge text-bg-light">${kind === 'charity' ? 'Charity appeal' : 'Volunteer'}</span>
                        ${kind === 'volunteer' ? `<small class="d-block mt-2"><strong>Hours:</strong> ${escapeHtml(String(opportunity.requiredHours || opportunity.required_hours || 'Flexible'))}</small>` : `<small class="d-block mt-2"><strong>Goal:</strong> ${Number(opportunity.goalAmount || 0) > 0 ? `KSh ${Number(opportunity.goalAmount).toLocaleString()}` : 'Not set'}</small>`}
                        ${opportunity.signupCount ? `<br><small><strong>Signups:</strong> ${escapeHtml(String(opportunity.signupCount))}</small>` : ''}
                    </div>
                    ${isOpen && kind === 'volunteer' ? `<button class="btn btn-sm btn-primary mt-2" onclick="registerVolunteer('${encodeURIComponent(opportunity.id || opportunity.title)}')">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>` : ''}
                    ${controls}
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function saveCommunityListings(listings) {
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.saveStore) {
        return window.SupabaseBackend.saveStore('volunteerOpportunities', listings).then(() => {
            localStorage.setItem('volunteerOpportunities', JSON.stringify(listings));
            return listings;
        });
    }
    if (frontendOnly) {
        localStorage.setItem('volunteerOpportunities', JSON.stringify(listings));
        return Promise.resolve(listings);
    }
    return Promise.reject(new Error('Shared Supabase listing storage is not configured.'));
}

function editCommunityListing(listingId) {
    if (!hasPermission('manage_events')) return;
    const listing = readList('volunteerOpportunities').find(item => item.id === listingId);
    if (!listing || !String(listing.id || '').startsWith('community-listing-')) return;
    editingVolunteerListingId = listing.id;
    document.getElementById('volunteerOpportunityKind').value = getCommunityListingKind(listing);
    document.getElementById('volunteerOpportunityTitle').value = listing.title || '';
    document.getElementById('volunteerOpportunityDescription').value = listing.description || '';
    document.getElementById('volunteerOpportunityHours').value = listing.requiredHours || '';
    document.getElementById('volunteerOpportunitySchedule').value = listing.schedule || '';
    document.getElementById('volunteerOpportunityGoal').value = listing.goalAmount || '';
    document.getElementById('volunteerOpportunityEndDate').value = String(listing.endDate || listing.endsAt || '').slice(0, 10);
    updateVolunteerOpportunityFields();
    const submit = document.querySelector('#volunteerOpportunityForm [type="submit"]');
    if (submit) submit.innerHTML = '<i class="fas fa-floppy-disk"></i> Save Changes';
    document.getElementById('volunteerOpportunityForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setCommunityListingStatus(listingId, status) {
    if (!hasPermission('manage_events')) return;
    const listing = readList('volunteerOpportunities').find(item => item.id === listingId);
    if (!listing || !String(listing.id || '').startsWith('community-listing-')) return;
    if (status === 'open' && !isCommunityListingOpen({ ...listing, status: 'open' })) {
        showNotification('This listing has passed its closing date. Edit it and set a future closing date before reopening.', 'warning');
        return;
    }
    const next = readList('volunteerOpportunities').map(item => item.id === listing.id
        ? { ...item, status: status === 'open' ? 'open' : 'closed', updatedAt: new Date().toISOString() }
        : item);
    saveCommunityListings(next).then(() => {
        renderCommunityHelpSection();
        return loadVolunteerData();
    }).then(() => showNotification(status === 'open' ? 'Listing reopened and visible publicly.' : 'Listing closed and removed from the public page.', 'success'))
        .catch(error => showNotification(error.message || 'Could not update this listing.', 'danger'));
}

function removeCommunityListing(listingId) {
    if (!hasPermission('manage_events')) return;
    const listing = readList('volunteerOpportunities').find(item => item.id === listingId);
    if (!listing || !String(listing.id || '').startsWith('community-listing-')) return;
    if (!window.confirm(`Remove “${listing.title}” permanently?`)) return;
    const next = readList('volunteerOpportunities').filter(item => item.id !== listing.id);
    saveCommunityListings(next).then(() => {
        renderCommunityHelpSection();
        return loadVolunteerData();
    }).then(() => showNotification('Listing removed.', 'success'))
        .catch(error => showNotification(error.message || 'Could not remove this listing.', 'danger'));
}
