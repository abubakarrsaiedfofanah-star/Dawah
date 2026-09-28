// Runtime slice from daawah.js: submitDonation.
function submitDonation() {
    const amount = document.getElementById('donationAmount').value;
    const paymentMethod = document.getElementById('donationPaymentMethod').value;
    const isAnonymous = document.getElementById('anonymousDonation').checked;
    const donorName = document.getElementById('donationDonorName')?.value.trim() || '';
    const reference = document.getElementById('donationReference')?.value.trim() || '';
    const proofLink = document.getElementById('donationProofLink')?.value.trim() || '';

    const form = document.getElementById('donationForm');
    const feedback = document.getElementById('donationFormFeedback');
    const showError = (message, targetId) => {
        if (feedback) { feedback.textContent = message; feedback.classList.remove('d-none'); }
        const button = document.getElementById('submitDonationButton');
        if (button) { button.disabled = false; button.textContent = 'Send Donation'; }
        form?.classList.add('was-validated');
        document.getElementById(targetId)?.focus();
    };
    if (feedback) { feedback.textContent = ''; feedback.classList.add('d-none'); }
    if (!amount || !paymentMethod) {
        showError('Enter a donation amount and choose a payment method to continue.', !amount ? 'donationAmount' : 'donationPaymentMethod');
        return;
    }
    if (!isAnonymous && !donorName) {
        showError('Enter your name for the receipt, or choose anonymous donation.', 'donationDonorName');
        return;
    }
    if (Number(amount) <= 0) {
        showError('Enter an amount greater than zero.', 'donationAmount');
        return;
    }

    if (paymentMethod === 'mpesaStk') {
        if (!canUseMpesaStk()) {
            showError('M-Pesa STK Push is unavailable on this Vercel setup. Choose Bank Transfer, Normal Transfer, or Cash instead.', 'donationPaymentMethod');
            return;
        }
        startMpesaPayment({
            source: 'donation',
            type: activeCharityAppeal ? 'Charity Appeal' : document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
            amount: amount,
            phone: document.getElementById('donationMpesaPhone').value,
            anonymous: isAnonymous,
            donorName,
            appealId: activeCharityAppeal?.id || '',
            appealTitle: activeCharityAppeal?.title || ''
        });
        return;
    }

    if (paymentMethod !== 'cash' && !reference) {
        showError('Enter the transaction code or bank reference from your payment.', 'donationReference');
        return;
    }

    const transactionRef = reference || `CASH-DON-${Date.now()}`;
    if (paymentMethod !== 'cash' && isDuplicateFinanceReference(transactionRef)) {
        recordSuspiciousActivity('duplicate_donation_reference', { transactionRef, type: 'donation' });
        showError('This transaction reference is already recorded. Check the code or contact the Treasurer.', 'donationReference');
        return;
    }
    if (proofLink && !/^https?:\/\/.+/i.test(proofLink)) {
        showError('Paste a complete proof link beginning with https://, or clear the field.', 'donationProofLink');
        return;
    }
    if (paymentMethod !== 'cash' && !confirm('Before submitting: confirm the transaction reference is correct and you pasted a Google Drive proof link or will send the screenshot by WhatsApp. Continue?')) {
        return;
    }
    const submitButton = document.getElementById('submitDonationButton');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Saving donation…'; }
    readFinanceProof('donationProof')
        .then(proofData => {
            const donation = {
                id: Date.now(),
                type: activeCharityAppeal ? 'Charity Appeal' : document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
                purpose: activeCharityAppeal
                    ? `Charity appeal: ${activeCharityAppeal.title} (Reference: ${activeCharityAppeal.id})`
                    : 'UMMA University Dawah Team donation',
                appealId: activeCharityAppeal?.id || '',
                appealTitle: activeCharityAppeal?.title || '',
                appealReference: activeCharityAppeal?.id || '',
                amount: amount,
                date: new Date().toLocaleDateString(),
                paymentMethod: paymentAccounts[paymentMethod].label,
                transactionRef: transactionRef,
                status: 'Pending Approval',
                anonymous: isAnonymous,
                donor: isAnonymous ? 'Anonymous' : donorName,
                receiptNumber: '',
                proofUrl: proofLink || (proofData ? 'Attached proof' : ''),
                proofMethod: proofLink ? 'Google Drive link' : (proofData ? 'Local attachment' : 'WhatsApp/manual')
            };
            if (frontendOnly) {
                if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.submitPublicDonation) {
                    throw new Error('Online donation recording is not configured. Please contact the Dawah Team before sending payment.');
                }
                return window.SupabaseBackend.submitPublicDonation(donation).then(saved => {
                    donation.supabaseId = saved.supabaseId;
                    saveDonationLocally(donation);
                });
            }
            return fetch('supabase-required-endpoint?action=recordDonation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donor_id: currentUser?.dbUserId || 0,
                    donor_name: donation.donor,
                    donor_email: currentUser?.email || 'anonymous@dawaah.local',
                    amount: amount,
                    donation_type: donation.type,
                    purpose: donation.purpose,
                    appeal_id: donation.appealId,
                    appeal_title: donation.appealTitle,
                    payment_method: donation.paymentMethod,
                    transaction_id: transactionRef,
                    proof_data: proofData,
                    proof_url: proofLink
                })
            })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Could not save donation to database');
                }
                donation.dbDonationId = result.data.donation_id;
                if (result.data.proof_url) donation.proofUrl = result.data.proof_url;
                saveDonationLocally(donation);
            });
        })
        .catch(error => {
            console.error('Donation database error:', error);
            showError(error.message || 'Donation could not be saved online. Check your connection and try again.', 'donationAmount');
        });
}
