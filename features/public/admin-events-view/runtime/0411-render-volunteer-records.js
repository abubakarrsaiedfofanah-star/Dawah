// Runtime slice from daawah.js: renderVolunteerRecords.
function renderVolunteerRecords(volunteerRecords) {
    const tbody = document.getElementById('volunteerRecordsList');
    if (!tbody) return;

    if (!volunteerRecords.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No volunteer signups yet.</td></tr>';
        return;
    }

    tbody.innerHTML = volunteerRecords.map(record => `
        <tr>
            <td>
                ${escapeHtml(record.opportunity || '-')}
                ${hasPermission('manage_events') && record.studentName ? `<br><small class="text-muted">${escapeHtml(record.studentName)} ${record.studentNumber ? '(' + escapeHtml(record.studentNumber) + ')' : ''}</small>` : ''}
            </td>
            <td>${escapeHtml(record.availability || '-')}</td>
            <td>${escapeHtml(record.skills || '-')}</td>
            <td>${escapeHtml(record.dateSignedUp || '-')}</td>
            <td>
                <span class="badge bg-success">${escapeHtml(record.status || 'Active')}</span>
                ${hasPermission('manage_events') && record.dbRegistrationId ? renderVolunteerStatusActions(record) : ''}
            </td>
        </tr>
    `).join('');
}
