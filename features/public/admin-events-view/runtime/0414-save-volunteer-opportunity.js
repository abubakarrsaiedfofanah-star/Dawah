// Runtime slice from daawah.js: saveVolunteerOpportunity.
function updateVolunteerOpportunityFields() {
    const isCharity = document.getElementById('volunteerOpportunityKind')?.value === 'charity';
    document.getElementById('volunteerOpportunityHoursField')?.classList.toggle('d-none', isCharity);
    document.getElementById('volunteerOpportunityGoalField')?.classList.toggle('d-none', !isCharity);
    const hours = document.getElementById('volunteerOpportunityHours');
    const schedule = document.getElementById('volunteerOpportunitySchedule');
    const scheduleLabel = document.getElementById('volunteerOpportunityScheduleLabel');
    if (hours) hours.required = !isCharity;
    if (schedule) {
        schedule.required = !isCharity;
        schedule.placeholder = isCharity ? 'e.g. Open until 30 November' : 'e.g. Saturdays';
    }
    if (scheduleLabel) scheduleLabel.textContent = isCharity ? 'Appeal dates (optional)' : 'Schedule';
}

function saveVolunteerOpportunity(event) {
    event.preventDefault();
    if (!hasPermission('manage_events')) {
        showNotification('Only event managers and organizers can post public opportunities.', 'warning');
        return;
    }

    const kind = document.getElementById('volunteerOpportunityKind')?.value === 'charity' ? 'charity' : 'volunteer';
    const schedule = document.getElementById('volunteerOpportunitySchedule').value.trim();
    const existing = editingVolunteerListingId
        ? readList('volunteerOpportunities').find(item => item.id === editingVolunteerListingId)
        : null;
    const opportunity = {
        ...(existing || {}),
        id: editingVolunteerListingId || `community-listing-${Date.now()}`,
        kind,
        title: document.getElementById('volunteerOpportunityTitle').value.trim(),
        description: document.getElementById('volunteerOpportunityDescription').value.trim(),
        requiredHours: kind === 'volunteer' ? (Number(document.getElementById('volunteerOpportunityHours').value) || 1) : 0,
        schedule: schedule || (kind === 'charity' ? 'Open appeal' : ''),
        goalAmount: kind === 'charity' ? (Number(document.getElementById('volunteerOpportunityGoal').value) || 0) : 0,
        endDate: document.getElementById('volunteerOpportunityEndDate')?.value || '',
        status: existing?.status || 'open',
        postedBy: existing?.postedBy || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Dawah Team Organizer',
        postedAt: existing?.postedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (!opportunity.title || !opportunity.description || (kind === 'volunteer' && !opportunity.schedule)) {
        showNotification('Add a title, description, and schedule for the volunteer opportunity.', 'warning');
        return;
    }

    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.saveStore) {
        window.SupabaseBackend.loadStore('volunteerOpportunities')
            .catch(() => [])
            .then(current => {
                const listings = Array.isArray(current) ? current : [];
                const next = [opportunity, ...listings.filter(item => item.id !== opportunity.id)];
                return saveCommunityListings(next);
            })
            .then(listings => {
                logLocalRoleActivity(existing ? 'updateCommunityListing' : (kind === 'charity' ? 'createCharityAppeal' : 'createVolunteerOp'), { title: opportunity.title });
                resetVolunteerListingForm();
                showNotification(existing ? 'Listing updated.' : (kind === 'charity' ? 'Charity appeal posted publicly.' : 'Volunteer opportunity posted publicly.'), 'success');
                return loadVolunteerData();
            })
            .then(() => renderCommunityHelpSection())
            .catch(error => showNotification(error.message || 'Could not publish this community listing.', 'danger'));
        return;
    }

    if (!frontendOnly) {
        if (existing) {
            showNotification('Editing shared listings needs the Supabase public listing store enabled.', 'warning');
            return;
        }
        if (kind === 'charity') {
            showNotification('Public charity appeals need the Supabase public listing store enabled.', 'warning');
            return;
        }
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
            updateVolunteerOpportunityFields();
            showNotification('Volunteer opportunity saved.', 'success');
            return loadVolunteerData();
        })
        .catch(error => showNotification(error.message || 'Could not add volunteer opportunity', 'danger'));
        return;
    }

    const opportunities = readList('volunteerOpportunities');
    const next = [opportunity, ...opportunities.filter(item => item.id !== opportunity.id)];
    localStorage.setItem('volunteerOpportunities', JSON.stringify(next));
    logLocalRoleActivity(kind === 'charity' ? 'createCharityAppeal' : 'createVolunteerOp', { title: opportunity.title });
    resetVolunteerListingForm();
    loadVolunteerData();
    showNotification(kind === 'charity' ? 'Charity appeal posted.' : 'Volunteer opportunity posted.', 'success');
}

function resetVolunteerListingForm() {
    editingVolunteerListingId = null;
    document.getElementById('volunteerOpportunityForm')?.reset();
    const submit = document.querySelector('#volunteerOpportunityForm [type="submit"]');
    if (submit) submit.innerHTML = '<i class="fas fa-plus"></i> Publish Listing';
    updateVolunteerOpportunityFields();
}
