// Runtime slice from daawah.js: loadHostingCapabilities.
function loadHostingCapabilities() {
    if (frontendOnly) {
        hostingCapabilities = { mpesa_stk_available: false };
        refreshPaymentMethodAvailability();
        return Promise.resolve(hostingCapabilities);
    }

    return fetch('firestore-disabled-endpoint?action=hostingCheck')
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (result.success) {
                hostingCapabilities = result.data || {};
                refreshPaymentMethodAvailability();
            }
            return hostingCapabilities;
        })
        .catch(error => {
            console.warn('Hosting capability check failed:', error);
            hostingCapabilities = { mpesa_stk_available: false };
            refreshPaymentMethodAvailability();
            return hostingCapabilities;
        });
}
