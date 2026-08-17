// Runtime slice from admin.js: enrichWelfareRequestFromMembers.
function enrichWelfareRequestFromMembers(request) {
    const members = [...adminStudentRequesters, ...readStore('allMembers')];
    const requesterKey = request.submittedByKey || request.submittedByStudentId || request.student_number || request.student_id || request.email || request.submittedByEmail;
    let requester = members.find(member =>
        member.username === requesterKey ||
        member.studentId === requesterKey ||
        member.email === requesterKey ||
        member.fullName === request.submittedBy ||
        member.name === request.submittedBy ||
        member.email === request.email
    );

    if (!requester && isMissingRequesterInfo(request)) {
        const studentMembers = members.filter(member => (member.role || 'student') === 'student' || member.studentId || member.student_id);
        if (studentMembers.length === 1) {
            requester = studentMembers[0];
        }
    }

    if (!requester) return request;

    return {
        ...request,
        submittedByName: request.submittedByName || requester.fullName || requester.name || requester.username,
        submittedBy: request.submittedBy || requester.fullName || requester.name || requester.username,
        submittedByStudentId: request.submittedByStudentId || request.student_number || requester.studentId || requester.username,
        submittedByEmail: request.submittedByEmail || requester.email,
        submittedByPhone: request.submittedByPhone || requester.phone,
        submittedByCourse: request.submittedByCourse || requester.course,
        submittedByYear: request.submittedByYear || requester.yearOfStudy
    };
}
