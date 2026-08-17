// Runtime slice from daawah.js: downloadReceipt.
function downloadReceipt(index) {
    const payment = payments[index];
    if (!payment) return;
    openOfficialReceipt({
        kind: 'Payment',
        receiptNumber: payment.receiptNumber,
        transactionRef: payment.transactionRef,
        name: payment.memberName || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Member',
        type: formatPaymentType(payment.type),
        amount: payment.amount,
        method: payment.paymentMethod || 'Online',
        status: payment.status,
        date: payment.date,
        approvedBy: payment.approvedBy,
        approvedAt: payment.approvedAt
    });
}
