// Runtime slice from daawah.js: loadMemberDatabase.
function loadMemberDatabase() {
    if (!frontendOnly) {
        fetch(`firestore-disabled-endpoint?action=getAllStudents&${authQuery()}`)
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success || !Array.isArray(result.data)) return;
                const databaseMembers = result.data.map(student => ({
                    dbStudentId: student.id,
                    dbUserId: student.user_id,
                    username: student.username || student.student_id,
                    fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                    studentId: student.student_id,
                    email: student.email,
                    phone: student.phone,
                    role: student.role || 'student',
                    school: student.school,
                    course: student.course,
                    yearOfStudy: student.year_of_study,
                    semester: student.semester,
                    status: student.membership_status || (student.user_status === 'active' ? 'Active' : 'Pending'),
                    passport_photo: student.passport_photo
                }));
                const merged = [...allMembers];
                databaseMembers.forEach(member => {
                    const index = merged.findIndex(item =>
                        item.dbStudentId === member.dbStudentId ||
                        item.studentId === member.studentId ||
                        item.username === member.username ||
                        item.email === member.email
                    );
                    if (index >= 0) {
                        merged[index] = { ...merged[index], ...member };
                    } else {
                        merged.push(member);
                    }
                });
                allMembers = merged;
                localStorage.setItem('allMembers', JSON.stringify(allMembers));
                renderMemberDatabase();
            })
            .catch(error => console.error('Member database load error:', error));
    }
    renderMemberDatabase();
}
