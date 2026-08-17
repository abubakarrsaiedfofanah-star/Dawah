// Runtime slice from daawah.js: normalizeDatabaseVolunteerRecord.
function normalizeDatabaseVolunteerRecord(record) {
    return {
        id: `db-volunteer-record-${record.id}`,
        dbRegistrationId: Number(record.id),
        opportunity: record.opportunity_title,
        availability: record.availability || '-',
        skills: record.skills || '-',
        dateSignedUp: record.registered_at ? new Date(record.registered_at).toLocaleDateString() : '-',
        status: record.status || 'registered',
        hoursCompleted: record.hours_completed || 0,
        studentName: [record.first_name, record.last_name].filter(Boolean).join(' '),
        studentNumber: record.student_number || '',
        email: record.email || ''
    };
}
