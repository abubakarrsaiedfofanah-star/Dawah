// Runtime slice from admin.js: loadHadiths.
function loadHadiths() {
    fetch(`${API_URL}?action=getHadiths`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('hadithsList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No hadiths added yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(hadith => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <div class="mb-2">${renderHadithVerificationBadge(hadith.verification_status)}</div>
                    <p style="font-size: 16px; margin: 10px 0; direction: rtl; font-weight: bold; color: #333;">
                        <i class="fas fa-quote-left"></i> ${hadith.arabic}
                    </p>
                    <p style="margin: 10px 0;"><strong>English:</strong> ${hadith.english}</p>
                    ${hadith.reference ? `<p style="margin: 5px 0;"><strong>Reference:</strong> ${hadith.reference}</p>` : ''}
                    ${hadith.source ? `<p style="margin: 5px 0;"><strong>Source:</strong> ${hadith.source}</p>` : ''}
                    ${hadith.category ? `<p style="margin: 5px 0;"><strong>Category:</strong> <span class="badge bg-info">${hadith.category}</span></p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-success" title="Mark verified" onclick="verifyHadithItem(${hadith.id}, 'verified')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Needs verification" onclick="verifyHadithItem(${hadith.id}, 'needs_verification')">
                        <i class="fas fa-hourglass-half"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHadithItem(${hadith.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('hadithsList').innerHTML = '<p class="text-danger">Error loading hadiths</p>';
    });
}
