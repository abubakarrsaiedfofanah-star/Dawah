// Runtime slice from daawah.js: loadAnnouncements.
function loadAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    document.getElementById('announcementManagerPanel')?.classList.toggle('d-none', !hasPermission('create_announcements'));

    const announcementRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAnnouncements'))
        : fetch('admin_firestore-disabled-endpoint?action=getAnnouncements').then(response => parseJsonResponse(response));

    announcementRequest
    .then(result => {
        const announcements = (result.data || []).map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at || ann.published_at ? new Date(ann.created_at || ann.published_at).toLocaleDateString() : 'Recently',
            icon: 'bell'
        }));

        if (announcements.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No announcements have been added yet.</p>';
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5><i class="fas fa-${ann.icon}"></i> ${ann.title}</h5>
                        <small class="text-muted">${ann.time}</small>
                    </div>
                    <p>${ann.text}</p>
                </div>
            </div>
        `).join('');
    })
    .catch(() => {
        const announcements = readList('adminAnnouncements').map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently',
            icon: 'bell'
        }));

        if (announcements.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No announcements have been added yet.</p>';
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5><i class="fas fa-${ann.icon}"></i> ${ann.title}</h5>
                        <small class="text-muted">${ann.time}</small>
                    </div>
                    <p>${ann.text}</p>
                </div>
            </div>
        `).join('');
    });
}
