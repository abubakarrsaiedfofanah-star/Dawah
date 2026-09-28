// Runtime slice from daawah.js: populateVolunteerOpportunities.
function populateVolunteerOpportunities() {
    const select = document.getElementById('volunteerOpportunity');
    if (!select) return;

    const opportunities = getVolunteerOpportunities().filter(item => getCommunityListingKind(item) === 'volunteer' && isCommunityListingOpen(item));
    select.innerHTML = '<option value="">Select opportunity</option>' + opportunities.map(opportunity =>
        `<option value="${escapeHtml(opportunity.id || opportunity.title)}">${escapeHtml(opportunity.title)}</option>`
    ).join('');
}
