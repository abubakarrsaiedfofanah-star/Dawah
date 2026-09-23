// Runtime slice from daawah.js: syncMemberDeleteToDatabase.
async function syncMemberDeleteToDatabase(member) {
    if (frontendOnly || !member.dbStudentId) return;
    const response = await fetch('supabase-required-endpoint?action=deleteStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload({ student_db_id: member.dbStudentId }))
    });
    const result = await parseJsonResponse(response);
    if (!response.ok || result.success === false) {
        throw new Error(result.message || 'The server could not delete this student.');
    }
}
