// Runtime slice from daawah.js: syncWelfareRequestsFromAdmin.
function syncWelfareRequestsFromAdmin() {
    if (!currentUser || frontendOnly) return Promise.resolve();

    return fetch('admin_firestore-disabled-endpoint?action=getWelfareRequests')
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const userKey = getCurrentWelfareUserKey();
            const userName = currentUser.fullName || currentUser.name || currentUser.username || '';
            const current = readList('welfareRequests');
            const synced = result.data
                .filter(item => {
                    const dbStudentId = item.student_id || item.student_number || '';
                    const dbName = [item.first_name, item.last_name].filter(Boolean).join(' ');
                    return dbStudentId === currentUser.studentId ||
                        dbStudentId === currentUser.username ||
                        item.email === currentUser.email ||
                        dbName === userName ||
                        item.submittedByKey === userKey;
                })
                .map(item => ({
                    id: item.id,
                    type: item.type || item.category || 'Welfare Request',
                    description: item.description || '',
                    amount: item.amount || item.amount_needed || 'Not specified',
                    dateSubmitted: item.dateSubmitted || item.created_at || '-',
                    status: item.status || 'Pending Review',
                    submittedBy: userName,
                    submittedByKey: userKey,
                    submittedByName: userName,
                    submittedByEmail: currentUser.email || '',
                    submittedByPhone: currentUser.phone || '',
                    submittedByStudentId: currentUser.studentId || currentUser.username || '',
                    submittedByCourse: currentUser.course || '',
                    submittedByYear: currentUser.yearOfStudy || '',
                    databaseSynced: true
                }));

            const merged = [...current];
            synced.forEach(item => {
                const index = merged.findIndex(existing => Number(existing.id) === Number(item.id));
                if (index >= 0) {
                    merged[index] = { ...merged[index], ...item };
                } else {
                    merged.push(item);
                }
            });

            welfareRequests = merged;
            localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
            updateWelfareRequestsList();
        })
        .catch(() => {});
}
