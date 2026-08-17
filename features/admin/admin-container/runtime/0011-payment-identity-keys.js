// Runtime slice from admin.js: paymentIdentityKeys.
function paymentIdentityKeys(payment) {
    return [
        payment?.ownerUid,
        payment?.uid,
        payment?.email,
        payment?.ownerEmail,
        payment?.studentEmail,
        payment?.studentId,
        payment?.student_id,
        payment?.username,
        payment?.memberId
    ].map(value => normalizeAdminText(value)).filter(Boolean);
}
