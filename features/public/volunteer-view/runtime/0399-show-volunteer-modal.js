// Runtime slice from daawah.js: showVolunteerModal.
function showVolunteerModal() {
    populateVolunteerOpportunities();
    const modal = new bootstrap.Modal(document.getElementById('volunteerModal'));
    modal.show();
}
