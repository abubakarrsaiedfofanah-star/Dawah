// Runtime slice from daawah.js: saveVolunteerOpportunity.
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
