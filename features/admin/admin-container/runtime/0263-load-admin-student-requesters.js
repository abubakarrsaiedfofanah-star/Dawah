// Runtime slice from admin.js: loadAdminStudentRequesters.
function loadAdminStudentRequesters() {
    return fetch(`${API_URL}?action=getDashboardDetail&type=students`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            const databaseStudents = result.success && Array.isArray(result.data) ? result.data : [];
            const localStudents = readStore('allMembers').filter(member => (member.role || 'student') === 'student');
            adminStudentRequesters = [...databaseStudents.map(student => ({
                id: student.id,
                fullName: [student.first_name, student.last_name].filter(Boolean).join(' '),
                studentId: student.student_id,
                email: student.email,
                phone: student.phone,
                course: student.course,
                yearOfStudy: student.year_of_study
            })), ...localStudents];
            return adminStudentRequesters;
        })
        .catch(() => {
            adminStudentRequesters = readStore('allMembers').filter(member => (member.role || 'student') === 'student');
            return adminStudentRequesters;
        });
}
