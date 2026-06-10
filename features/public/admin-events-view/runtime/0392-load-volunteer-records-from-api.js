// Runtime slice from daawah.js: loadVolunteerRecordsFromApi.
function loadVolunteerRecordsFromApi() {
    if (frontendOnly || !currentUser) {
        databaseVolunteerRecords = [];
        return Promise.resolve([]);
    }
    const actor = authQuery();
    const loadRecords = studentId => fetch(`firestore-disabled-endpoint?action=getVolunteerRegistrations&${actor}&student_id=${encodeURIComponent(studentId || 0)}`, { credentials: 'same-origin' });
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
