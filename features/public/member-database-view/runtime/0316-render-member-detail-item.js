// Runtime slice from daawah.js: renderMemberDetailItem.
function renderMemberDetailItem(label, value, columnClass = 'col-md-6') {
    return `
        <div class="${columnClass} mb-3">
            <strong>${escapeHtml(label)}:</strong>
            <div>${escapeHtml(value || '-')}</div>
        </div>
    `;
}
