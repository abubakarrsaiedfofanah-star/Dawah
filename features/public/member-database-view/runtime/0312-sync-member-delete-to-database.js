// Runtime slice from daawah.js: syncMemberDeleteToDatabase.
function syncMemberDeleteToDatabase(member) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('firestore-disabled-endpoint?action=deleteStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({ student_db_id: member.dbStudentId }))
    }).catch(error => console.error('Member delete sync error:', error));
}
