// Runtime slice from admin.js: deleteDashboardStudent.
async function deleteDashboardStudent(index) {
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can delete student accounts.', 'danger');
        return;
    }

    const student = lastDashboardDetailRows[index];
    if (!student) {
        showNotification('Student record not found. Refresh the records and try again.', 'warning');
        return;
    }

    const name = student.fullName || student.full_name || student.name || student.username || student.studentId || student.student_id || 'this student';
    if (!confirm(`Delete ${name}'s account? They will no longer be able to sign in. This cannot be undone.`)) return;

    const deleteButton = document.querySelector(`.student-record-delete[onclick="deleteDashboardStudent(${index})"]`);
    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Deleting...';
    }

    try {
        if (window.SupabaseBackend?.enabled) {
            const accessToken = sessionStorage.getItem('dawahSupabaseAccessToken') || localStorage.getItem('dawahSupabaseAccessToken') || '';
            if (!accessToken) throw new Error('Your secure admin session expired. Sign in again and retry.');
            const response = await fetch('/api/delete-student-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    memberRecordId: student.supabaseId || '',
                    studentId: student.studentId || student.student_id || student.username || '',
                    email: student.email || student.authEmail || student.auth_email || '',
                    userId: student.authUid || student.uid || student.user_id || student.dbUserId || ''
                })
            });
            const result = await parseJsonResponse(response);
            if (!response.ok || result.success !== true) {
                throw new Error(result.message || 'The account could not be deleted.');
            }
        } else {
            const targets = new Set([
                student.supabaseId, student.id, student.authUid, student.uid, student.user_id,
                student.dbUserId, student.studentId, student.student_id, student.username,
                student.email, student.authEmail
            ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean));
            const remaining = readStore('allMembers').filter(member => {
                const identities = [member.supabaseId, member.id, member.authUid, member.uid, member.user_id,
                    member.dbUserId, member.studentId, member.student_id, member.username, member.email, member.authEmail]
                    .map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
                return !identities.some(value => targets.has(value));
            });
            localStorage.setItem('allMembers', JSON.stringify(remaining));
        }

        const targets = new Set([
            student.supabaseId, student.id, student.authUid, student.uid, student.user_id,
            student.dbUserId, student.studentId, student.student_id, student.username,
            student.email, student.authEmail
        ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean));
        const remainingRows = lastDashboardDetailRows.filter(row => {
            const identities = [row.supabaseId, row.id, row.authUid, row.uid, row.user_id, row.dbUserId,
                row.studentId, row.student_id, row.username, row.email, row.authEmail]
                .map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
            return !identities.some(value => targets.has(value));
        });
        lastDashboardDetailRows = remainingRows;
        logLocalAdminActivity('deleteStudent', { student_id: student.studentId || student.student_id || '', email: student.email || '' });
        renderDashboardDetail('students', remainingRows);
        loadDashboardStatsFromLocal();
        showNotification('Student account deleted.', 'success');
    } catch (error) {
        console.error('Student account deletion failed:', error);
        showNotification(error.message || 'The account could not be deleted. Please try again.', 'danger');
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = '<i class="fas fa-trash-can" aria-hidden="true"></i> Delete student';
        }
    }
}
