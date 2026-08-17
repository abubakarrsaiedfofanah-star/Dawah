// Runtime slice from daawah.js: loadVolunteerData.
function loadVolunteerData() {
    const managerPanel = document.getElementById('volunteerManagerPanel');
    managerPanel?.classList.toggle('d-none', !hasPermission('manage_events'));
    return Promise.allSettled([loadVolunteerOpportunitiesFromApi(), loadVolunteerRecordsFromApi()])
        .finally(() => {
            const volunteerRecords = getVolunteerRecords();
            renderVolunteerOpportunities();
            renderVolunteerRecords(volunteerRecords);
            populateVolunteerOpportunities();
        });
}
