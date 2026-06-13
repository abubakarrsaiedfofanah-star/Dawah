// Runtime slice from officer.js: registerOfficerLocally.
function registerOfficerLocally(data) {
    const members = readLocalMembers();
    if (findLocalMember(data.student_id) || findLocalMember(data.email)) {
        throw new Error('This Student ID or email is already registered. Please login or contact admin.');
    }
    const existingRoleHolder = members.find(member =>
        String(member.role || '').toLowerCase() === String(data.role).toLowerCase() &&
        !['rejected', 'suspended'].includes(String(member.status || '').toLowerCase())
    );
    if (existingRoleHolder) {
        throw new Error(`${data.role.charAt(0).toUpperCase() + data.role.slice(1)} role is already requested or assigned. Main admin must approve/reject or remove the existing holder first.`);
    }

    const member = {
        id: Date.now(),
        uid: window.SupabaseBackend?.currentUid?.() || '',
        authEmail: window.SupabaseBackend?.currentEmail?.() || data.email,
        username: data.student_id,
        fullName: data.fullName,
        studentId: data.student_id,
        password: data.password,
        role: data.role,
        status: 'Pending',
        school: data.school,
        course: data.course,
        yearOfStudy: data.year_of_study,
        semester: data.semester,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        created_at: new Date().toISOString()
    };
    members.push(member);
    writeLocalMembers(members);
    return member;
}
