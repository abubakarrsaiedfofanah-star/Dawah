// Runtime slice from daawah.js: openOfficialReceipt.
async function openOfficialReceipt(details = {}) {
    const receiptNumber = details.receiptNumber || '';
    if (!receiptNumber || String(details.status || '').toLowerCase() !== 'completed') {
        showNotification?.('This receipt is not ready yet. Finance must approve it first.', 'warning');
        return;
    }
    if (!window.SupabaseBackend?.enabled) {
        showNotification?.('Official receipts need an online verification record. Reconnect and try again.', 'warning');
        return;
    }
    const receiptWindow = window.open('about:blank', '_blank');
    if (!receiptWindow) {
        showNotification?.('Allow pop-ups to open the verified receipt.', 'warning');
        return;
    }
    let verifiedReceipt;
    try {
        verifiedReceipt = await window.SupabaseBackend.loadReceiptVerification(receiptNumber);
    } catch (error) {
        receiptWindow.close();
        showNotification?.('Could not verify this receipt online. Please try again.', 'danger');
        return;
    }
    if (!verifiedReceipt || String(verifiedReceipt.status || '').toLowerCase() !== 'completed') {
        receiptWindow.close();
        showNotification?.('No approved online receipt was found. Contact Finance before using this receipt.', 'warning');
        return;
    }
    details = { ...details, ...verifiedReceipt };
    const verifyLink = new URL('verify-receipt.html', location.href);
    verifyLink.searchParams.set('receipt', receiptNumber);
    const verifyUrl = verifyLink.href;
    const logoUrl = new URL('assets/umma-university-logo-color.png', location.href).href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&ecc=H&data=${encodeURIComponent(verifyUrl)}`;
    const approvedBy = details.approvedBy || 'Finance Team';
    const signatureName = displaySignatureName(details.signatureName, 'Imam');
    const signatureTitle = displaySignatureTitle(details.signatureTitle, 'Imam');
    const signatureImage = isReceiptSignatureImage(details.signatureImage) ? details.signatureImage : '';
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(receiptNumber)} Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f3fbf7; color: #17323a; }
        .receipt { width: min(760px, calc(100% - 32px)); margin: 28px auto; background: #fff; border: 1px solid #b9d8d2; padding: 32px; box-shadow: 0 12px 34px rgba(0,48,64,.1); overflow-wrap: anywhere; }
        .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #40b050; padding-bottom: 18px; }
        .top-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .top-brand img { width: 56px; height: 56px; object-fit: contain; }
        h1 { margin: 0; font-size: 24px; letter-spacing: 0; }
        .brand { color: #003040; font-weight: 700; margin-top: 6px; }
        .badge { display: inline-block; background: #087446; color: #fff; padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
        td:first-child { color: #6b7280; width: 34%; }
        .amount { font-size: 28px; font-weight: 700; color: #0060b0; }
        .verify { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 24px; padding: 16px; border: 1px solid #dbe7e4; background: #f8fffb; }
        .verify p { margin: 6px 0 0; color: #6b7280; }
        .verify img { width: 180px; height: 180px; padding: 5px; border: 1px solid #dbe7e4; border-radius: 12px; background: #fff; }
        .receipt-footer { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-top: 30px; }
        .signature { min-width: 240px; text-align: center; padding: 12px 18px; border: 1px solid #dbe7e4; border-radius: 12px; background: #fbfefc; }
        .signature-box { height: 76px; border-bottom: 1px solid #17323a; display: flex; align-items: flex-end; justify-content: center; padding: 0 12px 8px; }
        .signature-box img { max-width: 220px; max-height: 64px; object-fit: contain; }
        .signature strong { display: block; margin-top: 10px; color: #17323a; }
        .signature span { display: block; color: #6b7280; font-size: 12px; margin-top: 3px; }
        .actions { width: min(760px, calc(100% - 32px)); margin: 18px auto; display: flex; gap: 10px; justify-content: flex-end; }
        button, a { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border: 0; background: #111827; color: #fff; padding: 10px 14px; border-radius: 8px; text-decoration: none; cursor: pointer; }
        @media (max-width: 640px) { body { padding: 12px; } .receipt { width: 100%; margin: 8px auto; padding: 18px; border-radius: 12px; } .top, .verify, .receipt-footer { flex-direction: column; align-items: flex-start; } .top { gap: 12px; } h1 { font-size: 20px; } .verify { width: 100%; } .verify img { width: 152px; height: 152px; align-self: center; } .signature { width: 100%; min-width: 0; } .actions { width: 100%; flex-wrap: wrap; } .actions > * { flex: 1 1 120px; text-align: center; } table { table-layout: fixed; } td { padding: 9px 6px; overflow-wrap: anywhere; } td:first-child { width: 36%; } .amount { font-size: 23px; } }
        @media print { .actions { display: none; } body { background: #fff; padding: 0; } .receipt { width: 100%; margin: 0; border: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="actions"><button onclick="window.print()">Print</button><a id="downloadReceipt" download="${escapeHtml(receiptNumber)}.html">Download HTML</a></div>
    <main class="receipt">
        <div class="top">
            <div class="top-brand">
                <img src="${escapeHtml(logoUrl)}" alt="UMMA University logo">
                <div>
                <h1>Official ${escapeHtml(details.kind)} Receipt</h1>
                <div class="brand">UMMA University Dawah Team</div>
                </div>
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
            <tr><td>Date</td><td>${escapeHtml(details.date || details.createdAt || new Date().toLocaleDateString())}</td></tr>
            <tr><td>Verify Online</td><td>${escapeHtml(verifyUrl)}</td></tr>
        </table>
        <div class="verify">
            <div>
                <strong>Receipt verification QR</strong>
                <p>Scan to confirm this receipt in the UMMA University Dawah Team system.</p>
            </div>
            <img src="${qrUrl}" alt="Scan to verify receipt ${escapeHtml(receiptNumber)} online" width="180" height="180">
        </div>
        <div class="receipt-footer">
            <div>
                <strong>Issued by UMMA University Dawah Team</strong>
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
    receiptWindow.location.href = url;
}
