// Runtime slice from daawah.js: openMemberDigitalCard.
async function openMemberDigitalCard() {
    if (!currentUser) return;
    const body = document.getElementById('memberDigitalCardBody');
    if (!body) return;
    const name = currentUser.fullName || currentUser.name || currentUser.username || 'Member';
    const studentId = currentUser.studentId || currentUser.username || 'Not set';
    const membershipState = getMembershipDisplayState();
    const status = membershipState.status;
    const role = formatRoleName(currentUser.role || currentRole || 'student');
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const pendingCard = completedMembershipPayment && currentUser.membershipCardAppliedAt
        ? ensureActiveMembershipCard(completedMembershipPayment)
        : null;
    let issuedCard = null;
    if (pendingCard && window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
        try {
            await saveMembershipCardRecord(pendingCard);
            const verifiedCard = await window.SupabaseBackend.loadPublicMembershipCard(pendingCard.cardId);
            if (verifiedCard && String(verifiedCard.status || '').toLowerCase() === 'active'
                && String(verifiedCard.paymentStatus || '').toLowerCase() === 'paid') {
                issuedCard = verifiedCard;
            }
        } catch (error) {
            console.error('Online membership card verification failed:', error);
        }
    }
    const cardPaymentStatus = issuedCard ? 'Paid and verified' : (completedMembershipPayment ? 'Awaiting finance verification' : 'No payment');
    const cardApplicationStatus = currentUser.membershipCardAppliedAt
        ? (issuedCard ? 'Issued and verified' : 'Application preview')
        : 'Not applied';
    const cardId = issuedCard?.cardId || 'Not issued';
    const verifyUrl = issuedCard ? membershipCardVerificationUrl(cardId) : memberVerificationUrl(currentUser);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&ecc=H&data=${encodeURIComponent(verifyUrl)}`;
    const signature = issuedCard
        ? `${displaySignatureName(issuedCard.signatureName, 'Imam')} · ${displaySignatureTitle(issuedCard.signatureTitle, 'Imam')}`
        : 'Not issued';
    const signatureImage = issuedCard && isReceiptSignatureImage(issuedCard.signatureImage) ? issuedCard.signatureImage : '';
    const photo = currentUser.profilePhoto || currentUser.profileImage || currentUser.photoUrl || currentUser.avatar || '';
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'M';
    const printButton = document.getElementById('memberDigitalCardPrintButton');
    if (printButton) {
        printButton.disabled = !issuedCard;
        printButton.title = issuedCard ? 'Print verified membership card' : 'Printing unlocks after Finance verifies dues and issues the card online';
    }
    body.innerHTML = `
        <section id="memberDigitalCard" class="member-id-card">
            <header class="member-id-card__header">
                <img src="assets/umma-university-logo-color.png?v=20260522-logo2" alt="UMMA University logo">
                <div class="member-id-card__brand"><strong>UMMA UNIVERSITY</strong><span>DAWAH TEAM · MEMBERSHIP CARD</span></div>
                <span class="badge ${issuedCard ? membershipState.badgeClass : 'bg-secondary'}">${issuedCard ? escapeHtml(status) : 'Not issued'}</span>
            </header>
            <div class="member-id-card__main">
                <div class="member-id-card__details">
                    <span class="member-id-card__label">Student member</span>
                    <h2>${escapeHtml(name)}</h2>
                    <p class="member-id-card__student-number">${escapeHtml(studentId)}</p>
                    <div class="member-id-card__fields">
                        <div><span>Course</span><strong>${escapeHtml(currentUser.course || 'Not set')}</strong></div>
                        <div><span>Role</span><strong>${escapeHtml(role)}</strong></div>
                    </div>
                </div>
                <div class="member-id-card__photo-wrap">
                    ${photo ? `<img class="member-id-card__photo" src="${escapeHtml(photo)}" alt="${escapeHtml(name)}">` : `<div class="member-id-card__photo member-id-card__photo--empty" aria-label="No profile photo">${escapeHtml(initials)}</div>`}
                </div>
            </div>
            <footer class="member-id-card__footer">
                <div class="member-id-card__meta">
                    <span>Card number</span><strong>${escapeHtml(cardId)}</strong>
                    <span>Valid until</span><strong>${escapeHtml(issuedCard ? formatMembershipDate(issuedCard.expiresAt, 'Not set') : 'After issue')}</strong>
                    <span>${escapeHtml(signature)}</span>
                    ${signatureImage ? `<img src="${escapeHtml(signatureImage)}" alt="Authorised Imam signature" style="display:block;max-width:150px;max-height:42px;object-fit:contain;margin-top:4px">` : ''}
                </div>
                <div class="member-id-card__verify"><img src="${qrUrl}" alt="QR code to verify ${issuedCard ? 'this issued membership card' : 'this member record'}" width="180" height="180"><span>${issuedCard ? 'Verify issued card' : 'Preview only'}</span></div>
            </footer>
        </section>
        ${issuedCard ? '' : `<div class="alert alert-warning mt-3 mb-0">${escapeHtml(cardApplicationStatus)}. This is a preview only. A usable card and receipt require online finance approval (${escapeHtml(cardPaymentStatus)}).</div>`}
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('memberDigitalCardModal')).show();
}
