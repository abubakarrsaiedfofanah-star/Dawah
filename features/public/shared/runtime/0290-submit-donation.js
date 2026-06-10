// Runtime slice from daawah.js: submitDonation.
function submitDonation() {
    const amount = document.getElementById('donationAmount').value;
    const paymentMethod = document.getElementById('donationPaymentMethod').value;
    const isAnonymous = document.getElementById('anonymousDonation').checked;
    const reference = document.getElementById('donationReference')?.value.trim() || '';
    const proofLink = document.getElementById('donationProofLink')?.value.trim() || '';

    if (!amount || !paymentMethod) {
        alert('Please enter the donation amount and payment method');
        return;
    }
    if (Number(amount) <= 0) {
        alert('Enter a valid positive amount.');
        return;
    }

    if (paymentMethod === 'mpesaStk') {
        if (!canUseMpesaStk()) {
            alert('M-Pesa STK Push is not available on this hosting setup yet. Please use Bank Transfer, Normal Transfer, or Cash Payment.');
            return;
        }
        startMpesaPayment({
            source: 'donation',
            type: document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
            amount: amount,
            phone: document.getElementById('donationMpesaPhone').value,
            anonymous: isAnonymous
        });
        return;
    }

    if (paymentMethod !== 'cash' && !reference) {
        alert('Enter the real transaction code or bank reference.');
        return;
    }

    const transactionRef = reference || `CASH-DON-${Date.now()}`;
    if (paymentMethod !== 'cash' && isDuplicateFinanceReference(transactionRef)) {
        recordSuspiciousActivity('duplicate_donation_reference', { transactionRef, type: 'donation' });
        alert('This transaction reference is already recorded. Please check the code before submitting again.');
        return;
    }
    if (proofLink && !/^https?:\/\/.+/i.test(proofLink)) {
        alert('Paste a valid Google Drive proof link starting with https://');
        return;
    }
    if (paymentMethod !== 'cash' && !confirm('Before submitting: confirm the transaction reference is correct and you pasted a Google Drive proof link or will send the screenshot by WhatsApp. Continue?')) {
        return;
    }
    readFinanceProof('donationProof')
        .then(proofData => {
            const donation = {
                id: Date.now(),
                type: document.getElementById('donationModalTitle').textContent.replace('Make ', '').replace(' Donation', ''),
                purpose: "UMMA University Da'awah Team donation",
                amount: amount,
                date: new Date().toLocaleDateString(),
                paymentMethod: paymentAccounts[paymentMethod].label,
                transactionRef: transactionRef,
                status: 'Pending Approval',
                anonymous: isAnonymous,
                donor: isAnonymous ? 'Anonymous' : (currentUser?.name || currentUser?.fullName || currentUser?.username || 'Donor'),
                receiptNumber: '',
                proofUrl: proofLink || (proofData ? 'Attached proof' : ''),
                proofMethod: proofLink ? 'Google Drive link' : (proofData ? 'Local attachment' : 'WhatsApp/manual')
            };
            if (frontendOnly) {
                saveDonationLocally(donation);
                return null;
            }
            return fetch('firestore-disabled-endpoint?action=recordDonation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donor_id: currentUser?.dbUserId || 0,
                    donor_name: donation.donor,
                    donor_email: currentUser?.email || 'anonymous@dawaah.local',
                    amount: amount,
                    donation_type: donation.type,
                    purpose: donation.purpose,
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
            alert(error.message || 'Donation could not be saved to the database.');
        });
}
