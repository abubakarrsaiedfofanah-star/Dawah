// Runtime slice from daawah.js: importStudentsCsv.
function importStudentsCsv(input) {
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
        const text = String(event.target?.result || '');
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
            showNotification('CSV must include a header row and at least one student.', 'warning');
            return;
        }
        const headers = parseCsvLine(lines[0]).map(header => header.trim());
        const imported = lines.slice(1).map(line => {
            const values = parseCsvLine(line);
            const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
            const studentId = normalizeStudentId(row.studentId || row.student_id || row.username);
            return {
                username: studentId,
                studentId,
                fullName: row.fullName || row.name || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`.trim(),
                email: String(row.email || '').trim().toLowerCase(),
                phone: row.phone || '',
                course: row.course || '',
                school: row.school || '',
                yearOfStudy: row.yearOfStudy || row.year_of_study || '',
                semester: row.semester || '',
                role: row.role || 'student',
                status: row.status || 'Active',
                membershipStatus: row.membershipStatus || 'Membership Pending',
                membershipPaymentStatus: row.membershipPaymentStatus || 'No payment',
                registrationSource: 'admin-csv-import',
                importedAt: new Date().toISOString()
            };
        }).filter(member => member.studentId && member.fullName);
        if (!imported.length) {
            showNotification('No valid student rows found. Include studentId and fullName/name columns.', 'warning');
            return;
        }
        if (!confirmDangerAction(`Import ${imported.length} student record(s)? Existing matching records will be updated.`, 'CONFIRM')) return;
        imported.forEach(member => {
            const index = allMembers.findIndex(item =>
                normalizeStudentId(item.studentId || item.username) === member.studentId
                || (member.email && String(item.email || '').toLowerCase() === member.email)
            );
            if (index >= 0) {
                allMembers[index] = { ...allMembers[index], ...member };
            } else {
                allMembers.push(member);
            }
            saveSharedMemberStore(member);
        });
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
        loadMemberDatabase();
        showNotification(`Imported ${imported.length} student record(s).`, 'success');
        input.value = '';
    };
    reader.readAsText(file);
}
