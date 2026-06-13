// Runtime slice from daawah.js: loadOfficerHadiths.
function loadOfficerHadiths() {
    const container = document.getElementById('officerHadithsList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading hadiths...</p>';

    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('supabase-required-endpoint?action=getHadiths', { credentials: 'same-origin' }).then(response => parseJsonResponse(response));

    request
    .then(result => {
        const hadiths = result.data || [];
        if (!hadiths.length) {
            container.innerHTML = '<p class="text-muted mb-0">No hadiths added yet.</p>';
            return;
        }

        container.innerHTML = hadiths.map(hadith => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <p style="font-size: 16px; margin: 10px 0; direction: rtl; font-weight: bold;">
                        <i class="fas fa-quote-left"></i> ${escapeHtml(hadith.arabic || '')}
                    </p>
                    <div class="mb-2">${renderOfficerHadithVerificationBadge(hadith.verification_status)}</div>
                    <p class="mb-2"><strong>English:</strong> ${escapeHtml(hadith.english || '')}</p>
                    ${hadith.reference ? `<p class="mb-1"><strong>Reference:</strong> ${escapeHtml(hadith.reference)}</p>` : ''}
                    ${hadith.source ? `<p class="mb-1"><strong>Source:</strong> ${escapeHtml(hadith.source)}</p>` : ''}
                    ${hadith.category ? `<p class="mb-1"><strong>Category:</strong> <span class="badge bg-info">${escapeHtml(hadith.category)}</span></p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-success" onclick="verifyOfficerHadith(${Number(hadith.id)}, 'verified')">
                        <i class="fas fa-check"></i> Verify
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="verifyOfficerHadith(${Number(hadith.id)}, 'needs_verification')">
                        <i class="fas fa-hourglass-half"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOfficerHadith(${Number(hadith.id)})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Could not load hadiths')}</p>`;
    });
}
