// Runtime slice from daawah.js: loadVolunteerData.
function loadVolunteerData() {
    const managerPanel = document.getElementById('volunteerManagerPanel');
    managerPanel?.classList.toggle('d-none', !hasPermission('manage_events'));
    return Promise.allSettled([loadVolunteerOpportunitiesFromApi(), loadVolunteerOpportunityStore(), loadVolunteerRecordsFromApi()])
        .finally(() => {
            const volunteerRecords = getVolunteerRecords();
            renderVolunteerOpportunities();
            renderVolunteerRecords(volunteerRecords);
            populateVolunteerOpportunities();
        });
}

// Load organizer listings from the shared store so public visitors and officers see the same posts.
function loadVolunteerOpportunityStore() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.loadStore) {
        return Promise.resolve(readList('volunteerOpportunities'));
    }
    return window.SupabaseBackend.loadStore('volunteerOpportunities')
        .then(items => {
            const listings = Array.isArray(items) ? items : [];
            localStorage.setItem('volunteerOpportunities', JSON.stringify(listings));
            return listings;
        })
        .catch(error => {
            console.warn('Shared public opportunity list unavailable:', error);
            return readList('volunteerOpportunities');
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
