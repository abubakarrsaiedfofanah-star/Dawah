// Runtime slice from daawah.js: processPayment.
function processPayment() {
    const paymentType = document.getElementById('paymentType').value;
    const amount = document.getElementById('paymentAmount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const reference = document.getElementById('paymentReference')?.value.trim() || '';
    const proofLink = document.getElementById('paymentProofLink')?.value.trim() || '';

    if (!paymentType || !amount || !paymentMethod) {
        alert('Please fill in all payment details');
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
            source: 'payment',
            type: paymentType,
            amount: amount,
            phone: document.getElementById('paymentMpesaPhone').value
        });
        return;
    }

    if (paymentMethod !== 'cash' && !reference) {
        alert('Enter the real transaction code or bank reference.');
        return;
    }

    const transactionRef = reference || `CASH-${Date.now()}`;
    if (paymentMethod !== 'cash' && isDuplicateFinanceReference(transactionRef)) {
        recordSuspiciousActivity('duplicate_payment_reference', { transactionRef, type: paymentType });
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
    readFinanceProof('paymentProof')
        .then(proofData => {
            const payment = {
                id: Date.now(),
                type: paymentType,
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'Pending Approval',
                paymentMethod: paymentAccounts[paymentMethod].label,
                transactionRef: transactionRef,
                receiptNumber: '',
                proofUrl: proofLink || (proofData ? 'Attached proof' : ''),
                proofMethod: proofLink ? 'Google Drive link' : (proofData ? 'Local attachment' : 'WhatsApp/manual')
            };
            if (frontendOnly) {
                savePaymentLocally(payment);
                return null;
            }
            return getCurrentStudentId()
        .then(studentId => fetch('firestore-disabled-endpoint?action=recordPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                payment_type: paymentType,
                amount: amount,
                due_date: new Date().toISOString().slice(0, 10),
                payment_method: payment.paymentMethod,
                        transaction_id: transactionRef,
                notes: 'Payment submitted by member and awaiting treasurer confirmation.',
                        proof_data: proofData,
                        proof_url: proofLink
            })
        }))
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not save payment to database');
            }
            payment.dbPaymentId = result.data.payment_id;
                    if (result.data.proof_url) payment.proofUrl = result.data.proof_url;
            savePaymentLocally(payment);
                });
        })
        .catch(error => {
            console.error('Payment database error:', error);
            alert(error.message || 'Payment could not be saved to the database.');
        });
}
