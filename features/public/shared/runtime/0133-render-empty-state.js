// Runtime slice from daawah.js: renderEmptyState.
function renderEmptyState(icon, title, message, actionLabel = '', action = '') {
    return `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h5>${escapeHtml(title)}</h5>
            <p class="text-muted mb-0">${escapeHtml(message)}</p>
            ${actionLabel && action ? `<button type="button" class="btn btn-sm btn-outline-primary mt-3" onclick="${action}">${escapeHtml(actionLabel)}</button>` : ''}
        </div>
    `;
}
