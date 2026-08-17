// Runtime slice from daawah.js: submitVolunteerSignup.
function submitVolunteerSignup() {
    const opportunity = document.getElementById('volunteerOpportunity').value;
    const skills = document.getElementById('volunteerSkills').value;
    const availability = document.getElementById('volunteerAvailability').value;
    const commitment = document.getElementById('volunteerCommit').checked;

    if (!opportunity || !availability || !commitment) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    const selectedOpportunity = getVolunteerOpportunities().find(item => String(item.id || item.title) === String(opportunity) || item.title === opportunity);
    if (!frontendOnly && selectedOpportunity?.dbOpportunityId) {
        getCurrentStudentId()
            .then(studentId => fetch('supabase-required-endpoint?action=registerVolunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(authPayload({
                    opportunity_id: selectedOpportunity.dbOpportunityId,
                    student_id: studentId,
                    skills,
                    availability
                }))
            }))
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) throw new Error(result.message || 'Could not register for volunteering');
                logLocalRoleActivity('registerVolunteer', { opportunity: selectedOpportunity.title, availability });
                bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
                document.getElementById('volunteerForm').reset();
                showNotification('Volunteer signup saved to the database.', 'success');
                return loadVolunteerData();
            })
            .catch(error => showNotification(error.message || 'Could not save volunteer signup', 'danger'));
        return;
    }

    // Add to volunteer records
    const volunteerRecord = {
        id: Date.now(),
        opportunity: opportunity,
        skills: skills,
        availability: availability,
        dateSignedUp: new Date().toLocaleDateString(),
        status: 'Active'
    };

    let volunteerRecords = readList('volunteerRecords');
    volunteerRecords.push(volunteerRecord);
    localStorage.setItem('volunteerRecords', JSON.stringify(volunteerRecords));
    saveOwnedCloudRecord('volunteerRegistrations', volunteerRecord, 'volunteerRecords');
    logLocalRoleActivity('registerVolunteer', { opportunity, availability });

    bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
    showNotification('Successfully signed up for volunteering!', 'success');

    // Clear form
    document.getElementById('volunteerForm').reset();
    loadVolunteerData();
}
