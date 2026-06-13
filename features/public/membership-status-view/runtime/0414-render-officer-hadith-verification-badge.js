// Runtime slice from daawah.js: renderOfficerHadithVerificationBadge.
function renderOfficerHadithVerificationBadge(status) {
    const value = String(status || 'needs_verification');
    const labels = {
        verified: ['Verified', 'success'],
        draft: ['Draft', 'secondary'],
        needs_verification: ['Needs Verification', 'warning']
    };
    const entry = labels[value] || labels.needs_verification;
    return `<span class="badge bg-${entry[1]}">${entry[0]}</span>`;
}
