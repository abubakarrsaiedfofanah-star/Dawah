// Runtime slice from daawah.js: startMpesaPayment.
function startMpesaPayment(details) {
    const phone = normalizeMpesaPhone(details.phone);
    if (!phone || phone.length !== 12 || !phone.startsWith('254')) {
        const formId = details.source === 'donation' ? 'donationForm' : 'paymentForm';
        const phoneId = details.source === 'donation' ? 'donationMpesaPhone' : 'paymentMpesaPhone';
        showFinanceFormError(formId, 'Enter a valid M-Pesa phone number, for example 254712345678.', phoneId);
        return;
    }

    if (frontendOnly) {
        const message = 'M-Pesa STK Push is unavailable on this Vercel setup. Choose Bank Transfer, Normal Transfer, or Cash instead.';
        if (details.source === 'donation') showFinanceFormError('donationForm', message, 'donationPaymentMethod');
        else showFinanceFormError('paymentForm', message, 'paymentMethod');
        return;
    }

    if (!canUseMpesaStk()) {
        const message = 'M-Pesa STK Push is not ready on this server. Choose Bank Transfer, Normal Transfer, or Cash instead.';
        if (details.source === 'donation') showFinanceFormError('donationForm', message, 'donationPaymentMethod');
        else showFinanceFormError('paymentForm', message, 'paymentMethod');
        return;
    }

    const payload = {
        source: details.source,
        amount: details.amount,
        phone: phone
    };

    if (details.source === 'payment') {
        payload.payment_type = details.type;
    } else {
        payload.donation_type = details.type;
        payload.purpose = details.appealId
            ? `Charity appeal: ${details.appealTitle} (Reference: ${details.appealId})`
            : 'UMMA University Dawah Team donation';
        payload.appeal_id = details.appealId || '';
        payload.appeal_title = details.appealTitle || '';
        payload.donor_id = currentUser?.dbUserId || 0;
        payload.donor_name = details.anonymous ? 'Anonymous' : (details.donorName || currentUser?.name || currentUser?.fullName || currentUser?.username || 'Donor');
        payload.donor_email = currentUser?.email || 'anonymous@dawaah.local';
    }

    const ready = details.source === 'payment'
        ? getCurrentStudentId().then(studentId => ({ ...payload, student_id: studentId }))
        : Promise.resolve(payload);

    ready
        .then(body => fetch('mpesa_supabase-required-endpoint?action=initiateStkPush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not start M-Pesa STK Push');
            }

            const localRecord = {
                type: details.type,
                amount: details.amount,
                date: new Date().toLocaleDateString(),
                status: 'Pending M-Pesa',
                paymentMethod: 'M-Pesa STK Push',
                transactionRef: result.data.checkout_request_id,
                receiptNumber: '',
                checkoutRequestId: result.data.checkout_request_id
            };

            if (details.source === 'payment') {
                localRecord.dbPaymentId = result.data.payment_id;
                payments.push(localRecord);
                localStorage.setItem('payments', JSON.stringify(payments));
                bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
                renderPaymentHistory();
            } else {
                localRecord.purpose = payload.purpose;
                localRecord.appealId = details.appealId || '';
                localRecord.appealTitle = details.appealTitle || '';
                localRecord.appealReference = details.appealId || '';
                localRecord.anonymous = details.anonymous;
                localRecord.donor = payload.donor_name;
                localRecord.dbDonationId = result.data.donation_id;
                donations.push(localRecord);
                localStorage.setItem('donations', JSON.stringify(donations));
                bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
                renderDonationHistory();
            }

            alert('STK Push sent. Enter your M-Pesa PIN on your phone. Receipt will appear after Safaricom confirms payment.');
            pollMpesaStatus(result.data.checkout_request_id, details.source);
        })
        .catch(error => {
            console.error('M-Pesa STK error:', error);
            alert(error.message || 'M-Pesa STK Push failed.');
        });
}
