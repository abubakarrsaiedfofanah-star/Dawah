// Runtime slice from admin.js: formatCell.
function formatCell(value, column = '') {
    if (value === null || value === undefined || value === '') return '-';
    const text = String(value);
    if (/amount|total|balance|value|fee|dues|donation|payment/i.test(column) && !Number.isNaN(Number(value))) {
        return formatMoney(value);
    }
    const isPhotoColumn = /photo|image|avatar/i.test(column);
    if ((isPhotoColumn || text.startsWith('data:image/')) && text.startsWith('data:image/')) {
        return `<img src="${text}" alt="Member photo" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,128,0,.18);">`;
    }
    if (isPhotoColumn && (text.startsWith('uploads/') || text.startsWith('http'))) {
        return `<img src="${resolveAdminUrl(text)}" alt="Member photo" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,128,0,.18);">`;
    }
    if (column === 'proof_url' && text.startsWith('uploads/payment_proofs/')) {
        return `<a href="${resolveAdminUrl(text)}" target="_blank">View proof</a>`;
    }
    if (text.startsWith('uploads/') || text.startsWith('http')) {
        return `<a href="${resolveAdminUrl(text)}" target="_blank">Open</a>`;
    }
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
}
