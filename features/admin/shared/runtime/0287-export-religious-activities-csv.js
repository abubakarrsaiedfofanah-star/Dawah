// Runtime slice from admin.js: exportReligiousActivitiesCSV.
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
