// Runtime slice from daawah.js: openOfficialReceipt.
function openOfficialReceipt(details) {
    const receiptNumber = details.receiptNumber || details.transactionRef || '';
    if (!receiptNumber) {
        showNotification?.('This receipt is not ready yet. Finance must approve it first.', 'warning');
        return;
    }
    const verifyUrl = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}verify-receipt.html?receipt=${encodeURIComponent(receiptNumber)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(verifyUrl)}`;
    const approvedBy = details.approvedBy || (details.status === 'Completed' ? (currentUser?.fullName || currentUser?.username || 'Treasurer') : 'Pending');
    const settings = getLocalSiteSettings();
    const signatureName = displaySignatureName(details.signatureName || settings.finance_signature_name || approvedBy, 'Imam');
    const signatureTitle = displaySignatureTitle(details.signatureTitle || settings.finance_signature_title, 'Imam');
    const signatureImage = isReceiptSignatureImage(details.signatureImage)
        ? details.signatureImage
        : (isReceiptSignatureImage(settings.finance_signature_image) ? settings.finance_signature_image : '');
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(receiptNumber)} Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f3fbf7; color: #17323a; }
        .receipt { max-width: 760px; margin: 28px auto; background: #fff; border: 1px solid #b9d8d2; padding: 32px; }
        .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #40b050; padding-bottom: 18px; }
        h1 { margin: 0; font-size: 24px; letter-spacing: 0; }
        .brand { color: #003040; font-weight: 700; margin-top: 6px; }
        .badge { display: inline-block; background: #003040; color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
        td:first-child { color: #6b7280; width: 34%; }
        .amount { font-size: 28px; font-weight: 700; color: #0060b0; }
        .verify { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 24px; padding: 16px; border: 1px solid #dbe7e4; background: #f8fffb; }
        .verify p { margin: 6px 0 0; color: #6b7280; }
        .verify img { width: 132px; height: 132px; }
        .receipt-footer { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-top: 30px; }
        .signature { min-width: 240px; text-align: center; }
        .signature-box { height: 76px; border-bottom: 1px solid #17323a; display: flex; align-items: flex-end; justify-content: center; padding: 0 12px 8px; }
        .signature-box img { max-width: 220px; max-height: 64px; object-fit: contain; }
        .signature strong { display: block; margin-top: 10px; color: #17323a; }
        .signature span { display: block; color: #6b7280; font-size: 12px; margin-top: 3px; }
        .actions { max-width: 760px; margin: 18px auto; display: flex; gap: 10px; justify-content: flex-end; }
        button, a { border: 0; background: #111827; color: #fff; padding: 10px 14px; border-radius: 4px; text-decoration: none; cursor: pointer; }
        @media (max-width: 640px) { .top, .verify, .receipt-footer { flex-direction: column; align-items: flex-start; } .signature { width: 100%; } }
        @media print { .actions { display: none; } body { background: #fff; } .receipt { margin: 0; border: 0; } }
    </style>
</head>
<body>
    <div class="actions"><button onclick="window.print()">Print</button><a id="downloadReceipt" download="${escapeHtml(receiptNumber)}.html">Download HTML</a></div>
    <main class="receipt">
        <div class="top">
            <div>
                <h1>Official ${escapeHtml(details.kind)} Receipt</h1>
                <div class="brand">UMMA University Da'awah Team</div>
            </div>
            <div><span class="badge">${escapeHtml(details.status || 'Completed')}</span></div>
        </div>
        <table>
            <tr><td>Receipt Number</td><td>${escapeHtml(receiptNumber)}</td></tr>
            <tr><td>Name</td><td>${escapeHtml(details.name || 'Member')}</td></tr>
            <tr><td>Type</td><td>${escapeHtml(details.type || details.kind)}</td></tr>
            <tr><td>Amount</td><td class="amount">KSh ${escapeHtml(details.amount || '0')}</td></tr>
            <tr><td>Payment Method</td><td>${escapeHtml(details.method || 'Not specified')}</td></tr>
            <tr><td>Transaction Reference</td><td>${escapeHtml(details.transactionRef || 'Not recorded')}</td></tr>
            <tr><td>Approved By</td><td>${escapeHtml(approvedBy)}</td></tr>
            <tr><td>Approved At</td><td>${escapeHtml(details.approvedAt || 'Not recorded')}</td></tr>
            <tr><td>Date</td><td>${escapeHtml(details.date || new Date().toLocaleDateString())}</td></tr>
            <tr><td>Verify Online</td><td>${escapeHtml(verifyUrl)}</td></tr>
        </table>
        <div class="verify">
            <div>
                <strong>Receipt verification QR</strong>
                <p>Scan to confirm this receipt in the UMMA University Da'awah Team system.</p>
            </div>
            <img src="${qrUrl}" alt="Receipt verification QR code">
        </div>
        <div class="receipt-footer">
            <div>
                <strong>Issued by UMMA University Da'awah Team</strong>
                <p style="margin:6px 0 0; color:#6b7280;">This receipt is valid after finance approval and online verification.</p>
            </div>
            <div class="signature">
                <div class="signature-box">${signatureImage ? `<img src="${escapeHtml(signatureImage)}" alt="Authorized signature">` : ''}</div>
                <strong>${escapeHtml(signatureName)}</strong>
                <span>${escapeHtml(signatureTitle)}</span>
            </div>
        </div>
    </main>
    <script>
        const html = document.documentElement.outerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        document.getElementById('downloadReceipt').href = URL.createObjectURL(blob);
    <\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}
