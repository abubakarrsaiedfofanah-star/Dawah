// Runtime logic for role-specific CSV exports

/**
 * Chairlady: Export Welfare and Support Request Data
 */
function exportWelfareCSV(startDate, endDate) {
    const data = readList('welfareRequests');
    const filtered = typeof filterDataByRange === 'function' 
        ? filterDataByRange(data, startDate, endDate, 'created_at')
        : data;

    exportToCSV(filtered, `welfare_report_${startDate || 'all'}_to_${endDate || 'now'}.csv`);
}

/**
 * Organizer: Export Volunteer of the Month / Service Hours
 */
function exportVolunteerServiceCSV(startDate, endDate) {
    const records = getVolunteerRecords().filter(r => r.status === 'completed');
    
    // Aggregate hours by student
    const summary = {};
    records.forEach(r => {
        const key = r.studentId || r.email || 'unknown';
        if (!summary[key]) {
            summary[key] = {
                name: r.studentName || 'Unknown',
                id: r.studentId || '-',
                total_hours: 0,
                tasks_completed: 0
            };
        }
        summary[key].total_hours += Number(r.hoursCompleted || 0);
        summary[key].tasks_completed += 1;
    });

    const reportData = Object.values(summary).sort((a, b) => b.total_hours - a.total_hours);
    exportToCSV(reportData, `volunteer_service_report_${startDate || 'all'}.csv`);
}

/**
 * Volunteer Reminders Check
 * Run this on dashboard load to notify users of upcoming tasks.
 */
function checkUpcomingVolunteerTasks() {
    const myId = currentUser?.studentId || currentUser?.username;
    if (!myId) return;

    const upcoming = getVolunteerRecords().filter(r => 
        (r.studentId === myId || r.email === currentUser?.email) && 
        r.status === 'registered'
    );

    if (upcoming.length > 0) {
        upcoming.forEach(task => {
            addStudentLocalNotification(currentUser, 'Upcoming Service', `Reminder: You have an upcoming task for "${task.opportunity}".`, 'info');
        });
    }
}