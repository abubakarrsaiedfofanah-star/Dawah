// Runtime slice from daawah.js: showAppUpdateNotice.
function showAppUpdateNotice(versionInfo = {}) {
    const existing = document.getElementById('appUpdateNotice');
    if (existing) existing.remove();
    const notice = document.createElement('div');
    notice.id = 'appUpdateNotice';
    notice.className = 'alert alert-info shadow-sm';
    notice.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1080;max-width:360px;';
    notice.innerHTML = `
        <div class="d-flex gap-2 align-items-start">
            <i class="fas fa-arrows-rotate mt-1"></i>
            <div>
                <strong>App update available</strong>
                <div class="small">${escapeHtml(versionInfo.message || 'Loading the latest version now.')}</div>
            </div>
        </div>
    `;
    document.body.appendChild(notice);
}
