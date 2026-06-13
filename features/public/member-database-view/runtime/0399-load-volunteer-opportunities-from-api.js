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
