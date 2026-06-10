// Runtime slice from daawah.js: renderProofLink.
function renderProofLink(proofUrl) {
    if (!proofUrl || proofUrl === 'Attached proof') return proofUrl ? '<br><small class="text-muted">Proof attached</small>' : '';
    if (/^https?:\/\//i.test(proofUrl)) return `<br><a class="small" href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener">Open proof link</a>`;
    return `<br><a class="small" href="${resolveAppUrl('firestore-disabled-endpoint?action=getFinanceProof&path=' + encodeURIComponent(proofUrl))}" target="_blank" rel="noopener">View proof</a>`;
}
