// Runtime slice from daawah.js: pollMpesaStatus.
function pollMpesaStatus(checkoutRequestId, source, attempts = 0) {
    if (attempts > 20) {
        alert('M-Pesa confirmation is taking longer than expected. Check the admin panel or refresh later.');
        return;
    }

    setTimeout(() => {
        fetch(`mpesa_firestore-disabled-endpoint?action=getTransactionStatus&checkout_request_id=${encodeURIComponent(checkoutRequestId)}`)
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (!result.success || !result.data) {
                    pollMpesaStatus(checkoutRequestId, source, attempts + 1);
                    return;
                }

                const tx = result.data;
                if (tx.status === 'completed') {
                    markLocalMpesaCompleted(checkoutRequestId, source, tx.mpesa_receipt || tx.transaction_id);
                    alert('M-Pesa payment confirmed. Receipt is now available.');
                    return;
                }

                if (tx.status === 'failed') {
                    markLocalMpesaFailed(checkoutRequestId, source);
                    alert('M-Pesa payment was not completed.');
                    return;
                }

                pollMpesaStatus(checkoutRequestId, source, attempts + 1);
            })
            .catch(() => pollMpesaStatus(checkoutRequestId, source, attempts + 1));
    }, 3000);
}
