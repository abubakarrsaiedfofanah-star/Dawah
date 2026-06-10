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
