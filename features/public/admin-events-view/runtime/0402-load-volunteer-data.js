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
