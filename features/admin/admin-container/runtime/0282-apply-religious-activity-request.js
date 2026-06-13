// Runtime slice from admin.js: applyReligiousActivityRequest.
function applyReligiousActivityRequest(request) {
    if (!request || !request.type || !request.item) return;
    
    const data = getReligiousActivities();
    const type = request.type;
    const key = type === 'lecture' ? 'lectures' : type;
    
    if (!['jummah', 'ramadan', 'lectures'].includes(key)) return;
    
    data[key] = upsertReligiousActivity(data[key] || [], request.item, request.item.id);
    saveReligiousActivities(data);
    renderReligiousActivitiesAdmin();
}

/**
 * Exports all religious activities to CSV within a date range.
 */
function exportReligiousActivitiesCSV(startDate, endDate) {
    const data = getReligiousActivities();
    let allRecords = [];
    
    ['jummah', 'ramadan', 'lectures'].forEach(key => {
        if (data[key]) {
            allRecords = allRecords.concat(data[key].map(item => ({
                ...item,
                category: key,
                date_reference: item.activity_date || item.created_at
            })));
        }
    });

    if (typeof filterDataByRange === 'function') {
        allRecords = filterDataByRange(allRecords, startDate, endDate, 'date_reference');
    }

    exportToCSV(allRecords, `daawah_activities_${startDate || 'all'}_to_${endDate || 'now'}.csv`);
}
