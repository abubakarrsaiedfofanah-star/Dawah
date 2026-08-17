// Runtime slice from daawah.js: submitWelfareRequest.
function submitWelfareRequest() {
    const type = document.getElementById('welfareType').value;
    const description = document.getElementById('welfareDescription').value;
    const amount = document.getElementById('welfareAmount').value;

    if (!type || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const request = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount || 'Not specified',
        dateSubmitted: new Date().toLocaleDateString(),
        status: 'Pending Review',
        submittedBy: currentUser.name || currentUser.fullName || currentUser.username,
        submittedByKey: getCurrentWelfareUserKey(),
        submittedByName: currentUser.fullName || currentUser.name || currentUser.username,
        submittedByEmail: currentUser.email || '',
        submittedByPhone: currentUser.phone || '',
        submittedByStudentId: currentUser.studentId || currentUser.username || '',
        submittedByCourse: currentUser.course || '',
        submittedByYear: currentUser.yearOfStudy || ''
    };

    if (!frontendOnly) {
        getCurrentStudentId()
        .then(studentId => fetch('supabase-required-endpoint?action=createWelfareRequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                category: type,
                description: description,
                amount: amount || 0,
                submitted_by_name: request.submittedByName,
                submitted_by_key: request.submittedByKey,
                submitted_by_email: request.submittedByEmail,
                submitted_by_phone: request.submittedByPhone,
                submitted_by_student_id: request.submittedByStudentId,
                submitted_by_course: request.submittedByCourse,
                submitted_by_year: request.submittedByYear
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save welfare request to database');
            }
            request.id = result.data?.request_id || request.id;
            request.databaseSynced = true;
            saveWelfareRequestLocally(request);
        })
        .catch(error => {
            console.error('Welfare database error:', error);
            request.databaseSynced = false;
            request.databaseSyncError = error.message || 'Database save unavailable';
            saveWelfareRequestLocally(request);
            showNotification('Request saved locally. Database sync is unavailable.', 'warning');
        });
        return;
    }

    saveWelfareRequestLocally(request);
}
