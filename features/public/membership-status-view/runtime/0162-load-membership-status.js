// Runtime slice from daawah.js: loadMembershipStatus.
function loadMembershipStatus() {
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const membershipState = getMembershipDisplayState();
    const paymentStatus = completedMembershipPayment ? 'Paid' : 'No payment';
    const applicationStatus = currentUser?.membershipCardAppliedAt
        ? (completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment')
        : 'Not applied';
    const membershipInfo = {
        status: membershipState.status,
        expiryDate: membershipState.isMember ? formatMembershipDate(currentUser?.membershipCardExpiresAt || getActiveMembershipCard()?.expiresAt) : 'After payment',
        joinDate: currentUser?.createdAt
            ? new Date(currentUser.createdAt).toLocaleDateString()
            : (currentUser?.membershipCardAppliedAt ? new Date(currentUser.membershipCardAppliedAt).toLocaleDateString() : 'Not set'),
        tier: membershipState.tier
    };

    const statusEl = document.getElementById('membershipDetailStatus');
    const joinDateEl = document.getElementById('membershipDetailJoinDate');
    const expiryDateEl = document.getElementById('membershipDetailExpiryDate');
    const paymentStatusEl = document.getElementById('membershipDetailPaymentStatus');
    const applicationPanel = document.getElementById('membershipCardApplicationPanel');

    if (statusEl) {
        statusEl.textContent = membershipInfo.status;
        statusEl.className = `badge ${membershipState.badgeClass}`;
    }
    if (joinDateEl) joinDateEl.textContent = membershipInfo.joinDate;
    if (expiryDateEl) expiryDateEl.textContent = membershipInfo.expiryDate;
    if (paymentStatusEl) {
        paymentStatusEl.textContent = paymentStatus;
        paymentStatusEl.className = `badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}`;
    }
    if (applicationPanel) {
        const activeCard = getActiveMembershipCard();
        const paymentLine = completedMembershipPayment
            ? `Paid by ${escapeHtml(completedMembershipPayment.paymentMethod || 'payment')} on ${escapeHtml(completedMembershipPayment.date || 'recently')}.`
            : 'No completed membership dues payment is recorded yet.';
        applicationPanel.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between gap-2">
                <div>
                    <strong>Membership card application:</strong> ${escapeHtml(applicationStatus)}
                    <br><small class="text-muted">${paymentLine}</small>
                    <br><small class="text-muted">Card ID: ${escapeHtml(activeCard?.cardId || 'Not issued')}</small>
                </div>
                <span class="badge align-self-start ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${paymentStatus}</span>
            </div>
        `;
    }

    const container = document.getElementById('membershipStatusDetails');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <p><strong>Status:</strong> <span class="badge ${membershipState.badgeClass}">${membershipInfo.status}</span></p>
                    <p><strong>Membership Expiry:</strong> ${membershipInfo.expiryDate}</p>
                    <p><strong>${membershipState.sinceLabel}:</strong> ${membershipInfo.joinDate}</p>
                    <p><strong>Tier:</strong> ${membershipInfo.tier}</p>
                    <p><strong>Card Payment:</strong> <span class="badge ${completedMembershipPayment ? 'bg-success' : 'bg-secondary'}">${paymentStatus}</span></p>
                    <button class="btn btn-primary mt-3" onclick="applyForMembershipCard()">Apply for Membership Card</button>
                </div>
            </div>
        `;
    }
}
