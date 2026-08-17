// Runtime slice from daawah.js: resendFinanceReceipt.
function resendFinanceReceipt(kind, index) {
    const records = kind === 'donations' ? donations : payments;
    const record = records[index];
    if (!record?.receiptNumber) {
        showNotification('No receipt number is available to resend.', 'warning');
        return;
    }
    const verifyUrl = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}verify-receipt.html?receipt=${encodeURIComponent(record.receiptNumber)}`;
    const recipient = record.email || record.ownerEmail || currentUser?.email || '';
    const subject = encodeURIComponent(`UMMA receipt ${record.receiptNumber}`);
    const body = encodeURIComponent(`Assalamu alaikum,\n\nYour UMMA University Dawah Team receipt is ready.\n\nReceipt: ${record.receiptNumber}\nAmount: KSh ${record.amount || 0}\nVerify: ${verifyUrl}\n\nPlease keep this link for your records.`);
    const whatsappText = encodeURIComponent(`UMMA receipt ${record.receiptNumber}: ${verifyUrl}`);
    const choice = prompt('Type EMAIL to open email, WHATSAPP to open WhatsApp, or COPY to copy the receipt link.', 'EMAIL');
    if (choice === null) return;
    const normalized = choice.trim().toUpperCase();
    if (normalized === 'EMAIL') {
        location.href = `mailto:${encodeURIComponent(recipient)}?subject=${subject}&body=${body}`;
    } else if (normalized === 'WHATSAPP') {
        window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener');
    } else if (normalized === 'COPY') {
        navigator.clipboard?.writeText(verifyUrl).then(() => showNotification('Receipt verification link copied.', 'success'));
    }
}
