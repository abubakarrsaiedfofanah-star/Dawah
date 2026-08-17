// Runtime slice from daawah.js: renderMpesaReadinessPanel.
function renderMpesaReadinessPanel() {
    const panel = document.getElementById('mpesaReadinessPanel');
    if (!panel) return;
    const ready = canUseMpesaStk();
    const caps = hostingCapabilities || {};
    panel.innerHTML = `
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div>
                    <h6 class="mb-1">M-Pesa STK Status</h6>
                    <small class="text-muted">${ready ? 'Live STK Push is available for member payments.' : 'STK Push is not configured here. Manual payment methods remain available.'}</small>
                </div>
                <span class="badge ${ready ? 'bg-success' : 'bg-warning text-dark'}">${ready ? 'Configured' : 'Manual mode'}</span>
            </div>
            <div class="row g-2 mt-3 small">
                <div class="col-6">cURL: <strong>${caps.curl_loaded ? 'Ready' : 'Missing'}</strong></div>
                <div class="col-6">Daraja: <strong>${caps.mpesa_configured ? 'Configured' : 'Not set'}</strong></div>
                <div class="col-12">Callback URL must be public HTTPS and include the optional secret when configured.</div>
            </div>
        </div>
    `;
}
