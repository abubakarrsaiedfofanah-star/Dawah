// Runtime slice from admin.js: getStudentDashboardFilterFlags.
function getStudentDashboardFilterFlags(row) {
    const flags = ['all'];
    const status = normalizeAdminText(row?.status || row?.accountStatus);
    const membershipStatus = normalizeAdminText(row?.membershipStatus || row?.membershipStage);

    if (isDashboardStudentMember(row)) {
        flags.push('members');
    } else {
        flags.push('not_paid');
    }
    if (status.includes('pending') || membershipStatus.includes('pending')) {
        flags.push('pending');
    }
    if (status === 'active' || normalizeAdminText(row?.accountStatus) === 'active') {
        flags.push('active');
    }
    return flags;
}
