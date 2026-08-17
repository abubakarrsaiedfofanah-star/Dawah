// Runtime slice from admin.js: isMissingRequesterInfo.
function isMissingRequesterInfo(request) {
    const name = String(request.submittedByName || request.submittedBy || request.name || '').trim().toLowerCase();
    return (!name || name === 'member' || name === 'unknown member') &&
        !request.submittedByEmail &&
        !request.email &&
        !request.submittedByPhone &&
        !request.phone &&
        !request.submittedByStudentId &&
        !request.student_number;
}
