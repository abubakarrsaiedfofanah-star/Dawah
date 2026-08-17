// Runtime slice from admin.js: attachRequesterToWelfare.
function attachRequesterToWelfare(requestId) {
    const select = document.getElementById('requesterLink' + requestId);
    const requester = adminStudentRequesters[Number(select?.value)];
    if (!requester) {
        showNotification('Please select a registered student first.', 'warning');
        return;
    }

    const requests = readStore('welfareRequests').map(request => Number(request.id) === Number(requestId)
        ? {
            ...request,
            submittedByName: requester.fullName || requester.name || requester.username,
            submittedBy: requester.fullName || requester.name || requester.username,
            submittedByStudentId: requester.studentId || requester.student_id || requester.username,
            submittedByEmail: requester.email || '',
            submittedByPhone: requester.phone || '',
            submittedByCourse: requester.course || '',
            submittedByYear: requester.yearOfStudy || requester.year_of_study || '',
            submittedByKey: requester.username || requester.studentId || requester.student_id || requester.email || ''
        }
        : request
    );
    writeStore('welfareRequests', requests);
    showNotification('Requester attached to welfare request.', 'success');
    loadWelfareRequests();
}
