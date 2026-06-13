// Runtime slice from daawah.js: canUseMpesaStk.
function canUseMpesaStk() {
    return !frontendOnly && hostingCapabilities && hostingCapabilities.mpesa_stk_available === true;
}
