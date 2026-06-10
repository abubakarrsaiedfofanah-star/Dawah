// Runtime slice from daawah.js: formatPaymentType.
function formatPaymentType(type) {
    const labels = {
        membershipDues: 'Membership Dues',
        activityFee: 'Activity Fee',
        specialEvents: 'Special Events Fee',
        other: 'Other Payment'
    };
    return labels[type] || type || 'Payment';
}
