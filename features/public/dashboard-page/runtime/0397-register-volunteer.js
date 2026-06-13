// Runtime slice from daawah.js: registerVolunteer.
function registerVolunteer(opportunity) {
    showVolunteerModal();
    document.getElementById('volunteerOpportunity').value = decodeURIComponent(opportunity);
}

// Update loadViewData to include volunteer view
const originalLoadViewData = window.loadViewData;
window.loadViewData = function(viewName) {
    if (viewName === 'dashboard') {
        loadDashboardData();
    } else if (viewName === 'volunteer') {
        loadVolunteerData();
    } else if (originalLoadViewData) {
        originalLoadViewData(viewName);
    }
};
