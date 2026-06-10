// Runtime slice from daawah.js: syncMemberStatusToDatabase.
function syncMemberStatusToDatabase(member, status) {
    if (frontendOnly || !member.dbStudentId) return;
    fetch('firestore-disabled-endpoint?action=updateStudentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({
            student_db_id: member.dbStudentId,
            status: status.toLowerCase()
        }))
    }).catch(error => console.error('Member status sync error:', error));
}
