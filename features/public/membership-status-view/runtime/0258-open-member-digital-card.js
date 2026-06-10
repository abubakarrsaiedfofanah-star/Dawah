// Runtime slice from daawah.js: openMemberDigitalCard.
function openMemberDigitalCard() {
    if (!currentUser) return;
    const body = document.getElementById('memberDigitalCardBody');
    if (!body) return;
    const name = currentUser.fullName || currentUser.name || currentUser.username || 'Member';
    const studentId = currentUser.studentId || currentUser.username || 'Not set';
    const membershipState = getMembershipDisplayState();
    const status = membershipState.status;
    const role = formatRoleName(currentUser.role || currentRole || 'student');
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const issuedCard = completedMembershipPayment && currentUser.membershipCardAppliedAt
        ? ensureActiveMembershipCard(completedMembershipPayment)
        : null;
    const cardPaymentStatus = completedMembershipPayment ? 'Paid' : 'No payment';
    const cardApplicationStatus = currentUser.membershipCardAppliedAt
        ? (completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment')
        : 'Not applied';
    const cardId = issuedCard?.cardId || currentUser.membershipCardId || 'Not issued';
    const verifyUrl = issuedCard ? membershipCardVerificationUrl(cardId) : memberVerificationUrl(currentUser);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(verifyUrl)}`;
    const settings = getLocalSiteSettings();
    const signatureName = displaySignatureName(settings.finance_signature_name, 'Imam');
    const signatureTitle = displaySignatureTitle(settings.finance_signature_title, 'Imam');
    const signatureImage = isReceiptSignatureImage(settings.finance_signature_image) ? settings.finance_signature_image : '';
    const printButton = document.getElementById('memberDigitalCardPrintButton');
    if (printButton) {
        printButton.disabled = !completedMembershipPayment || !issuedCard;
        printButton.title = completedMembershipPayment ? 'Print membership card' : 'Complete membership dues payment before printing';
    }
    body.innerHTML = `
        <section id="memberDigitalCard" class="border rounded p-3 bg-white">
            <div class="d-flex justify-content-between gap-3 align-items-start">
                <div>
                    <div class="small text-muted">UMMA University Da'awah Team</div>
                    <h4 class="mb-1">${escapeHtml(name)}</h4>
                    <div class="badge ${membershipState.badgeClass}">${escapeHtml(status)}</div>
                </div>
                <img src="assets/umma-university-logo-color.png?v=20260522-logo2" alt="UMMA University logo" style="width:64px;height:64px;object-fit:contain;">
            </div>
            <hr>
            <div class="row g-2">
                <div class="col-12"><small class="text-muted">Unique Card ID</small><br><strong>${escapeHtml(cardId)}</strong></div>
                <div class="col-6"><small class="text-muted">Student ID</small><br><strong>${escapeHtml(studentId)}</strong></div>
                <div class="col-6"><small class="text-muted">Role</small><br><strong>${escapeHtml(role)}</strong></div>
                <div class="col-12"><small class="text-muted">Course</small><br><strong>${escapeHtml(currentUser.course || 'Not set')}</strong></div>
                <div class="col-6"><small class="text-muted">Card Application</small><br><strong>${escapeHtml(cardApplicationStatus)}</strong></div>
                <div class="col-6"><small class="text-muted">Payment</small><br><span class="badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${escapeHtml(cardPaymentStatus)}</span></div>
                <div class="col-6"><small class="text-muted">Issued</small><br><strong>${issuedCard?.issuedAt ? escapeHtml(new Date(issuedCard.issuedAt).toLocaleDateString()) : 'After payment'}</strong></div>
                <div class="col-6"><small class="text-muted">Expires</small><br><strong>${escapeHtml(formatMembershipDate(issuedCard?.expiresAt || currentUser.membershipCardExpiresAt, 'After issue'))}</strong></div>
                <div class="col-6"><small class="text-muted">Validity</small><br><strong>${escapeHtml(String(issuedCard?.validityYears || currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser)))} years</strong></div>
                <div class="col-6"><small class="text-muted">Receipt</small><br><strong>${escapeHtml(issuedCard?.receiptNumber || 'Not issued')}</strong></div>
            </div>
            <div class="d-flex justify-content-between align-items-end gap-3 mt-3">
                <div>
                    <small class="text-muted d-block">Issuer signature</small>
                    ${signatureImage ? `<img src="${signatureImage}" alt="Issuer signature" style="max-width:180px;max-height:52px;object-fit:contain;">` : '<div style="height:42px;border-bottom:1px solid #111;width:180px;"></div>'}
                    <strong class="d-block small">${escapeHtml(signatureName)}</strong>
                    <span class="small text-muted">${escapeHtml(signatureTitle)}</span>
                </div>
                <div class="text-end">
                <small class="text-muted d-block">Scan to verify this exact card.</small>
                <img src="${qrUrl}" alt="Member verification QR code" style="width:112px;height:112px;">
                </div>
            </div>
            ${completedMembershipPayment ? '' : '<div class="alert alert-warning mt-3 mb-0">Printing is locked until membership dues payment is completed.</div>'}
        </section>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('memberDigitalCardModal')).show();
}
