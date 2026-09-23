const json = (res, status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
};

const readJson = async response => {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; } catch { return { message: text }; }
};

module.exports = async function deleteStudentAccount(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return json(res, 405, { success: false, message: 'Use POST to delete a student account.' });
    }

    const supabaseUrl = (process.env.SUPABASE_URL || process.env.DAWAH_SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DAWAH_SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return json(res, 503, { success: false, message: 'Secure account deletion is not configured on the server.' });
    }

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json(res, 401, { success: false, message: 'Sign in again to continue.' });

    try {
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${token}` }
        });
        const caller = await readJson(authResponse);
        if (!authResponse.ok || !caller.id) return json(res, 401, { success: false, message: 'Your admin session is invalid or expired.' });

        const adminResponse = await fetch(`${supabaseUrl}/rest/v1/admin_roles?uid=eq.${encodeURIComponent(caller.id)}&select=data&limit=1`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        const adminRows = await readJson(adminResponse);
        const roleData = Array.isArray(adminRows) ? adminRows[0]?.data : null;
        if (!adminResponse.ok || !(roleData?.isMainAdmin === true || roleData?.isMainAdmin === 'true')) {
            return json(res, 403, { success: false, message: 'Only the main admin can delete student accounts.' });
        }

        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const membersResponse = await fetch(`${supabaseUrl}/rest/v1/app_records?collection=eq.members&select=id,data&limit=1000`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        const members = await readJson(membersResponse);
        if (!membersResponse.ok || !Array.isArray(members)) throw new Error('Could not load student records.');

        const requestedRecordId = String(body.memberRecordId || '');
        const requestedStudentId = String(body.studentId || '').trim().toLowerCase();
        const requestedEmail = String(body.email || '').trim().toLowerCase();
        const requestedUserId = String(body.userId || '').trim();
        const target = members.find(row => {
            const data = row.data || {};
            return (requestedRecordId && String(row.id) === requestedRecordId) ||
                (requestedUserId && [data.authUid, data.uid, data.user_id, data.userId, data.dbUserId].some(value => String(value || '') === requestedUserId)) ||
                (requestedStudentId && [data.studentId, data.student_id, data.username].some(value => String(value || '').trim().toLowerCase() === requestedStudentId)) ||
                (requestedEmail && [data.email, data.authEmail, data.auth_email].some(value => String(value || '').trim().toLowerCase() === requestedEmail));
        });
        if (!target) return json(res, 404, { success: false, message: 'Student record not found. Refresh the list and try again.' });

        const student = target.data || {};
        const role = String(student.role || 'student').trim().toLowerCase();
        if (!['student', 'member'].includes(role)) return json(res, 400, { success: false, message: 'This record is not a student account.' });
        const authUid = String(student.authUid || student.uid || student.user_id || student.userId || student.dbUserId || '').trim();
        if (!authUid) return json(res, 409, { success: false, message: 'This record has no linked sign-in account, so it cannot be securely deleted.' });

        const targetAdminResponse = await fetch(`${supabaseUrl}/rest/v1/admin_roles?uid=eq.${encodeURIComponent(authUid)}&select=uid&limit=1`, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        const targetAdmins = await readJson(targetAdminResponse);
        if (!targetAdminResponse.ok) throw new Error('Could not verify the target account role.');
        if (Array.isArray(targetAdmins) && targetAdmins.length) return json(res, 400, { success: false, message: 'Admin accounts cannot be deleted from the student list.' });

        const authDelete = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(authUid)}`, {
            method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        if (!authDelete.ok) {
            const error = await readJson(authDelete);
            throw new Error(error.message || 'Could not delete the student sign-in account.');
        }

        const matching = members.filter(row => {
            const data = row.data || {};
            return String(row.id) === String(target.id) ||
                [data.authUid, data.uid, data.user_id, data.userId, data.dbUserId].some(value => String(value || '') === authUid);
        });
        for (const row of matching) {
            const removeResponse = await fetch(`${supabaseUrl}/rest/v1/app_records?id=eq.${encodeURIComponent(row.id)}&collection=eq.members`, {
                method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=minimal' }
            });
            if (!removeResponse.ok) throw new Error('The sign-in account was deleted, but its student record needs server cleanup.');
        }

        return json(res, 200, { success: true });
    } catch (error) {
        console.error('Student deletion endpoint failed:', error);
        return json(res, 500, { success: false, message: error.message || 'Could not delete this student account.' });
    }
};
